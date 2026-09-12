"""Role-aware dashboards + reports (counts only, no extra modules)."""
from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy import func, and_, or_
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_admin
from app.db.session import get_db
from app.models.assignment import Assignment
from app.models.attendance import Attendance
from app.models.exam import Exam, Mark
from app.models.academic import SchoolClass, Section, Subject
from app.models.fee import FeeInvoice
from app.models.people import StudentProfile, TeacherProfile
from app.models.user import User
from app.models.enums import PersonStatus, AttendanceStatus, ExamType

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


@router.get("/admin/stats", dependencies=[Depends(require_admin)])
def admin_stats(db: Session = Depends(get_db)):
    """Detailed admin dashboard statistics."""
    today = date.today()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)

    total_students = db.query(func.count(StudentProfile.id)).scalar()
    active_students = db.query(func.count(StudentProfile.id)).filter(StudentProfile.status == PersonStatus.ACTIVE).scalar()
    total_teachers = db.query(func.count(TeacherProfile.id)).scalar()
    active_teachers = db.query(func.count(TeacherProfile.id)).filter(TeacherProfile.status == PersonStatus.ACTIVE).scalar()
    total_classes = db.query(func.count(SchoolClass.id)).scalar()
    total_sections = db.query(func.count(Section.id)).scalar()

    upcoming_exams = db.query(func.count(Exam.id)).filter(Exam.start_date >= today).scalar()
    ongoing_exams = db.query(func.count(Exam.id)).filter(
        and_(Exam.start_date <= today, Exam.end_date >= today)
    ).scalar()

    attendance_today = db.query(func.count(Attendance.id)).filter(Attendance.date == today).scalar()
    attendance_present_today = db.query(func.count(Attendance.id)).filter(
        and_(Attendance.date == today, Attendance.status == AttendanceStatus.PRESENT)
    ).scalar()
    attendance_rate_today = (
        round((attendance_present_today / attendance_today) * 100, 1) if attendance_today > 0 else 0
    )

    attendance_week = db.query(func.count(Attendance.id)).filter(Attendance.date >= week_ago).scalar()
    attendance_present_week = db.query(func.count(Attendance.id)).filter(
        and_(Attendance.date >= week_ago, Attendance.status == AttendanceStatus.PRESENT)
    ).scalar()
    attendance_rate_week = (
        round((attendance_present_week / attendance_week) * 100, 1) if attendance_week > 0 else 0
    )

    recent_students = (
        db.query(StudentProfile)
        .order_by(StudentProfile.created_at.desc())
        .limit(5)
        .all()
    )
    recent_teachers = (
        db.query(TeacherProfile)
        .order_by(TeacherProfile.created_at.desc())
        .limit(5)
        .all()
    )

    recent_exams = db.query(Exam).order_by(Exam.created_at.desc()).limit(5).all()

    pending_fees = db.query(func.count(FeeInvoice.id)).filter(FeeInvoice.status == "PENDING").scalar()
    overdue_fees = db.query(func.count(FeeInvoice.id)).filter(FeeInvoice.status == "OVERDUE").scalar()

    return {
        "totals": {
            "students": total_students,
            "active_students": active_students,
            "teachers": total_teachers,
            "active_teachers": active_teachers,
            "classes": total_classes,
            "sections": total_sections,
        },
        "exams": {
            "upcoming": upcoming_exams,
            "ongoing": ongoing_exams,
        },
        "attendance": {
            "today": {
                "total": attendance_today,
                "present": attendance_present_today,
                "rate": attendance_rate_today,
            },
            "week": {
                "total": attendance_week,
                "present": attendance_present_week,
                "rate": attendance_rate_week,
            },
        },
        "fees": {
            "pending": pending_fees,
            "overdue": overdue_fees,
        },
        "recent": {
            "students": [
                {"id": s.id, "student_code": s.student_code, "name": f"{s.first_name} {s.last_name}", "created_at": s.created_at}
                for s in recent_students
            ],
            "teachers": [
                {"id": t.id, "teacher_code": t.teacher_code, "name": f"{t.first_name} {t.last_name}", "created_at": t.created_at}
                for t in recent_teachers
            ],
            "exams": [
                {"id": e.id, "name": e.name, "exam_type": e.exam_type.value, "start_date": e.start_date, "created_at": e.created_at}
                for e in recent_exams
            ],
        },
    }
