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
    ("Bangla 1st Paper", "BAN1"),
    ("Bangla 2nd Paper", "BAN2"),
    ("English 1st Paper", "ENG1"),
    ("English 2nd Paper", "ENG2"),
    ("Mathematics", "MATH"),
    ("Science", "SCI"),
    ("Physics", "PHY"),
    ("Chemistry", "CHEM"),
    ("Biology", "BIO"),
    ("Higher Mathematics", "HMATH"),
    ("Bangladesh & Global Studies", "BGS"),
    ("History of Bangladesh & World Civilization", "HIST"),
    ("Geography & Environment", "GEO"),
    ("Civics & Citizenship", "CIV"),
    ("Economics", "ECON"),
    ("Accounting", "ACC"),
    ("Finance & Banking", "FIN"),
    ("Business Entrepreneurship", "BEnt"),
    ("Information & Communication Technology", "ICT"),
    ("Religion & Moral Education", "REL"),
    ("Physical Education, Health Science & Sports", "PE"),
    ("Career Education", "Career"),
    ("Arts & Crafts", "Art"),
]

DEFAULT_DEPARTMENTS = [
    "Science",
    "Mathematics",
    "Bangla",
    "English",
    "Humanities",
    "Business Studies",
    "ICT",
    "Religion",
    "Physical Education",
    "Career Education",
    "Arts & Crafts",
]

PERIODS_PER_DAY = 6
CLASSES = [6, 7, 8, 9]
MAX_PERIODS_PER_TEACHER = 4


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
