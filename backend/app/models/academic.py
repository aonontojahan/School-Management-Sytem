"""Academic structure: Year -> Class -> Section, Subjects + assignments."""
from datetime import date, datetime

from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, Integer, String, Table, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

class_subjects = Table(
    "class_subjects",
    Base.metadata,
    Column("class_id", ForeignKey("classes.id", ondelete="CASCADE"), primary_key=True),
    Column("subject_id", ForeignKey("subjects.id", ondelete="CASCADE"), primary_key=True),
)

teacher_subjects = Table(
    "teacher_subjects",
    Base.metadata,
    Column("teacher_id", ForeignKey("teacher_profiles.id", ondelete="CASCADE"), primary_key=True),
    Column("subject_id", ForeignKey("subjects.id", ondelete="CASCADE"), primary_key=True),
)

teacher_sections = Table(
    "teacher_sections",
    Base.metadata,
    Column("teacher_id", ForeignKey("teacher_profiles.id", ondelete="CASCADE"), primary_key=True),
    Column("section_id", ForeignKey("sections.id", ondelete="CASCADE"), primary_key=True),
)


class AcademicYear(Base):
    __tablename__ = "academic_years"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(32), unique=True)  # e.g. "2026"
    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[date] = mapped_column(Date)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)

    classes: Mapped[list["SchoolClass"]] = relationship(back_populates="academic_year")
    exams: Mapped[list["Exam"]] = relationship(back_populates="academic_year")


class SchoolClass(Base):
    """`classes` table. Named SchoolClass to avoid clash with `class` keyword."""

    __tablename__ = "classes"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    academic_year_id: Mapped[int] = mapped_column(ForeignKey("academic_years.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(64))  # e.g. "Class 8"
    code: Mapped[str] = mapped_column(String(32), unique=True)  # e.g. "C8-2026"
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (UniqueConstraint("academic_year_id", "name", name="uq_year_class_name"),)

    academic_year: Mapped[AcademicYear] = relationship(back_populates="classes")
    sections: Mapped[list["Section"]] = relationship(back_populates="school_class", cascade="all, delete-orphan")
    students: Mapped[list["StudentProfile"]] = relationship(back_populates="school_class")
    subjects: Mapped[list["Subject"]] = relationship(secondary=class_subjects, back_populates="classes")
    exams: Mapped[list["Exam"]] = relationship(back_populates="school_class")


class Section(Base):
    __tablename__ = "sections"
    __table_args__ = (UniqueConstraint("class_id", "name", name="uq_class_section_name"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    class_id: Mapped[int] = mapped_column(ForeignKey("classes.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(16))  # e.g. "A"
    capacity: Mapped[int] = mapped_column(Integer, default=50)

    school_class: Mapped[SchoolClass] = relationship(back_populates="sections")
    students: Mapped[list["StudentProfile"]] = relationship(back_populates="section")
    teachers: Mapped[list["TeacherProfile"]] = relationship(
        secondary=teacher_sections, back_populates="sections"
    )


class Subject(Base):
    __tablename__ = "subjects"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(64), unique=True)  # Mathematics, English, ...
    code: Mapped[str] = mapped_column(String(16), unique=True)  # MATH, ENG, ...
    description: Mapped[str | None] = mapped_column(String(500))

    classes: Mapped[list[SchoolClass]] = relationship(secondary=class_subjects, back_populates="subjects")
    teachers: Mapped[list["TeacherProfile"]] = relationship(
        secondary=teacher_subjects, back_populates="subjects"
    )
