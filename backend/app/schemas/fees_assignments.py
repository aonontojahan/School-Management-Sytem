from datetime import date, datetime

from pydantic import BaseModel

from app.models.enums import FeeTypeName, InvoiceStatus, PaymentMethod


class FeeTypeOut(BaseModel):
    id: int
    name: FeeTypeName
    description: str | None = None

    model_config = {"from_attributes": True}


class InvoiceCreate(BaseModel):
    student_id: int
    academic_year_id: int | None = None
    fee_type_id: int
    total_amount: float
    due_date: date | None = None


class InvoiceOut(BaseModel):
    id: int
    student_id: int
    academic_year_id: int | None = None
    fee_type_id: int
    total_amount: float
    paid_amount: float
    due_amount: float
    due_date: date | None = None
    status: InvoiceStatus

    model_config = {"from_attributes": True}


class PaymentCreate(BaseModel):
    amount: float
    method: PaymentMethod = PaymentMethod.CASH
    note: str | None = None


class PaymentOut(BaseModel):
    id: int
    invoice_id: int
    amount: float
    method: PaymentMethod
    paid_at: datetime

    model_config = {"from_attributes": True}


class AssignmentCreate(BaseModel):
    class_id: int
    section_id: int | None = None
    subject_id: int
    title: str
    description: str | None = None
    due_date: date | None = None


class AssignmentOut(AssignmentCreate):
    id: int
    teacher_id: int | None = None

    model_config = {"from_attributes": True}


class SubmissionCreate(BaseModel):
    content_text: str | None = None
    file_url: str | None = None


class SubmissionOut(SubmissionCreate):
    id: int
    assignment_id: int
    student_id: int
    marks: float | None = None

    model_config = {"from_attributes": True}
