from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from typing import Optional
import re


class UserCreate(BaseModel):
    full_name: str
    username: str
    email: EmailStr
    phone: Optional[str] = None
    password: str

    @field_validator('full_name')
    @classmethod
    def validate_full_name(cls, v):
        v = v.strip()
        if len(v) < 3:
            raise ValueError('Nome precisa ter pelo menos 3 caracteres')
        if not re.match(r'^[A-Za-zÀ-ÿ\s]+$', v):
            raise ValueError('Nome deve conter apenas letras e espaços')
        if len(v.split()) < 2:
            raise ValueError('Digite nome e sobrenome')
        return ' '.join(word.capitalize() for word in v.split())

    @field_validator('username')
    @classmethod
    def validate_username(cls, v):
        v = v.strip().lower()
        if len(v) < 3:
            raise ValueError('Usuário precisa ter pelo menos 3 caracteres')
        if not re.match(r'^[a-z0-9_]+$', v):
            raise ValueError('Usuário deve conter apenas letras minúsculas, números e underline')
        return v

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        if v is None or v == '':
            return v
        digits = re.sub(r'\D', '', v)
        if len(digits) not in (10, 11):
            raise ValueError('Telefone inválido. Use DDD + número (ex: 11999999999)')
        return digits

    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Senha precisa ter pelo menos 6 caracteres')
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    full_name: str
    username: str
    email: str
    phone: Optional[str]
    is_verified: bool
    photo_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class VerifyEmailRequest(BaseModel):
    email: EmailStr
    code: str


class ResendCodeRequest(BaseModel):
    email: EmailStr
