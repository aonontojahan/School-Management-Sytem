from datetime import date, time

from pydantic import BaseModel, Field

from app.models.enums import ExamType


class ExamCreate(BaseModel):
    academic_year_id: int
    class_id: int | None = None
    name: str
    exam_type: ExamType
    total_marks: int = Field(100, ge=1)
    passing_marks: int = Field(33, ge=1)
    start_date: date | None = None
    end_date: date | None = None


class ExamOut(ExamCreate):
    id: int

    model_config = {"from_attributes": True}


class ExamRoutineCreate(BaseModel):
    exam_id: int
    class_id: int
    section_id: int | None = None
    subject_id: int
    teacher_id: int | None = None
    group: str | None = None
    exam_date: date
    start_time: time
    end_time: time
    room: str | None = None


class ExamRoutineOut(ExamRoutineCreate):
    id: int
    exam_name: str | None = None
    class_name: str | None = None
    section_name: str | None = None
    subject_name: str | None = None
    teacher_name: str | None = None


class MarkIn(BaseModel):
    student_id: int
    subject_id: int
    marks_obtained: float = Field(ge=0, le=100)
    remarks: str | None = None


class MarkBulkIn(BaseModel):
    marks: list[MarkIn]


class MarkOut(BaseModel):
    id: int
    exam_id: int
    student_id: int
    subject_id: int
    marks_obtained: float
    grade: str
    gpa_point: float
    remarks: str | None = None

    model_config = {"from_attributes": True}


class ReportCardRow(BaseModel):
    subject_id: int
    subject_name: str
    marks: float
    grade: str
    remarks: str | None = None


class ReportCardOut(BaseModel):
    student_id: int
    student_name: str
    exam_id: int
    rows: list[ReportCardRow]
    total: float
    percentage: float
    gpa: float
    result: str
