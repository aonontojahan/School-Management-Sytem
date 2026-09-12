"""Class routine and period configuration models."""
from datetime import time

from sqlalchemy import DateTime, ForeignKey, Integer, String, Time, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import DayOfWeek


class Period(Base):
    __tablename__ = "periods"
    __table_args__ = (UniqueConstraint("academic_year_id", "period_number", name="uq_year_period"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    academic_year_id: Mapped[int] = mapped_column(ForeignKey("academic_years.id", ondelete="CASCADE"), index=True)
    period_number: Mapped[int] = mapped_column(Integer)
    label: Mapped[str] = mapped_column(String(32))
    start_time: Mapped[time] = mapped_column(Time)
    end_time: Mapped[time] = mapped_column(Time)

    academic_year: Mapped["AcademicYear"] = relationship(back_populates="periods")
    routines: Mapped[list["Routine"]] = relationship(back_populates="period")


class Routine(Base):
    __tablename__ = "routines"
    __table_args__ = (
        UniqueConstraint("class_id", "section_id", "day", "period_id", name="uq_class_section_day_period"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    academic_year_id: Mapped[int] = mapped_column(ForeignKey("academic_years.id", ondelete="CASCADE"), index=True)
    class_id: Mapped[int] = mapped_column(ForeignKey("classes.id", ondelete="CASCADE"), index=True)
    section_id: Mapped[int] = mapped_column(ForeignKey("sections.id", ondelete="CASCADE"), index=True)
    group: Mapped[str | None] = mapped_column(String(32))
    day: Mapped[DayOfWeek] = mapped_column()
    period_id: Mapped[int] = mapped_column(ForeignKey("periods.id", ondelete="CASCADE"), index=True)
    subject_id: Mapped[int] = mapped_column(ForeignKey("subjects.id", ondelete="CASCADE"), index=True)
    teacher_id: Mapped[int] = mapped_column(ForeignKey("teacher_profiles.id", ondelete="SET NULL"), index=True)

    academic_year: Mapped["AcademicYear"] = relationship(back_populates="routines")
    school_class: Mapped["SchoolClass"] = relationship(back_populates="routines")
    section: Mapped["Section"] = relationship(back_populates="routines")
    period: Mapped["Period"] = relationship(back_populates="routines")
    subject: Mapped["Subject"] = relationship()
    teacher: Mapped["TeacherProfile"] = relationship()
