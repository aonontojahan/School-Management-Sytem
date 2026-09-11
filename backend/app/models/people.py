"""Student / Teacher / Guardian profiles + student-guardian link."""
from datetime import date, datetime

from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Table, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import Gender, PersonStatus

student_guardian = Table(
    "student_guardian",
    Base.metadata,
    Column("student_id", ForeignKey("student_profiles.id", ondelete="CASCADE"), primary_key=True),
    Column("guardian_id", ForeignKey("guardian_profiles.id", ondelete="CASCADE"), primary_key=True),
)


class StudentProfile(Base):
    __tablename__ = "student_profiles"
    __table_args__ = (UniqueConstraint("class_id", "section_id", "roll_number", name="uq_class_section_roll"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), unique=True)
    student_code: Mapped[str] = mapped_column(String(32), unique=True, index=True)  # e.g. STU-2026-0001
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    date_of_birth: Mapped[date | None] = mapped_column(Date)
    gender: Mapped[Gender | None] = mapped_column(default=None)
    email: Mapped[str | None] = mapped_column(String(255), unique=True)
    phone: Mapped[str | None] = mapped_column(String(32))
    address: Mapped[str | None] = mapped_column(String(500))
    admission_date: Mapped[date | None] = mapped_column(Date)
    class_id: Mapped[int | None] = mapped_column(ForeignKey("classes.id", ondelete="SET NULL"), index=True)
    section_id: Mapped[int | None] = mapped_column(ForeignKey("sections.id", ondelete="SET NULL"), index=True)
    roll_number: Mapped[int | None] = mapped_column(Integer)
    status: Mapped[PersonStatus] = mapped_column(default=PersonStatus.ACTIVE)
    profile_photo_url: Mapped[str | None] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User | None"] = relationship(back_populates="student_profile")
    school_class: Mapped["SchoolClass | None"] = relationship(back_populates="students")
    section: Mapped["Section | None"] = relationship(back_populates="students")
    guardians: Mapped[list["GuardianProfile"]] = relationship(
        secondary=student_guardian, back_populates="students"
    )
    attendances: Mapped[list["Attendance"]] = relationship(
        back_populates="student", cascade="all, delete-orphan"
    )
    results: Mapped[list["Mark"]] = relationship(back_populates="student", cascade="all, delete-orphan")
    fee_invoices: Mapped[list["FeeInvoice"]] = relationship(
        back_populates="student", cascade="all, delete-orphan"
    )
    submissions: Mapped[list["AssignmentSubmission"]] = relationship(
        back_populates="student", cascade="all, delete-orphan"
    )


class TeacherProfile(Base):
    __tablename__ = "teacher_profiles"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), unique=True)
    teacher_code: Mapped[str] = mapped_column(String(32), unique=True, index=True)  # e.g. TCH-0001
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str | None] = mapped_column(String(255), unique=True)
    phone: Mapped[str | None] = mapped_column(String(32))
    department: Mapped[str | None] = mapped_column(String(100))
    joining_date: Mapped[date | None] = mapped_column(Date)
    designation: Mapped[str | None] = mapped_column(String(100))
    status: Mapped[PersonStatus] = mapped_column(default=PersonStatus.ACTIVE)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User | None"] = relationship(back_populates="teacher_profile")
    subjects: Mapped[list["Subject"]] = relationship(secondary="teacher_subjects", back_populates="teachers")
    sections: Mapped[list["Section"]] = relationship(secondary="teacher_sections", back_populates="teachers")
    assignments: Mapped[list["Assignment"]] = relationship(back_populates="teacher")


class GuardianProfile(Base):
    __tablename__ = "guardian_profiles"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), unique=True)
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str | None] = mapped_column(String(255), unique=True)
    phone: Mapped[str | None] = mapped_column(String(32))
    address: Mapped[str | None] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User | None"] = relationship(back_populates="guardian_profile")
    students: Mapped[list[StudentProfile]] = relationship(
        secondary=student_guardian, back_populates="guardians"
    )
