from datetime import date

from pydantic import BaseModel, Field

from app.models.enums import AttendanceStatus


class AttendanceMarkIn(BaseModel):
    student_id: int
    status: AttendanceStatus
    period: int | None = Field(None, ge=1, le=6)


class AttendanceBulkIn(BaseModel):
    class_id: int
    section_id: int | None = None
    date: date
    records: list[AttendanceMarkIn]


class AttendanceOut(BaseModel):
    id: int
    student_id: int
    class_id: int
    section_id: int | None = None
    date: date
    status: AttendanceStatus
    period: int | None = None

    model_config = {"from_attributes": True}


class AttendanceRateOut(BaseModel):
    student_id: int
    present_days: int
    total_days: int
    rate: float
