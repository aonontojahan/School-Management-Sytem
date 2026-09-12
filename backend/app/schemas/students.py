from datetime import date

from pydantic import BaseModel, EmailStr

from app.models.enums import Gender, PersonStatus


class StudentBase(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: date | None = None
    gender: Gender | None = None
    email: EmailStr | None = None
    phone: str | None = None
    address: str | None = None
    admission_date: date | None = None
    class_id: int | None = None
    section_id: int | None = None
    roll_number: int | None = None


class StudentCreate(StudentBase):
    user_id: int | None = None


class StudentUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    date_of_birth: date | None = None
    gender: Gender | None = None
    email: EmailStr | None = None
    phone: str | None = None
    address: str | None = None
    class_id: int | None = None
    section_id: int | None = None
    roll_number: int | None = None
    status: PersonStatus | None = None
    profile_photo_url: str | None = None


class StudentOut(StudentBase):
    id: int
    student_code: str
    status: PersonStatus
    profile_photo_url: str | None = None

    model_config = {"from_attributes": True}
