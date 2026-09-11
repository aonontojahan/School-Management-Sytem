from datetime import date

from pydantic import BaseModel


class AcademicYearBase(BaseModel):
    name: str
    start_date: date
    end_date: date
    is_active: bool = False


class AcademicYearCreate(AcademicYearBase):
    pass


class AcademicYearOut(AcademicYearBase):
    id: int

    model_config = {"from_attributes": True}


class SchoolClassCreate(BaseModel):
    academic_year_id: int
    name: str
    code: str


class SchoolClassOut(BaseModel):
    id: int
    academic_year_id: int
    name: str
    code: str

    model_config = {"from_attributes": True}


class SectionCreate(BaseModel):
    class_id: int
    name: str
    capacity: int = 50


class SectionOut(BaseModel):
    id: int
    class_id: int
    name: str
    capacity: int

    model_config = {"from_attributes": True}


class SubjectCreate(BaseModel):
    name: str
    code: str
    description: str | None = None


class SubjectOut(BaseModel):
    id: int
    name: str
    code: str
    description: str | None = None

    model_config = {"from_attributes": True}


class ClassSubjectsUpdate(BaseModel):
    subject_ids: list[int]
