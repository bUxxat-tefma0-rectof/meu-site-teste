import random
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.verification import EmailVerification
from app.schemas.user import (
    UserCreate, UserLogin, UserResponse, Token,
    VerifyEmailRequest, ResendCodeRequest
)
from app.utils.security import hash_password, verify_password, create_access_token
from app.utils.email import send_verification_code_email

router = APIRouter()


def generate_code() -> str:
    return str(random.randint(100000, 999999))


def send_email_safe(email: str, code: str):
    try:
        send_verification_code_email(email, code)
    except Exception as e:
        print(f"Erro ao enviar e-mail: {e}")


@router.post("/register", response_model=UserResponse)
def register(user_data: UserCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")

    existing_username = db.query(User).filter(User.username == user_data.username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Nome de usuário já em uso")

    new_user = User(
        full_name=user_data.full_name,
        username=user_data.username,
        email=user_data.email,
        country_code=user_data.country_code,
        phone=user_data.phone,
        how_found_us=user_data.how_found_us,
        terms_accepted=user_data.terms_accepted,
        hashed_password=hash_password(user_data.password),
        is_verified=False,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    code = generate_code()
    verification = EmailVerification(
        user_id=new_user.id,
        code=code,
        expires_at=datetime.utcnow() + timedelta(minutes=10),
    )
    db.add(verification)
    db.commit()

    background_tasks.add_task(send_email_safe, new_user.email, code)

    return new_user


@router.post("/verify-email")
def verify_email(data: VerifyEmailRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    if user.is_verified:
        return {"message": "E-mail já verificado"}

    verification = (
        db.query(EmailVerification)
        .filter(EmailVerification.user_id == user.id, EmailVerification.used == False)
        .order_by(EmailVerification.created_at.desc())
        .first()
    )

    if not verification:
        raise HTTPException(status_code=400, detail="Nenhum código pendente")

    if verification.attempts >= 5:
        raise HTTPException(status_code=400, detail="Limite de tentativas excedido")

    if datetime.utcnow() > verification.expires_at.replace(tzinfo=None):
        raise HTTPException(status_code=400, detail="Código expirado")

    if verification.code != data.code:
        verification.attempts += 1
        db.commit()
        raise HTTPException(status_code=400, detail="Código inválido")

    verification.used = True
    user.is_verified = True
    db.commit()

    return {"message": "E-mail verificado com sucesso"}


@router.post("/resend-code")
def resend_code(data: ResendCodeRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    if user.is_verified:
        return {"message": "E-mail já verificado"}

    code = generate_code()
    verification = EmailVerification(
        user_id=user.id,
        code=code,
        expires_at=datetime.utcnow() + timedelta(minutes=10),
    )
    db.add(verification)
    db.commit()

    background_tasks.add_task(send_email_safe, user.email, code)

    return {"message": "Novo código enviado"}


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos")

    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Confirme seu e-mail antes de entrar")

    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}
