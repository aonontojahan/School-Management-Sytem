"""Role-aware dashboards + reports + financial analytics."""
from datetime import date, datetime, timedelta
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
from app.models.fee import FeeInvoice, FeePayment, FeeType
from app.models.people import StudentProfile, TeacherProfile
from app.models.user import User
from app.models.enums import PersonStatus, AttendanceStatus, ExamType, SalaryStatus

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

    classes = db.query(SchoolClass).order_by(SchoolClass.sort_order).all()
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
    """Student dashboard: profile, attendance, upcoming exams, recent assignments, routine."""
    from app.models.assignment import AssignmentSubmission
    from app.models.routine import Period, Routine

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
        class_num = cls.name.replace("Class ", "").strip()
        if class_num in ("9", "10") and student.group:
            from sqlalchemy import text
            result = db.execute(
                text("SELECT s.id, s.name, s.code FROM class_group_subjects cgs "
                     "JOIN subjects s ON s.id = cgs.subject_id "
                     "WHERE cgs.class_id = :cid AND cgs.group_name = :gn "
                     "ORDER BY s.name"),
                {"cid": student.class_id, "gn": student.group.value},
            )
            subjects = [{"id": r[0], "name": r[1], "code": r[2]} for r in result]
        else:
            subjects = [{"id": s.id, "name": s.name, "code": s.code} for s in cls.subjects]

    # Student routine
    routine = []
    if student.class_id and student.section_id:
        routine_query = db.query(Routine).filter(
            Routine.class_id == student.class_id,
            Routine.section_id == student.section_id,
        )
        if student.group:
            routine_query = routine_query.filter(
                (Routine.group == student.group.value) | (Routine.group.is_(None))
            )
        else:
            routine_query = routine_query.filter(Routine.group.is_(None))

        routines = routine_query.order_by(Routine.day, Routine.period_id).all()

        from app.models.academic import Subject as SubjModel
        from app.models.people import TeacherProfile as TchModel

        for r in routines:
            subj = db.get(SubjModel, r.subject_id)
            tch = db.get(TchModel, r.teacher_id)
            period = db.get(Period, r.period_id)

            routine.append({
                "day": r.day.value,
                "period_label": period.label if period else None,
                "start_time": period.start_time.isoformat() if period else None,
                "end_time": period.end_time.isoformat() if period else None,
                "subject_name": subj.name if subj else None,
                "teacher_name": f"{tch.first_name} {tch.last_name}" if tch else None,
            })

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
            "group": student.group.value if student.group else None,
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
        "routine": routine,
    }


# ── Financial Reports ───────────────────────────────────────────────────────


@router.get("/financial-summary", dependencies=[Depends(require_admin)])
def financial_summary(month: int | None = None, year: int | None = None, db: Session = Depends(get_db)):
    today = date.today()
    m = month or today.month
    y = year or today.year

    start = date(y, m, 1)
    if m == 12:
        end = date(y, 12, 31)
    else:
        end = date(y, m + 1, 1) - timedelta(days=1)

    total_fee_collected = db.query(func.coalesce(func.sum(FeePayment.amount), 0)).filter(
        and_(FeePayment.paid_at >= start, FeePayment.paid_at <= end)
    ).scalar()

    total_salary_paid = 0
    try:
        from app.models.salary import SalaryPayment
        total_salary_paid = db.query(func.coalesce(func.sum(SalaryPayment.amount), 0)).filter(
            and_(
                SalaryPayment.status == SalaryStatus.PAID,
                SalaryPayment.paid_at >= start,
                SalaryPayment.paid_at <= end,
            )
        ).scalar() or 0
    except Exception:
        pass

    pending_fees = db.query(func.count(FeeInvoice.id)).filter(FeeInvoice.status == "PENDING").scalar() or 0
    overdue_fees = db.query(func.count(FeeInvoice.id)).filter(FeeInvoice.status == "OVERDUE").scalar() or 0
    total_invoices = db.query(func.count(FeeInvoice.id)).scalar() or 0
    total_paid_invoices = db.query(func.count(FeeInvoice.id)).filter(FeeInvoice.status == "PAID").scalar() or 0

    return {
        "month": m,
        "year": y,
        "month_name": month_name[m],
        "fee_collected": float(total_fee_collected),
        "salary_paid": float(total_salary_paid),
        "revenue": float(total_fee_collected) - float(total_salary_paid),
        "pending_fees": pending_fees,
        "overdue_fees": overdue_fees,
        "total_invoices": total_invoices,
        "paid_invoices": total_paid_invoices,
    }


