from datetime import date

from pydantic import BaseModel, EmailStr

from app.models.enums import PersonStatus


class TeacherBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr | None = None
    phone: str | None = None
    department: str | None = None
    joining_date: date | None = None
    designation: str | None = None
    subject_ids: list[int] = []
    section_ids: list[int] = []


class TeacherCreate(TeacherBase):
    pass


class TeacherUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    department: str | None = None
    joining_date: date | None = None
    designation: str | None = None
    status: PersonStatus | None = None
    subject_ids: list[int] | None = None
    section_ids: list[int] | None = None


class TeacherOut(TeacherBase):
    id: int
    teacher_code: str
    status: PersonStatus

    model_config = {"from_attributes": True}


class GuardianBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr | None = None
    phone: str | None = None
    address: str | None = None


class GuardianCreate(GuardianBase):
    pass


class GuardianUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    address: str | None = None


class GuardianOut(GuardianBase):
    id: int

    model_config = {"from_attributes": True}


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str
    is_active: bool = True
