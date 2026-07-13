import secrets
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.verification import PasswordReset
from app.schemas.password import ForgotPasswordRequest, ResetPasswordRequest
from app.utils.security import hash_password
from app.utils.email import send_password_reset_email, send_password_changed_email

router = APIRouter()

FRONTEND_RESET_URL = "https://meu-site-teste-gamma.vercel.app/redefinir-senha"


def send_reset_email_safe(email: str, link: str):
    try:
        send_password_reset_email(email, link)
    except Exception as e:
        print(f"Erro ao enviar e-mail de reset: {e}")


def send_changed_email_safe(email: str):
    try:
        send_password_changed_email(email)
    except Exception as e:
        print(f"Erro ao enviar e-mail de confirmação: {e}")


@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        return {"message": "Se o e-mail existir, você receberá um link de recuperação"}

    token = secrets.token_urlsafe(32)
    reset = PasswordReset(
        user_id=user.id,
        token=token,
        expires_at=datetime.utcnow() + timedelta(minutes=30),
    )
    db.add(reset)
    db.commit()

    reset_link = f"{FRONTEND_RESET_URL}?token={token}"
    background_tasks.add_task(send_reset_email_safe, user.email, reset_link)

    return {"message": "Se o e-mail existir, você receberá um link de recuperação"}


@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    reset = (
        db.query(PasswordReset)
        .filter(PasswordReset.token == data.token, PasswordReset.used == False)
        .first()
    )

    if not reset:
        raise HTTPException(status_code=400, detail="Token inválido")

    if datetime.utcnow() > reset.expires_at.replace(tzinfo=None):
        raise HTTPException(status_code=400, detail="Token expirado")

    user = db.query(User).filter(User.id == reset.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    user.hashed_password = hash_password(data.new_password)
    reset.used = True
    db.commit()

    background_tasks.add_task(send_changed_email_safe, user.email)

    return {"message": "Senha redefinida com sucesso"}