@router.get("/monthly-revenue", dependencies=[Depends(require_admin)])
def monthly_revenue(year: int | None = None, db: Session = Depends(get_db)):
    y = year or date.today().year
    months = []
    for m in range(1, 13):
        start = date(y, m, 1)
        if m == 12:
            end = date(y, 12, 31)
        else:
            end = date(y, m + 1, 1) - timedelta(days=1)

        fee = db.query(func.coalesce(func.sum(FeePayment.amount), 0)).filter(
            and_(FeePayment.paid_at >= start, FeePayment.paid_at <= end)
        ).scalar() or 0

        salary = 0
        try:
            from app.models.salary import SalaryPayment
            salary = db.query(func.coalesce(func.sum(SalaryPayment.amount), 0)).filter(
                and_(
                    SalaryPayment.status == SalaryStatus.PAID,
                    SalaryPayment.paid_at >= start,
                    SalaryPayment.paid_at <= end,
                )
            ).scalar() or 0
        except Exception:
            pass

        months.append({
            "month": month_name[m][:3],
            "month_full": month_name[m],
            "fee_collected": float(fee),
            "salary_paid": float(salary),
            "revenue": float(fee) - float(salary),
        })
    return months


@router.get("/yearly-revenue", dependencies=[Depends(require_admin)])
def yearly_revenue(db: Session = Depends(get_db)):
    current_year = date.today().year
    years = []
    for y in range(current_year - 4, current_year + 1):
        fee = db.query(func.coalesce(func.sum(FeePayment.amount), 0)).filter(
            and_(extract("year", FeePayment.paid_at) == y)
        ).scalar() or 0

        salary = 0
        try:
            from app.models.salary import SalaryPayment
            salary = db.query(func.coalesce(func.sum(SalaryPayment.amount), 0)).filter(
                and_(extract("year", SalaryPayment.paid_at) == y, SalaryPayment.status == SalaryStatus.PAID)
            ).scalar() or 0
        except Exception:
            pass

        years.append({
            "year": y,
            "fee_collected": float(fee),
            "salary_paid": float(salary),
            "revenue": float(fee) - float(salary),
        })
    return years


# ── Monthly Auto-Generate (Cron Target) ─────────────────────────────────────


@router.post("/generate-monthly", dependencies=[Depends(require_admin)])
def generate_monthly_records(db: Session = Depends(get_db)):
    """Auto-generate tuition fee invoices for all active students + salary records for all teachers.
    Intended to run on the 30th of each month via APScheduler."""
    today = date.today()
    m = today.month
    y = today.year
    results = {"fees_generated": 0, "salaries_generated": 0}

    # 1. Generate tuition fee invoices for all active students
    tuition_fee_type = db.query(FeeType).filter(FeeType.name == "TUITION").first()
    if tuition_fee_type:
        students = db.query(StudentProfile).filter(StudentProfile.status == PersonStatus.ACTIVE).all()
        for s in students:
            existing = db.query(FeeInvoice).filter(
                FeeInvoice.student_id == s.id,
                FeeInvoice.fee_type_id == tuition_fee_type.id,
                extract("month", FeeInvoice.due_date) == m,
                extract("year", FeeInvoice.due_date) == y,
            ).first()
            if existing:
                continue
            inv = FeeInvoice(
                student_id=s.id,
                fee_type_id=tuition_fee_type.id,
                total_amount=0,
                paid_amount=0,
                due_date=date(y, m, 28),
                status="PENDING",
            )
            db.add(inv)
            results["fees_generated"] += 1

    # 2. Generate salary payments for all teachers with salary structures
    try:
        from app.models.salary import SalaryPayment, SalaryStructure
        structures = db.query(SalaryStructure).all()
        for st in structures:
            existing = db.query(SalaryPayment).filter(
                SalaryPayment.salary_structure_id == st.id,
                SalaryPayment.month == m,
                SalaryPayment.year == y,
            ).first()
            if existing:
                continue
            payment = SalaryPayment(
                salary_structure_id=st.id,
                teacher_id=st.teacher_id,
                month=m,
                year=y,
                amount=float(st.monthly_amount),
                status=SalaryStatus.PENDING,
            )
            db.add(payment)
            results["salaries_generated"] += 1
    except Exception:
        pass

    db.commit()

    # 3. Send notifications
    from app.models.notification import Notification
    from app.models.user import User as UserModel
    from app.models.enums import UserRole

    month_names = ["", "January", "February", "March", "April", "May", "June",
                   "July", "August", "September", "October", "November", "December"]
    month_name_str = month_names[m]

    # Notify students about tuition fees
    student_users = db.query(UserModel).filter(UserModel.role == UserRole.STUDENT, UserModel.is_active == True).all()
    for su in student_users:
        n = Notification(
            user_id=su.id,
            title=f"Tuition Fee: {month_name_str} {y}",
            message=f"Your tuition fee for {month_name_str} {y} has been generated. Please check your fees page.",
            type="FEE",
        )
        db.add(n)

    # Notify teachers about salary
    teacher_users = db.query(UserModel).filter(UserModel.role == UserRole.TEACHER, UserModel.is_active == True).all()
    for tu in teacher_users:
        n = Notification(
            user_id=tu.id,
            title=f"Salary Processed: {month_name_str} {y}",
            message=f"Your salary for {month_name_str} {y} has been processed. Check your salary page.",
            type="SALARY",
        )
        db.add(n)

    db.commit()
    return results
