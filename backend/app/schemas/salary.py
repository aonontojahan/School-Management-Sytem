"""Salary schemas."""
from datetime import date, datetime

from pydantic import BaseModel

from app.models.enums import SalaryStatus


class SalaryStructureCreate(BaseModel):
    teacher_id: int
    monthly_amount: float
    effective_from: date | None = None


class SalaryStructureOut(BaseModel):
    id: int
    teacher_id: int
    teacher_name: str | None = None
    monthly_amount: float
    effective_from: date | None = None

    model_config = {"from_attributes": True}


class SalaryPaymentCreate(BaseModel):
    salary_structure_id: int
    month: int
    year: int


class SalaryPaymentOut(BaseModel):
    id: int
    salary_structure_id: int
    teacher_id: int
    teacher_name: str | None = None
    month: int
    year: int
    amount: float
    status: SalaryStatus
    paid_at: datetime | None = None
    note: str | None = None

    model_config = {"from_attributes": True}


class BulkSalaryGenerate(BaseModel):
    month: int
    year: int
