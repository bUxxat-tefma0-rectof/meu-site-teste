import secrets
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.verification import PasswordReset
from app.schemas.password import ForgotPasswordRequest, ResetPasswordRequest
from app.utils.security import hash_password
from app.utils.email import send_password_reset_email, send_password_changed_email

router = APIRouter()

FRONTEND_RESET_URL = "http://localhost:5173/redefinir-senha"


@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
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
    send_password_reset_email(user.email, reset_link)

    return {"message": "Se o e-mail existir, você receberá um link de recuperação"}


@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
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

    send_password_changed_email(user.email)

    return {"message": "Senha redefinida com sucesso"}
