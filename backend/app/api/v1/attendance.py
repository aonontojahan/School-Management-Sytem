from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_teacher
from app.db.session import get_db
from app.models.attendance import Attendance
from app.models.enums import AttendanceStatus
from app.models.user import User
from app.schemas.attendance import AttendanceBulkIn, AttendanceOut, AttendanceRateOut
from app.services.grading import attendance_rate

router = APIRouter(prefix="/attendance", tags=["attendance"])


@router.post("/bulk", response_model=list[AttendanceOut], dependencies=[Depends(require_teacher)])
def mark_bulk(data: AttendanceBulkIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    out: list[Attendance] = []
    for rec in data.records:
        existing = (
            db.query(Attendance)
            .filter(Attendance.student_id == rec.student_id, Attendance.date == data.date)
            .first()
        )
        if existing:
            existing.status = rec.status
            existing.class_id = data.class_id
            existing.section_id = data.section_id
            existing.period = rec.period
            existing.marked_by = user.id
            out.append(existing)
        else:
            row = Attendance(
                student_id=rec.student_id,
                class_id=data.class_id,
                section_id=data.section_id,
                date=data.date,
                status=rec.status,
                period=rec.period,
                marked_by=user.id,
            )
            db.add(row)
            out.append(row)
    db.commit()
    for r in out:
        db.refresh(r)
    return out


@router.get("", response_model=list[AttendanceOut])
def list_attendance(
    class_id: int | None = None,
    student_id: int | None = None,
    on_date: date | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(Attendance)
    if class_id:
        q = q.filter(Attendance.class_id == class_id)
    if student_id:
        q = q.filter(Attendance.student_id == student_id)
    if on_date:
        q = q.filter(Attendance.date == on_date)
    return q.order_by(Attendance.date.desc()).limit(500).all()


@router.get("/rate/{student_id}", response_model=AttendanceRateOut)
def rate(student_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    total = db.query(func.count(Attendance.id)).filter(Attendance.student_id == student_id).scalar() or 0
    present = (
        db.query(func.count(Attendance.id))
        .filter(Attendance.student_id == student_id, Attendance.status == AttendanceStatus.PRESENT)
        .scalar()
        or 0
    )
    return AttendanceRateOut(student_id=student_id, present_days=present, total_days=total, rate=attendance_rate(present, total))
