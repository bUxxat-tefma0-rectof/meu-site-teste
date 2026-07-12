from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Banco de dados
    DATABASE_URL: str

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # E-mail
    SMTP_HOST: str
    SMTP_PORT: int
    SMTP_USER: str
    SMTP_PASSWORD: str

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Pagamentos
    MERCADOPAGO_ACCESS_TOKEN: str = ""
    STRIPE_SECRET_KEY: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
