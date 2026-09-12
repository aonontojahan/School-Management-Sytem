"""Role-aware dashboards + reports (counts only, no extra modules)."""
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.assignment import Assignment
from app.models.attendance import Attendance
from app.models.exam import Exam, Mark
from app.models.academic import SchoolClass, Section, Subject
from app.models.fee import FeeInvoice
from app.models.people import StudentProfile, TeacherProfile
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
def summary(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return {
        "role": user.role,
        "students": db.query(func.count(StudentProfile.id)).scalar(),
        "teachers": db.query(func.count(TeacherProfile.id)).scalar(),
        "classes": db.query(func.count(SchoolClass.id)).scalar(),
        "sections": db.query(func.count(Section.id)).scalar(),
        "subjects": db.query(func.count(Subject.id)).scalar(),
        "exams": db.query(func.count(Exam.id)).scalar(),
        "attendance_records": db.query(func.count(Attendance.id)).scalar(),
        "marks": db.query(func.count(Mark.id)).scalar(),
        "invoices": db.query(func.count(FeeInvoice.id)).scalar(),
        "assignments": db.query(func.count(Assignment.id)).scalar(),
    }
