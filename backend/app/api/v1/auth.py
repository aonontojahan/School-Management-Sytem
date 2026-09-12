import hashlib
import secrets
from datetime import timedelta, timezone, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_current_user
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    hash_password,
    verify_password,
)
from app.db.session import get_db
from app.models.user import RefreshToken, User
from app.schemas.auth import LoginIn, PasswordChangeIn, RefreshIn, TokenOut, UserOut
import jwt

router = APIRouter(prefix="/auth", tags=["auth"])


def _store_refresh(db: Session, user: User, token: str) -> None:
    h = hashlib.sha256(token.encode()).hexdigest()
    expires = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    db.add(RefreshToken(user_id=user.id, token_hash=h, expires_at=expires, revoked=False))
    db.commit()


@router.post("/login", response_model=TokenOut)
def login(data: LoginIn, db: Session = Depends(get_db)):
    ident = data.identifier.strip()
    user = (
        db.query(User)
        .filter(or_(User.email == ident, User.username == ident))
        .first()
    )
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")
    if not user.is_active:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Account deactivated")
    access = create_access_token(str(user.id), user.role.value)
    refresh = create_refresh_token(str(user.id))
    _store_refresh(db, user, refresh)
    return TokenOut(access_token=access, refresh_token=refresh, role=user.role)


@router.post("/refresh", response_model=TokenOut)
def refresh(data: RefreshIn, db: Session = Depends(get_db)):
    try:
        payload = decode_refresh_token(data.refresh_token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Refresh token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid refresh token")
    h = hashlib.sha256(data.refresh_token.encode()).hexdigest()
    stored = db.query(RefreshToken).filter(RefreshToken.token_hash == h).first()
    if not stored or stored.revoked:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Refresh token revoked")
    user = db.get(User, int(payload["sub"]))
    if not user or not user.is_active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Inactive account")
    stored.revoked = True
    db.commit()
    access = create_access_token(str(user.id), user.role.value)
    new_refresh = create_refresh_token(str(user.id))
    _store_refresh(db, user, new_refresh)
    return TokenOut(access_token=access, refresh_token=new_refresh, role=user.role)


@router.post("/logout")
def logout(data: RefreshIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    h = hashlib.sha256(data.refresh_token.encode()).hexdigest()
    stored = db.query(RefreshToken).filter(RefreshToken.token_hash == h).first()
    if stored:
        stored.revoked = True
        db.commit()
    return {"message": "Logged out"}


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@router.post("/change-password")
def change_password(data: PasswordChangeIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if not verify_password(data.current_password, user.hashed_password):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Current password incorrect")
    if len(data.new_password) < 8:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "New password must be >= 8 chars")
    user.hashed_password = hash_password(data.new_password)
    db.commit()
    return {"message": "Password changed"}
