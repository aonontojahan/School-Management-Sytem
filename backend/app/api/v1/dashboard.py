"""Role-aware dashboards + reports (counts only, no extra modules)."""
from datetime import date, timedelta
from calendar import month_name
from fastapi import APIRouter, Depends
from sqlalchemy import func, and_, extract
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


@router.get("/monthly-attendance", dependencies=[Depends(require_admin)])
def monthly_attendance(db: Session = Depends(get_db)):
    """Monthly attendance totals for the current year (or last 12 months)."""
    today = date.today()
    year = today.year

    months = []
    for m in range(1, 13):
        start = date(year, m, 1)
        if m == 12:
            end = date(year, 12, 31)
        else:
            end = date(year, m + 1, 1) - timedelta(days=1)

        total = db.query(func.count(Attendance.id)).filter(
            and_(Attendance.date >= start, Attendance.date <= end)
        ).scalar() or 0

        present = db.query(func.count(Attendance.id)).filter(
            and_(Attendance.date >= start, Attendance.date <= end, Attendance.status == AttendanceStatus.PRESENT)
        ).scalar() or 0

        absent = total - present

        months.append({
            "month": month_name[m][:3],
            "month_full": month_name[m],
            "present": present,
            "absent": absent,
            "total": total,
        })

    return months


@router.get("/class-attendance", dependencies=[Depends(require_admin)])
def class_attendance(db: Session = Depends(get_db)):
    """Today's class-wise attendance breakdown for all classes (5-9)."""
    today = date.today()

    classes = db.query(SchoolClass).order_by(SchoolClass.name).all()
    result = []

    for cls in classes:
        total = db.query(func.count(Attendance.id)).filter(
            and_(Attendance.class_id == cls.id, Attendance.date == today)
        ).scalar() or 0

        present = db.query(func.count(Attendance.id)).filter(
            and_(
                Attendance.class_id == cls.id,
                Attendance.date == today,
                Attendance.status == AttendanceStatus.PRESENT,
            )
        ).scalar() or 0

        absent = total - present

        result.append({
            "class_name": cls.name,
            "class_code": cls.code,
            "present": present,
            "absent": absent,
            "total": total,
        })

    return result


@router.get("/student", dependencies=[Depends(get_current_user)])
def student_dashboard(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Student dashboard: profile, attendance, upcoming exams, recent assignments."""
    from app.models.assignment import AssignmentSubmission

    student = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    if not student:
        return {"error": "Student profile not found"}

    # Attendance summary
    total_attendance = db.query(func.count(Attendance.id)).filter(Attendance.student_id == student.id).scalar() or 0
    present_days = db.query(func.count(Attendance.id)).filter(
        and_(Attendance.student_id == student.id, Attendance.status == AttendanceStatus.PRESENT)
    ).scalar() or 0
    attendance_rate = round((present_days / total_attendance) * 100, 1) if total_attendance > 0 else 0

    # Recent attendance (last 7)
    recent_attendance = (
        db.query(Attendance)
        .filter(Attendance.student_id == student.id)
        .order_by(Attendance.date.desc())
        .limit(7)
        .all()
    )

    # Upcoming exams for student's class
    today = date.today()
    upcoming_exams = []
    if student.class_id:
        upcoming_exams = (
            db.query(Exam)
            .filter(Exam.class_id == student.class_id, Exam.end_date >= today)
            .order_by(Exam.start_date)
            .limit(5)
            .all()
        )

    # Recent assignments for student's class
    recent_assignments = []
    if student.class_id:
        recent_assignments = (
            db.query(Assignment)
            .filter(Assignment.class_id == student.class_id)
            .order_by(Assignment.created_at.desc())
            .limit(5)
            .all()
        )

    # Class info
    cls = db.get(SchoolClass, student.class_id) if student.class_id else None
    sec = db.get(Section, student.section_id) if student.section_id else None

    # Subjects for student's class
    subjects = []
    if cls:
        subjects = [{"id": s.id, "name": s.name, "code": s.code} for s in cls.subjects]

    return {
        "profile": {
            "id": student.id,
            "student_code": student.student_code,
            "first_name": student.first_name,
            "last_name": student.last_name,
            "email": student.email,
            "phone": student.phone,
            "date_of_birth": str(student.date_of_birth) if student.date_of_birth else None,
            "gender": student.gender.value if student.gender else None,
            "address": student.address,
            "admission_date": str(student.admission_date) if student.admission_date else None,
            "roll_number": student.roll_number,
            "division": student.division,
            "guardian_name": student.guardian_name,
            "guardian_phone": student.guardian_phone,
            "status": student.status.value,
        },
        "class": {
            "id": cls.id if cls else None,
            "name": cls.name if cls else None,
            "code": cls.code if cls else None,
        } if cls else None,
        "section": {
            "id": sec.id if sec else None,
            "name": sec.name if sec else None,
        } if sec else None,
        "subjects": subjects,
        "attendance": {
            "total_days": total_attendance,
            "present_days": present_days,
            "absent_days": total_attendance - present_days,
            "rate": attendance_rate,
            "recent": [
                {
                    "date": str(a.date),
                    "status": a.status.value,
                    "period": a.period,
                }
                for a in recent_attendance
            ],
        },
        "upcoming_exams": [
            {
                "id": e.id,
                "name": e.name,
                "exam_type": e.exam_type.value,
                "start_date": str(e.start_date) if e.start_date else None,
                "end_date": str(e.end_date) if e.end_date else None,
                "total_marks": e.total_marks,
            }
            for e in upcoming_exams
        ],
        "recent_assignments": [
            {
                "id": a.id,
                "title": a.title,
                "description": a.description,
                "due_date": str(a.due_date) if a.due_date else None,
                "subject_id": a.subject_id,
            }
            for a in recent_assignments
        ],
    }
