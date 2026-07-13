from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from typing import Optional
import re


class UserCreate(BaseModel):
    full_name: str
    username: str
    email: EmailStr
    country_code: str = "+55"
    phone: Optional[str] = None
    password: str
    how_found_us: Optional[str] = None
    terms_accepted: bool

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
        if len(v) < 8:
            raise ValueError('Senha precisa ter pelo menos 8 caracteres')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Senha precisa ter pelo menos uma letra maiúscula')
        if not re.search(r'[a-z]', v):
            raise ValueError('Senha precisa ter pelo menos uma letra minúscula')
        if not re.search(r'[0-9]', v):
            raise ValueError('Senha precisa ter pelo menos um número')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>_\-]', v):
            raise ValueError('Senha precisa ter pelo menos um caractere especial (ex: . @ ! #)')
        return v

    @field_validator('terms_accepted')
    @classmethod
    def validate_terms(cls, v):
        if not v:
            raise ValueError('Você precisa aceitar os termos e a política de privacidade')
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    full_name: str
    username: str
    email: str
    country_code: str
    phone: Optional[str]
    how_found_us: Optional[str]
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
