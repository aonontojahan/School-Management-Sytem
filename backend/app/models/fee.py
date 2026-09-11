"""Fees: types, invoices, payments."""
from datetime import date, datetime

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enums import FeeTypeName, InvoiceStatus, PaymentMethod


class FeeType(Base):
    __tablename__ = "fee_types"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[FeeTypeName] = mapped_column(unique=True)
    description: Mapped[str | None] = mapped_column(String(500))


class FeeInvoice(Base):
    __tablename__ = "fee_invoices"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    student_id: Mapped[int] = mapped_column(
        ForeignKey("student_profiles.id", ondelete="CASCADE"), index=True
    )
    academic_year_id: Mapped[int | None] = mapped_column(ForeignKey("academic_years.id", ondelete="SET NULL"))
    fee_type_id: Mapped[int] = mapped_column(ForeignKey("fee_types.id", ondelete="RESTRICT"))
    total_amount: Mapped[float] = mapped_column(Numeric(12, 2))
    paid_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    due_date: Mapped[date | None] = mapped_column(Date)
    status: Mapped[InvoiceStatus] = mapped_column(default=InvoiceStatus.PENDING)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    student: Mapped["StudentProfile"] = relationship(back_populates="fee_invoices")
    fee_type: Mapped[FeeType] = relationship()
    payments: Mapped[list["FeePayment"]] = relationship(back_populates="invoice", cascade="all, delete-orphan")

    @property
    def due_amount(self) -> float:
        return float(self.total_amount) - float(self.paid_amount or 0)


class FeePayment(Base):
    __tablename__ = "fee_payments"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    invoice_id: Mapped[int] = mapped_column(ForeignKey("fee_invoices.id", ondelete="CASCADE"), index=True)
    amount: Mapped[float] = mapped_column(Numeric(12, 2))
    method: Mapped[PaymentMethod] = mapped_column(default=PaymentMethod.CASH)
    note: Mapped[str | None] = mapped_column(String(500))
    received_by: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    paid_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    invoice: Mapped[FeeInvoice] = relationship(back_populates="payments")
