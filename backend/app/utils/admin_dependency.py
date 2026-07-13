from fastapi import Depends, HTTPException
from app.models.user import User
from app.utils.auth_dependency import get_current_user


def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Acesso restrito a administradores")
    return current_user
