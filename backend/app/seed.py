"""Seed baseline: fee types, subjects, admin user. Idempotent.

Usage (PowerShell, from backend/):
  $env:DATABASE_URL="postgresql+psycopg://aonontojahan:YOUR_PW@localhost:5432/sms_db"
  python -m app.seed
Admin credentials come from env: ADMIN_EMAIL / ADMIN_PASSWORD (defaults shown, change immediately).
"""
import os

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.academic import Subject
from app.models.enums import FeeTypeName, UserRole
from app.models.fee import FeeType
from app.models.user import User

DEFAULT_SUBJECTS = [
    ("Mathematics", "MATH"),
    ("English", "ENG"),
    ("Physics", "PHY"),
    ("Chemistry", "CHEM"),
    ("Biology", "BIO"),
    ("ICT", "ICT"),
    ("Bangla", "BAN"),
]


def seed(db: Session) -> None:
    for name in FeeTypeName:
        if not db.query(FeeType).filter(FeeType.name == name).first():
            db.add(FeeType(name=name, description=f"{name.value.title()} fee"))
    for name, code in DEFAULT_SUBJECTS:
        if not db.query(Subject).filter(Subject.code == code).first():
            db.add(Subject(name=name, code=code))
    email = os.getenv("ADMIN_EMAIL", "admin@school.edu")
    password = os.getenv("ADMIN_PASSWORD", "Admin123!")
    if not db.query(User).filter(User.email == email).first():
        db.add(User(email=email, hashed_password=hash_password(password), role=UserRole.ADMIN, is_active=True))
        print(f"Created admin: {email}")
    else:
        print(f"Admin exists: {email}")
    db.commit()


if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)  # safety for fresh DB; Alembic is canonical
    with SessionLocal() as session:
        seed(session)
    print("Seed complete.")
