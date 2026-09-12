"""Admin-only user management (account status, role accounts).

The admin creates every login with an email, a username and a password,
then links it to a teacher/student profile created with the same email.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import require_admin
from app.core.security import hash_password
from app.db.session import get_db
from app.models.enums import UserRole
from app.models.people import StudentProfile, TeacherProfile
from app.models.user import User
from app.schemas.auth import PasswordResetIn, UserOut
from app.schemas.people import UserCreate

router = APIRouter(prefix="/users", tags=["users"], dependencies=[Depends(require_admin)])

ALLOWED_ROLES = {UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT}


def _link_profile(db: Session, user: User, profile, kind: str) -> None:
    if profile.user_id is not None and profile.user_id != user.id:
        raise HTTPException(400, f"{kind} profile is already linked to another login")
    if profile.email and user.email and profile.email.lower() != user.email.lower():
        raise HTTPException(400, f"{kind} profile email must match the login email")
    profile.user_id = user.id


@router.get("", response_model=list[UserOut])
def list_users(role: UserRole | None = None, db: Session = Depends(get_db)):
    q = db.query(User)
    if role:
        q = q.filter(User.role == role)
    return q.order_by(User.id).all()


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(data: UserCreate, db: Session = Depends(get_db)):
    try:
        role = UserRole(data.role)
    except ValueError:
        raise HTTPException(400, f"Invalid role. Allowed: {[r.value for r in ALLOWED_ROLES]}")
    if role not in ALLOWED_ROLES:
        raise HTTPException(400, f"Invalid role. Allowed: {[r.value for r in ALLOWED_ROLES]}")
    username = data.username.strip()
    if len(username) < 3:
        raise HTTPException(400, "Username must be at least 3 characters")
    if len(data.password) < 8:
        raise HTTPException(400, "Password must be at least 8 characters")
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(400, "Email already exists")
    if db.query(User).filter(User.username == username).first():
        raise HTTPException(400, "Username already exists")
    user = User(email=data.email, username=username, hashed_password=hash_password(data.password), role=role, is_active=data.is_active)
    db.add(user)
    db.flush()  # assign user.id so profiles can link before commit
    if data.teacher_profile_id is not None:
        if role != UserRole.TEACHER:
            raise HTTPException(400, "teacher_profile_id requires role TEACHER")
        profile = db.get(TeacherProfile, data.teacher_profile_id)
        if not profile:
            raise HTTPException(404, "Teacher profile not found")
        _link_profile(db, user, profile, "Teacher")
    if data.student_profile_id is not None:
        if role != UserRole.STUDENT:
            raise HTTPException(400, "student_profile_id requires role STUDENT")
        profile = db.get(StudentProfile, data.student_profile_id)
        if not profile:
            raise HTTPException(404, "Student profile not found")
        _link_profile(db, user, profile, "Student")
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}/status", response_model=UserOut)
def set_status(user_id: int, is_active: bool = Query(...), db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    user.is_active = is_active
    db.commit()
    db.refresh(user)
    return user


@router.patch("/{user_id}/password", response_model=UserOut)
def reset_password(user_id: int, data: PasswordResetIn, db: Session = Depends(get_db)):
    """Admin resets any login password (e.g. forgotten by a student/teacher)."""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    if len(data.new_password) < 8:
        raise HTTPException(400, "New password must be at least 8 characters")
    user.hashed_password = hash_password(data.new_password)
    db.commit()
    db.refresh(user)
    return user
