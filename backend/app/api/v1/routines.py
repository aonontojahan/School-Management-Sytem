"""Class routine CRUD endpoints with validation."""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_admin
from app.db.session import get_db
from app.models.academic import SchoolClass, Section, Subject
from app.models.enums import DayOfWeek
from app.models.people import TeacherProfile
from app.models.routine import Period, Routine
from app.models.user import User

router = APIRouter(prefix="/routines", tags=["routines"])


def _validate_routine(db: Session, class_id: int, section_id: int, day: DayOfWeek, period_id: int, teacher_id: int, subject_id: int, routine_id: int | None = None):
    """Validate a routine entry."""
    # Check class/section doesn't already have a subject at this time
    existing = db.query(Routine).filter(
        Routine.class_id == class_id,
        Routine.section_id == section_id,
        Routine.day == day,
        Routine.period_id == period_id,
    )
    if routine_id:
        existing = existing.filter(Routine.id != routine_id)
    if existing.first():
        raise HTTPException(400, f"This class-section already has a subject scheduled for {day.value} at this period")

    # Check teacher isn't already assigned at this time
    existing_teacher = db.query(Routine).filter(
        Routine.teacher_id == teacher_id,
        Routine.day == day,
        Routine.period_id == period_id,
    )
    if routine_id:
        existing_teacher = existing_teacher.filter(Routine.id != routine_id)
    if existing_teacher.first():
        raise HTTPException(400, f"This teacher is already assigned to another class at this time")


