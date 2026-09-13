"""Exams + marks/results + exam routines. Grades are computed server-side from spec bands."""
from datetime import date, datetime, time

from sqlalchemy import Date, DateTime, Float, ForeignKey, String, Time, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import ExamType


class Exam(Base):
    __tablename__ = "exams"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    academic_year_id: Mapped[int] = mapped_column(
        ForeignKey("academic_years.id", ondelete="CASCADE"), index=True
    )
    class_id: Mapped[int | None] = mapped_column(ForeignKey("classes.id", ondelete="CASCADE"), index=True, nullable=True)
    name: Mapped[str] = mapped_column(String(128))  # e.g. "Mid Term Examination"
    exam_type: Mapped[ExamType] = mapped_column()
    total_marks: Mapped[int] = mapped_column(default=100)
    passing_marks: Mapped[int] = mapped_column(default=33)
    start_date: Mapped[date | None] = mapped_column(Date)
    end_date: Mapped[date | None] = mapped_column(Date)
    created_by: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    academic_year: Mapped["AcademicYear"] = relationship(back_populates="exams")
    school_class: Mapped["SchoolClass | None"] = relationship(back_populates="exams")
    marks: Mapped[list["Mark"]] = relationship(back_populates="exam", cascade="all, delete-orphan")
    routines: Mapped[list["ExamRoutine"]] = relationship(back_populates="exam", cascade="all, delete-orphan")


class Mark(Base):
    __tablename__ = "marks"
    __table_args__ = (UniqueConstraint("exam_id", "student_id", "subject_id", name="uq_exam_student_subject"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    exam_id: Mapped[int] = mapped_column(ForeignKey("exams.id", ondelete="CASCADE"), index=True)
    student_id: Mapped[int] = mapped_column(
        ForeignKey("student_profiles.id", ondelete="CASCADE"), index=True
    )
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.id", ondelete="CASCADE"), index=True)
    marks_obtained: Mapped[float] = mapped_column(Float)  # 0-100
    grade: Mapped[str] = mapped_column(String(4))  # A+, A, A-, B, C, D, F (computed)
    gpa_point: Mapped[float] = mapped_column(Float)  # computed
    remarks: Mapped[str | None] = mapped_column(String(500))  # teacher comments
    graded_by: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    exam: Mapped[Exam] = relationship(back_populates="marks")
    student: Mapped["StudentProfile"] = relationship(back_populates="results")
    subject: Mapped["Subject"] = relationship()


class ExamRoutine(Base):
    __tablename__ = "exam_routines"
    __table_args__ = (UniqueConstraint("exam_id", "class_id", "subject_id", "exam_date", name="uq_exam_class_subject_date"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    exam_id: Mapped[int] = mapped_column(ForeignKey("exams.id", ondelete="CASCADE"), index=True)
    class_id: Mapped[int] = mapped_column(ForeignKey("classes.id", ondelete="CASCADE"), index=True)
    section_id: Mapped[int | None] = mapped_column(ForeignKey("sections.id", ondelete="SET NULL"))
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.id", ondelete="CASCADE"), index=True)
    teacher_id: Mapped[int | None] = mapped_column(ForeignKey("teacher_profiles.id", ondelete="SET NULL"))
    group: Mapped[str | None] = mapped_column(String(32))
    exam_date: Mapped[date] = mapped_column(Date)
    start_time: Mapped[time] = mapped_column(Time)
    end_time: Mapped[time] = mapped_column(Time)
    room: Mapped[str | None] = mapped_column(String(50))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    exam: Mapped[Exam] = relationship(back_populates="routines")
    school_class: Mapped["SchoolClass"] = relationship()
    section: Mapped["Section | None"] = relationship()
    subject: Mapped["Subject"] = relationship()
    teacher: Mapped["TeacherProfile | None"] = relationship()
