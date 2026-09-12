from pydantic import BaseModel, EmailStr

from app.models.enums import UserRole


class LoginIn(BaseModel):
    identifier: str  # email OR username
    password: str


class TokenOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: UserRole


class RefreshIn(BaseModel):
    refresh_token: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    username: str | None
    role: UserRole
    is_active: bool

    model_config = {"from_attributes": True}


class PasswordChangeIn(BaseModel):
    current_password: str
    new_password: str
