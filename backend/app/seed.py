"""Seed baseline: academic year, classes, sections, fee types, subjects, admin user. Idempotent.

Usage (PowerShell, from backend/):
  $env:DATABASE_URL="postgresql+psycopg://aonontojahan:YOUR_PW@localhost:5432/sms_db"
  python -m app.seed
Admin credentials come from env: ADMIN_EMAIL / ADMIN_PASSWORD (defaults shown, change immediately).
"""
import os
from datetime import date, time

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.academic import AcademicYear, SchoolClass, Section, Subject
from app.models.enums import FeeTypeName, UserRole
from app.models.fee import FeeType
from app.models.routine import Period
from app.models.user import User

DEFAULT_SUBJECTS = [
    ("Bangla", "BAN"),
    ("Bangla 1st Paper", "BAN1"),
    ("Bangla 2nd Paper", "BAN2"),
    ("English", "ENG"),
    ("English 1st Paper", "ENG1"),
    ("English 2nd Paper", "ENG2"),
    ("Mathematics", "MATH"),
    ("General Knowledge", "GK"),
    ("Drawing", "DRAW"),
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
    ("Religion", "REL"),
    ("Religion & Moral Education", "RELM"),
    ("Physical Education", "PE"),
    ("Physical Education, Health Science & Sports", "PEHS"),
    ("Career Education", "Career"),
    ("Arts & Crafts", "Art"),
]

# Subject-to-class mapping: class_name -> list of subject codes
# For classes without groups (Nursery-8)
CLASS_SUBJECTS = {
    "Nursery": ["BAN", "ENG", "MATH", "GK", "DRAW", "REL"],
    "Play": ["BAN", "ENG", "MATH", "GK", "DRAW", "REL"],
    "1": ["BAN", "ENG", "MATH", "SCI", "BGS", "REL", "ICT", "PE", "DRAW"],
    "2": ["BAN", "ENG", "MATH", "SCI", "BGS", "REL", "ICT", "PE", "DRAW"],
    "3": ["BAN", "ENG", "MATH", "SCI", "BGS", "REL", "ICT", "PE", "DRAW"],
    "4": ["BAN", "ENG", "MATH", "SCI", "BGS", "REL", "ICT", "PE", "DRAW"],
    "5": ["BAN", "ENG", "MATH", "SCI", "BGS", "REL", "ICT", "PE", "DRAW"],
    "6": ["BAN1", "BAN2", "ENG1", "ENG2", "MATH", "SCI", "BGS", "ICT", "RELM", "PEHS", "Career", "Art"],
    "7": ["BAN1", "BAN2", "ENG1", "ENG2", "MATH", "SCI", "BGS", "ICT", "RELM", "PEHS", "Career", "Art"],
    "8": ["BAN1", "BAN2", "ENG1", "ENG2", "MATH", "SCI", "BGS", "ICT", "RELM", "PEHS", "Career", "Art"],
}

# For classes 9-10: group -> list of subject codes
GROUP_SUBJECTS = {
    "SCIENCE": ["BAN1", "BAN2", "ENG1", "ENG2", "MATH", "PHY", "CHEM", "BIO", "HMATH", "ICT", "RELM", "Career", "PEHS"],
    "HUMANITIES": ["BAN1", "BAN2", "ENG1", "ENG2", "MATH", "HIST", "GEO", "CIV", "ECON", "ICT", "RELM", "Career", "PEHS"],
    "BUSINESS_STUDIES": ["BAN1", "BAN2", "ENG1", "ENG2", "MATH", "ACC", "FIN", "BEnt", "ICT", "RELM", "Career", "PEHS"],
}

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

CLASS_NAMES = ["Nursery", "Play", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]

# Default periods: 9:00 AM - 3:00 PM, 6 hours, 6 periods (1 hour each)
DEFAULT_PERIODS = [
    (1, "Period 1", time(9, 0), time(10, 0)),
    (2, "Period 2", time(10, 0), time(11, 0)),
    (3, "Period 3", time(11, 0), time(12, 0)),
    (4, "Period 4", time(12, 0), time(13, 0)),
    (5, "Period 5", time(13, 0), time(14, 0)),
    (6, "Period 6", time(14, 0), time(15, 0)),
]


def seed(db: Session) -> None:
    # Fee types
    for name in FeeTypeName:
        if not db.query(FeeType).filter(FeeType.name == name).first():
            db.add(FeeType(name=name, description=f"{name.value.title()} fee"))

    # Subjects — upsert by name or code
    for name, code in DEFAULT_SUBJECTS:
        existing = db.query(Subject).filter((Subject.code == code) | (Subject.name == name)).first()
        if existing:
            # Update code/name if changed
            if existing.code != code:
                existing.code = code
            if existing.name != name:
                existing.name = name
        else:
            db.add(Subject(name=name, code=code))
    db.flush()

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

    # Default periods — delete old ones and recreate
    existing_periods = db.query(Period).filter(Period.academic_year_id == year.id).all()
    if len(existing_periods) != len(DEFAULT_PERIODS):
        for p in existing_periods:
            db.delete(p)
        db.flush()
        for num, label, start, end in DEFAULT_PERIODS:
            db.add(Period(
                academic_year_id=year.id,
                period_number=num,
                label=label,
                start_time=start,
                end_time=end,
            ))
    else:
        for num, label, start, end in DEFAULT_PERIODS:
            p = db.query(Period).filter(Period.academic_year_id == year.id, Period.period_number == num).first()
            if p and (p.start_time != start or p.end_time != end or p.label != label):
                p.label = label
                p.start_time = start
                p.end_time = end

    # Classes + sections + subject assignments
    for sort_idx, cls_name in enumerate(CLASS_NAMES):
        display_name = f"Class {cls_name}" if cls_name.isdigit() else cls_name
        code = f"C{cls_name}-{year_name}"
        cls = db.query(SchoolClass).filter(SchoolClass.code == code).first()
        if not cls:
            cls = SchoolClass(academic_year_id=year.id, name=display_name, code=code, sort_order=sort_idx)
            db.add(cls)
            db.flush()
        elif cls.sort_order != sort_idx:
            cls.sort_order = sort_idx

        # Default sections A, B
        for sec_name in ["A", "B"]:
            if not db.query(Section).filter(Section.class_id == cls.id, Section.name == sec_name).first():
                db.add(Section(class_id=cls.id, name=sec_name))

        # Assign subjects to class
        subject_codes = CLASS_SUBJECTS.get(cls_name, [])
        if subject_codes:
            existing_ids = {s.id for s in cls.subjects}
            for sc in subject_codes:
                subj = db.query(Subject).filter(Subject.code == sc).first()
                if subj and subj.id not in existing_ids:
                    cls.subjects.append(subj)

        # For classes 9-10, assign group subjects
        if cls_name in ("9", "10"):
            for group_name, codes in GROUP_SUBJECTS.items():
                for sc in codes:
                    subj = db.query(Subject).filter(Subject.code == sc).first()
                    if subj:
                        from sqlalchemy import text
                        result = db.execute(
                            text("SELECT 1 FROM class_group_subjects WHERE class_id=:cid AND group_name=:gn AND subject_id=:sid"),
                            {"cid": cls.id, "gn": group_name, "sid": subj.id},
                        )
                        if not result.first():
                            db.execute(
                                text("INSERT INTO class_group_subjects (class_id, group_name, subject_id) VALUES (:cid, :gn, :sid)"),
                                {"cid": cls.id, "gn": group_name, "sid": subj.id},
                            )

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
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as session:
        seed(session)
    print("Seed complete.")
