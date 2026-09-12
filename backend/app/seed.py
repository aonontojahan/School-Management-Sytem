"""Seed baseline: academic year, classes, sections, fee types, subjects, admin user. Idempotent.

Usage (PowerShell, from backend/):
  $env:DATABASE_URL="postgresql+psycopg://aonontojahan:YOUR_PW@localhost:5432/sms_db"
  python -m app.seed
Admin credentials come from env: ADMIN_EMAIL / ADMIN_PASSWORD (defaults shown, change immediately).
"""
import os
from datetime import date

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.academic import AcademicYear, SchoolClass, Section, Subject
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
CLASS_NAMES = ["Nursery", "Play", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]
MAX_PERIODS_PER_TEACHER = 4


def seed(db: Session) -> None:
    # Fee types
    for name in FeeTypeName:
        if not db.query(FeeType).filter(FeeType.name == name).first():
            db.add(FeeType(name=name, description=f"{name.value.title()} fee"))

    # Subjects
    for name, code in DEFAULT_SUBJECTS:
        if not db.query(Subject).filter(Subject.code == code).first():
            db.add(Subject(name=name, code=code))

    # Academic year (current year)
    year_name = str(date.today().year)
    year = db.query(AcademicYear).filter(AcademicYear.name == year_name).first()
    if not year:
        year = AcademicYear(
            name=year_name,
            start_date=date(date.today().year, 1, 1),
            end_date=date(date.today().year, 12, 31),
            is_active=True,
        )
        db.add(year)
        db.flush()

    # Classes
    for cls_name in CLASS_NAMES:
        code = f"C{cls_name}-{year_name}"
        if not db.query(SchoolClass).filter(SchoolClass.code == code).first():
            cls = SchoolClass(academic_year_id=year.id, name=f"Class {cls_name}" if cls_name.isdigit() else cls_name, code=code)
            db.add(cls)
            db.flush()
            # Default sections A, B for each class
            for sec_name in ["A", "B"]:
                if not db.query(Section).filter(Section.class_id == cls.id, Section.name == sec_name).first():
                    db.add(Section(class_id=cls.id, name=sec_name))

    # Admin user
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
