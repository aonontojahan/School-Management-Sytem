"""Salary: structures and monthly payments."""
from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Integer, Numeric, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import SalaryStatus


class SalaryStructure(Base):
    __tablename__ = "salary_structures"
    __table_args__ = (UniqueConstraint("teacher_id", "academic_year_id", name="uq_teacher_year_salary"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    teacher_id: Mapped[int] = mapped_column(
        ForeignKey("teacher_profiles.id", ondelete="CASCADE"), index=True
    )
    academic_year_id: Mapped[int | None] = mapped_column(ForeignKey("academic_years.id", ondelete="SET NULL"))
    monthly_amount: Mapped[float] = mapped_column(Numeric(12, 2))
    effective_from: Mapped[date | None] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    teacher: Mapped["TeacherProfile"] = relationship()
    payments: Mapped[list["SalaryPayment"]] = relationship(back_populates="salary_structure", cascade="all, delete-orphan")


class SalaryPayment(Base):
    __tablename__ = "salary_payments"
    __table_args__ = (UniqueConstraint("salary_structure_id", "month", "year", name="uq_salary_month_year"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    salary_structure_id: Mapped[int] = mapped_column(
        ForeignKey("salary_structures.id", ondelete="CASCADE"), index=True
    )
    teacher_id: Mapped[int] = mapped_column(
        ForeignKey("teacher_profiles.id", ondelete="CASCADE"), index=True
    )
    month: Mapped[int] = mapped_column(Integer)
    year: Mapped[int] = mapped_column(Integer)
    amount: Mapped[float] = mapped_column(Numeric(12, 2))
    status: Mapped[SalaryStatus] = mapped_column(default=SalaryStatus.PENDING)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    paid_by: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    note: Mapped[str | None] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    salary_structure: Mapped[SalaryStructure] = relationship(back_populates="payments")
    teacher: Mapped["TeacherProfile"] = relationship()