@router.get("")
def list_routines(
    class_id: int | None = None,
    section_id: int | None = None,
    day: DayOfWeek | None = None,
    teacher_id: int | None = None,
    academic_year_id: int | None = None,
    group: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """List routine entries with optional filters."""
    query = db.query(Routine)
    if class_id:
        query = query.filter(Routine.class_id == class_id)
    if section_id:
        query = query.filter(Routine.section_id == section_id)
    if day:
        query = query.filter(Routine.day == day)
    if teacher_id:
        query = query.filter(Routine.teacher_id == teacher_id)
    if academic_year_id:
        query = query.filter(Routine.academic_year_id == academic_year_id)
    if group:
        query = query.filter((Routine.group == group) | (Routine.group.is_(None)))

    routines = query.order_by(Routine.day, Routine.period_id).all()

    result = []
    for r in routines:
        cls = db.get(SchoolClass, r.class_id)
        sec = db.get(Section, r.section_id)
        subj = db.get(Subject, r.subject_id)
        tch = db.get(TeacherProfile, r.teacher_id)
        period = db.get(Period, r.period_id)

        result.append({
            "id": r.id,
            "academic_year_id": r.academic_year_id,
            "class_id": r.class_id,
            "class_name": cls.name if cls else None,
            "section_id": r.section_id,
            "section_name": sec.name if sec else None,
            "group": r.group,
            "day": r.day.value,
            "period_id": r.period_id,
            "period_label": period.label if period else None,
            "start_time": period.start_time.isoformat() if period else None,
            "end_time": period.end_time.isoformat() if period else None,
            "subject_id": r.subject_id,
            "subject_name": subj.name if subj else None,
            "teacher_id": r.teacher_id,
            "teacher_name": f"{tch.first_name} {tch.last_name}" if tch else None,
        })

    return result


@router.post("", status_code=status.HTTP_201_CREATED)
def create_routine(
    data: dict,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    """Create a routine entry."""
    required = ["academic_year_id", "class_id", "section_id", "day", "period_id", "subject_id", "teacher_id"]
    for field in required:
        if field not in data:
            raise HTTPException(400, f"Missing required field: {field}")

    # Validate teacher exists
    teacher = db.get(TeacherProfile, data["teacher_id"])
    if not teacher:
        raise HTTPException(404, "Teacher not found")

    # Validate subject exists
    subject = db.get(Subject, data["subject_id"])
    if not subject:
        raise HTTPException(404, "Subject not found")

    # Validate subject is assigned to this teacher
    teacher_subject_ids = {s.id for s in teacher.subjects}
    if data["subject_id"] not in teacher_subject_ids:
        raise HTTPException(400, f"Subject '{subject.name}' is not assigned to this teacher")

    # Validate period exists
    period = db.get(Period, data["period_id"])
    if not period:
        raise HTTPException(404, "Period not found")

    # Run validation
    _validate_routine(
        db,
        data["class_id"],
        data["section_id"],
        data["day"],
        data["period_id"],
        data["teacher_id"],
        data["subject_id"],
    )

    routine = Routine(
        academic_year_id=data["academic_year_id"],
        class_id=data["class_id"],
        section_id=data["section_id"],
        group=data.get("group"),
        day=data["day"],
        period_id=data["period_id"],
        subject_id=data["subject_id"],
        teacher_id=data["teacher_id"],
    )
    db.add(routine)
    db.commit()
    db.refresh(routine)

    return {"id": routine.id, "message": "Routine entry created"}


@router.put("/{routine_id}")
def update_routine(
    routine_id: int,
    data: dict,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    """Update a routine entry."""
    routine = db.get(Routine, routine_id)
    if not routine:
        raise HTTPException(404, "Routine entry not found")

    # Merge data
    update_data = {k: v for k, v in data.items() if v is not None}
    class_id = update_data.get("class_id", routine.class_id)
    section_id = update_data.get("section_id", routine.section_id)
    day = update_data.get("day", routine.day)
    period_id = update_data.get("period_id", routine.period_id)
    teacher_id = update_data.get("teacher_id", routine.teacher_id)
    subject_id = update_data.get("subject_id", routine.subject_id)

    # Validate subject is assigned to the teacher
    if "subject_id" in update_data or "teacher_id" in update_data:
        t = db.get(TeacherProfile, teacher_id)
        if t:
            teacher_subject_ids = {s.id for s in t.subjects}
            if subject_id not in teacher_subject_ids:
                subj = db.get(Subject, subject_id)
                raise HTTPException(400, f"Subject '{subj.name if subj else subject_id}' is not assigned to this teacher")

    _validate_routine(db, class_id, section_id, day, period_id, teacher_id, subject_id, routine_id)

    for k, v in update_data.items():
        setattr(routine, k, v)

    db.commit()
    db.refresh(routine)
    return {"id": routine.id, "message": "Routine entry updated"}


@router.delete("/{routine_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_routine(
    routine_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    """Delete a routine entry."""
    routine = db.get(Routine, routine_id)
    if not routine:
        raise HTTPException(404, "Routine entry not found")
    db.delete(routine)
    db.commit()


@router.get("/student")
def student_routine(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get routine for the logged-in student."""
    from app.models.people import StudentProfile

    student = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    if not student:
        raise HTTPException(404, "Student profile not found")
    if not student.class_id:
        raise HTTPException(400, "Student has no class assigned")

    query = db.query(Routine).filter(
        Routine.class_id == student.class_id,
        Routine.section_id == student.section_id,
    )
    if student.group:
        query = query.filter(
            (Routine.group == student.group.value) | (Routine.group.is_(None))
        )
    else:
        query = query.filter(Routine.group.is_(None))

    routines = query.order_by(Routine.day, Routine.period_id).all()

    result = []
    for r in routines:
        subj = db.get(Subject, r.subject_id)
        tch = db.get(TeacherProfile, r.teacher_id)
        period = db.get(Period, r.period_id)

        result.append({
            "id": r.id,
            "day": r.day.value,
            "period_label": period.label if period else None,
            "start_time": period.start_time.isoformat() if period else None,
            "end_time": period.end_time.isoformat() if period else None,
            "subject_name": subj.name if subj else None,
            "teacher_name": f"{tch.first_name} {tch.last_name}" if tch else None,
        })

    return result


@router.get("/teacher")
def teacher_routine(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get routine for the logged-in teacher."""
    teacher = db.query(TeacherProfile).filter(TeacherProfile.user_id == user.id).first()
    if not teacher:
        raise HTTPException(404, "Teacher profile not found")

    routines = db.query(Routine).filter(
        Routine.teacher_id == teacher.id
    ).order_by(Routine.day, Routine.period_id).all()

    result = []
    for r in routines:
        cls = db.get(SchoolClass, r.class_id)
        sec = db.get(Section, r.section_id)
        subj = db.get(Subject, r.subject_id)
        period = db.get(Period, r.period_id)

        result.append({
            "id": r.id,
            "day": r.day.value,
            "period_label": period.label if period else None,
            "start_time": period.start_time.isoformat() if period else None,
            "end_time": period.end_time.isoformat() if period else None,
            "class_id": r.class_id,
            "class_name": cls.name if cls else None,
            "section_id": r.section_id,
            "section_name": sec.name if sec else None,
            "group": r.group,
            "subject_id": r.subject_id,
            "subject_name": subj.name if subj else None,
        })

    return result


@router.get("/grid")
def routine_grid(
    class_id: int = Query(...),
    section_id: int = Query(...),
    academic_year_id: int | None = None,
    group: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get routine as a grid (day x period) for a class-section."""
    query = db.query(Routine).filter(
        Routine.class_id == class_id,
        Routine.section_id == section_id,
    )
    if academic_year_id:
        query = query.filter(Routine.academic_year_id == academic_year_id)
    if group:
        query = query.filter((Routine.group == group) | (Routine.group.is_(None)))

    routines = query.order_by(Routine.day, Routine.period_id).all()

    # Get all periods
    periods_query = db.query(Period)
    if academic_year_id:
        periods_query = periods_query.filter(Period.academic_year_id == academic_year_id)
    periods = periods_query.order_by(Period.period_number).all()

    # Build grid
    grid = {}
    for r in routines:
        day = r.day.value
        period = db.get(Period, r.period_id)
        subj = db.get(Subject, r.subject_id)
        tch = db.get(TeacherProfile, r.teacher_id)

        if day not in grid:
            grid[day] = {}

        grid[day][r.period_id] = {
            "subject": subj.name if subj else None,
            "teacher": f"{tch.first_name} {tch.last_name}" if tch else None,
            "period_label": period.label if period else None,
            "start_time": period.start_time.isoformat() if period else None,
            "end_time": period.end_time.isoformat() if period else None,
        }

    return {
        "periods": [
            {
                "id": p.id,
                "number": p.period_number,
                "label": p.label,
                "start_time": p.start_time.isoformat(),
                "end_time": p.end_time.isoformat(),
            }
            for p in periods
        ],
        "days": [d.value for d in DayOfWeek if d not in (DayOfWeek.FRIDAY, DayOfWeek.SATURDAY)],
        "grid": grid,
    }
