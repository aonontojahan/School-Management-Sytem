from datetime import date, time

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_admin, require_teacher
from app.db.session import get_db
from app.models.academic import SchoolClass, Section, Subject, class_group_subjects
from app.models.enums import UserRole
from app.models.exam import Exam, ExamRoutine, Mark
from app.models.people import StudentProfile, TeacherProfile
from app.models.user import User
from app.schemas.exams import ExamCreate, ExamOut, ExamRoutineCreate, ExamRoutineOut, MarkBulkIn, MarkOut, ReportCardOut, ReportCardRow
from app.services.grading import grade_for, summarize

router = APIRouter(prefix="/exams", tags=["exams"])


@router.get("", response_model=list[ExamOut])
def list_exams(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.role.value == "STUDENT":
        from app.models.people import StudentProfile
        from sqlalchemy import or_
        student = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
        if student and student.class_id:
            return db.query(Exam).filter(
                or_(Exam.class_id == student.class_id, Exam.class_id.is_(None))
            ).order_by(Exam.id.desc()).all()
        else:
            return db.query(Exam).filter(Exam.class_id.is_(None)).order_by(Exam.id.desc()).all()
    return db.query(Exam).order_by(Exam.id.desc()).all()


@router.post("", response_model=ExamOut, status_code=201, dependencies=[Depends(require_admin)])
def create_exam(data: ExamCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    e = Exam(**data.model_dump(), created_by=user.id)
    db.add(e)
    db.commit()
    db.refresh(e)

    # Notify all students in the class
    from app.models.notification import Notification
    from app.models.user import User as UserModel
    from app.models.enums import UserRole
    students = db.query(UserModel).filter(UserModel.role == UserRole.STUDENT, UserModel.is_active == True).all()
    date_range = ""
    if data.start_date and data.end_date:
        date_range = f" from {data.start_date} to {data.end_date}"
    elif data.start_date:
        date_range = f" starting {data.start_date}"
    for student_user in students:
        n = Notification(
            user_id=student_user.id,
            title=f"Exam Scheduled: {data.name}",
            message=f"A new exam '{data.name}' has been scheduled{date_range}. Total marks: {data.total_marks}, Passing marks: {data.passing_marks}.",
            type="EXAM",
            ref_id=e.id,
        )
        db.add(n)
    db.commit()

    return e


@router.delete("/{exam_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_exam(exam_id: int, db: Session = Depends(get_db)):
    exam = db.get(Exam, exam_id)
    if not exam:
        raise HTTPException(404, "Exam not found")
    db.delete(exam)
    db.commit()


@router.post("/{exam_id}/marks", response_model=list[MarkOut], dependencies=[Depends(require_teacher)])
def upsert_marks(exam_id: int, data: MarkBulkIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    exam = db.get(Exam, exam_id)
    if not exam:
        raise HTTPException(404, "Exam not found")
    out = []
    for m in data.marks:
        grade, gpa = grade_for(m.marks_obtained)
        existing = (
            db.query(Mark)
            .filter(Mark.exam_id == exam_id, Mark.student_id == m.student_id, Mark.subject_id == m.subject_id)
            .first()
        )
        if existing:
            existing.marks_obtained = m.marks_obtained
            existing.grade = grade
            existing.gpa_point = gpa
            existing.remarks = m.remarks
            existing.graded_by = user.id
            out.append(existing)
        else:
            row = Mark(
                exam_id=exam_id,
                student_id=m.student_id,
                subject_id=m.subject_id,
                marks_obtained=m.marks_obtained,
                grade=grade,
                gpa_point=gpa,
                remarks=m.remarks,
                graded_by=user.id,
            )
            db.add(row)
            out.append(row)
    db.commit()
    for r in out:
        db.refresh(r)
    return out


@router.get("/me/marks")
def my_marks(
    exam_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Student: get own marks for an exam."""
    student = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    if not student:
        raise HTTPException(404, "No student profile linked to this login")

    marks = db.query(Mark).filter(Mark.exam_id == exam_id, Mark.student_id == student.id).all()
    exam = db.get(Exam, exam_id)
    rows = []
    for mk in marks:
        subj = db.get(Subject, mk.subject_id)
        rows.append(ReportCardRow(subject_id=mk.subject_id, subject_name=subj.name if subj else "?", marks=mk.marks_obtained, grade=mk.grade, remarks=mk.remarks))

    summary = summarize([m.marks_obtained for m in marks])
    total_possible = len(marks) * (exam.total_marks if exam else 100) if marks else 0
    pct = round(summary["total"] / total_possible * 100, 2) if total_possible else 0.0

    return ReportCardOut(
        student_id=student.id,
        student_name=f"{student.first_name} {student.last_name}",
        exam_id=exam_id,
        rows=rows,
        total=summary["total"],
        percentage=pct,
        gpa=summary["gpa"],
        result=summary["result"],
    )


@router.get("/all-marks")
def admin_all_marks(
    exam_id: int | None = None,
    class_id: int | None = None,
    section_id: int | None = None,
    student_id: int | None = None,
    q: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    """Admin: get all marks with filters. Returns grouped by student."""
    q_marks = db.query(Mark)
    if exam_id:
        q_marks = q_marks.filter(Mark.exam_id == exam_id)
    if student_id:
        q_marks = q_marks.filter(Mark.student_id == student_id)

    marks = q_marks.all()

    # Filter by class/section via student profile
    if class_id or section_id or q:
        filtered = []
        for m in marks:
            student = db.get(StudentProfile, m.student_id)
            if not student:
                continue
            if class_id and student.class_id != class_id:
                continue
            if section_id and student.section_id != section_id:
                continue
            if q:
                like = f"%{q}%"
                full_name = f"{student.first_name} {student.last_name}"
                if not (full_name.lower().startswith(q.lower()) or student.student_code.lower().startswith(q.lower())):
                    continue
            filtered.append(m)
        marks = filtered

    # Group by student
    students_map: dict[int, dict] = {}
    for m in marks:
        sid = m.student_id
        if sid not in students_map:
            student = db.get(StudentProfile, sid)
            exam = db.get(Exam, m.exam_id)
            students_map[sid] = {
                "student_id": sid,
                "student_name": f"{student.first_name} {student.last_name}" if student else "?",
                "student_code": student.student_code if student else "?",
                "roll_number": student.roll_number if student else None,
                "class_id": student.class_id if student else None,
                "section_id": student.section_id if student else None,
                "exam_id": m.exam_id,
                "exam_name": exam.name if exam else "?",
                "marks": [],
                "total": 0.0,
                "gpa": 0.0,
                "result": "N/A",
            }
        subj = db.get(Subject, m.subject_id)
        students_map[sid]["marks"].append({
            "subject_id": m.subject_id,
            "subject_name": subj.name if subj else "?",
            "marks_obtained": m.marks_obtained,
            "grade": m.grade,
            "gpa_point": m.gpa_point,
            "remarks": m.remarks,
        })
        students_map[sid]["total"] += m.marks_obtained

    # Compute GPA per student
    for entry in students_map.values():
        if entry["marks"]:
            gpas = [mk["gpa_point"] for mk in entry["marks"]]
            entry["gpa"] = round(sum(gpas) / len(gpas), 2)
            passed = all(mk["marks_obtained"] >= 33 for mk in entry["marks"])
            entry["result"] = "PASS" if passed else "FAIL"

    result = sorted(students_map.values(), key=lambda x: (x["class_id"] or 0, x["section_id"] or 0, x["roll_number"] or 0))
    return result


@router.get("/students-marks")
def teacher_students_marks(
    exam_id: int,
    class_id: int,
    section_id: int | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_teacher),
):
    """Teacher: get students + existing marks for an exam+class+section."""
    teacher = db.query(TeacherProfile).filter(TeacherProfile.user_id == user.id).first()
    if not teacher:
        raise HTTPException(404, "Teacher profile not found")

    # Get teacher's assigned subject IDs
    teacher_subject_ids = {s.id for s in teacher.subjects}

    # Get subjects for this class
    cls = db.get(SchoolClass, class_id)
    if not cls:
        raise HTTPException(404, "Class not found")

    class_subjects_list = cls.subjects
    class_subject_ids = {s.id for s in class_subjects_list}

    # Subjects the teacher can grade for this class
    assignable_subject_ids = teacher_subject_ids & class_subject_ids
    assignable_subjects = [s for s in class_subjects_list if s.id in assignable_subject_ids]

    # Get students
    student_q = db.query(StudentProfile).filter(StudentProfile.class_id == class_id, StudentProfile.status == "ACTIVE")
    if section_id:
        student_q = student_q.filter(StudentProfile.section_id == section_id)
    students = student_q.order_by(StudentProfile.roll_number.asc().nullslast()).all()

    # Get existing marks for this exam
    student_ids = [s.id for s in students]
    existing_marks = db.query(Mark).filter(
        Mark.exam_id == exam_id,
        Mark.student_id.in_(student_ids),
    ).all()

    marks_by_student: dict[int, list] = {}
    for m in existing_marks:
        marks_by_student.setdefault(m.student_id, []).append({
        })

    # Build student list with marks
    students_data = []
    for s in students:
        s_marks = db.query(Mark).filter(Mark.exam_id == exam_id, Mark.student_id == s.id).all()
        marks_dict = {m.subject_id: m for m in s_marks}
        subjects_data = []
        for subj in assignable_subjects:
            m = marks_dict.get(subj.id)
            subjects_data.append({
                "subject_id": subj.id,
                "subject_name": subj.name,
                "marks_obtained": m.marks_obtained if m else None,
                "grade": m.grade if m else None,
                "gpa_point": m.gpa_point if m else None,
                "remarks": m.remarks if m else None,
            })
        students_data.append({
            "student_id": s.id,
            "student_name": f"{s.first_name} {s.last_name}",
            "student_code": s.student_code,
            "roll_number": s.roll_number,
            "subjects": subjects_data,
        })

    return {
        "exam_id": exam_id,
        "class_id": class_id,
        "section_id": section_id,
        "assignable_subjects": [{"id": s.id, "name": s.name} for s in assignable_subjects],
        "students": students_data,
    }


@router.get("/{exam_id}/marks", response_model=list[MarkOut])
def list_marks(exam_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Mark).filter(Mark.exam_id == exam_id).all()


@router.get("/{exam_id}/report/{student_id}", response_model=ReportCardOut)
def report_card(exam_id: int, student_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    student = db.get(StudentProfile, student_id)
    if not student:
        raise HTTPException(404, "Student not found")
    marks = db.query(Mark).filter(Mark.exam_id == exam_id, Mark.student_id == student_id).all()
    exam = db.get(Exam, exam_id)
    rows = []
    for mk in marks:
        subj = db.get(Subject, mk.subject_id)
        rows.append(ReportCardRow(subject_id=mk.subject_id, subject_name=subj.name if subj else "?", marks=mk.marks_obtained, grade=mk.grade, remarks=mk.remarks))
    summary = summarize([m.marks_obtained for m in marks])
    total_possible = len(marks) * (exam.total_marks if exam else 100) if marks else 0
    pct = round(summary["total"] / total_possible * 100, 2) if total_possible else 0.0
    return ReportCardOut(
        student_id=student_id,
        student_name=f"{student.first_name} {student.last_name}",
        exam_id=exam_id,
        rows=rows,
        total=summary["total"],
        percentage=pct,
        gpa=summary["gpa"],
        result=summary["result"],
    )


# ── Exam Routine endpoints ──────────────────────────────────────────────────

@router.get("/routines")
def list_exam_routines(
    exam_id: int | None = None,
    class_id: int | None = None,
    group: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(ExamRoutine)
    if exam_id:
        q = q.filter(ExamRoutine.exam_id == exam_id)
    if class_id:
        q = q.filter(ExamRoutine.class_id == class_id)
    if group:
        q = q.filter(ExamRoutine.group == group)
    if user.role.value == "STUDENT":
        student = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
        if student and student.class_id:
            q = q.filter(ExamRoutine.class_id == student.class_id)
            if student.group:
                q = q.filter(
                    (ExamRoutine.group == student.group) | (ExamRoutine.group.is_(None))
                )
    if user.role.value == "TEACHER":
        teacher = db.query(TeacherProfile).filter(TeacherProfile.user_id == user.id).first()
        if teacher:
            q = q.filter(ExamRoutine.teacher_id == teacher.id)
    routines = q.order_by(ExamRoutine.exam_date, ExamRoutine.start_time).all()
    result = []
    for r in routines:
        exam = db.get(Exam, r.exam_id)
        cls = db.get(SchoolClass, r.class_id)
        sec = db.get(Section, r.section_id) if r.section_id else None
        subj = db.get(Subject, r.subject_id)
        teacher = db.get(TeacherProfile, r.teacher_id) if r.teacher_id else None
        result.append({
            "id": r.id,
            "exam_id": r.exam_id,
            "exam_name": exam.name if exam else None,
            "exam_type": exam.exam_type.value if exam else None,
            "class_id": r.class_id,
            "class_name": cls.name if cls else None,
            "section_id": r.section_id,
            "section_name": sec.name if sec else None,
            "subject_id": r.subject_id,
            "subject_name": subj.name if subj else None,
            "teacher_id": r.teacher_id,
            "teacher_name": f"{teacher.first_name} {teacher.last_name}" if teacher else None,
            "group": r.group,
            "exam_date": r.exam_date.isoformat() if r.exam_date else None,
            "start_time": r.start_time.strftime("%H:%M") if r.start_time else None,
            "end_time": r.end_time.strftime("%H:%M") if r.end_time else None,
            "room": r.room,
        })
    return result


@router.post("/routines", status_code=201, dependencies=[Depends(require_admin)])
def create_exam_routine(data: ExamRoutineCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    r = ExamRoutine(**data.model_dump())
    db.add(r)
    db.commit()
    db.refresh(r)

    # Notify students in the class + assigned teacher
    from app.models.notification import Notification
    from app.models.user import User as UserModel
    exam = db.get(Exam, data.exam_id)
    cls = db.get(SchoolClass, data.class_id)
    subj = db.get(Subject, data.subject_id)
    exam_name = exam.name if exam else "Exam"
    class_name = cls.name if cls else ""
    subject_name = subj.name if subj else ""
    date_str = data.exam_date.isoformat() if data.exam_date else "TBA"
    time_str = f"{data.start_time.strftime('%H:%M')}-{data.end_time.strftime('%H:%M')}" if data.start_time and data.end_time else ""
    room_str = f", Room: {data.room}" if data.room else ""

    msg = f"{subject_name} exam on {date_str} {time_str}{room_str}. Class: {class_name}"

    # Notify students in this class
    students = db.query(UserModel).filter(UserModel.role == UserRole.STUDENT, UserModel.is_active == True).all()
    for s in students:
        n = Notification(user_id=s.id, title=f"Exam Routine: {exam_name}", message=msg, type="EXAM", ref_id=data.exam_id)
        db.add(n)

    # Notify teacher if assigned
    if data.teacher_id:
        teacher = db.get(TeacherProfile, data.teacher_id)
        if teacher and teacher.user_id:
            n = Notification(user_id=teacher.user_id, title=f"Exam Duty: {exam_name}", message=msg, type="EXAM", ref_id=data.exam_id)
            db.add(n)

    db.commit()
    return {"id": r.id, "ok": True}


@router.post("/routines/bulk", status_code=201, dependencies=[Depends(require_admin)])
def bulk_create_exam_routines(items: list[ExamRoutineCreate], db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Create multiple exam routine entries at once."""
    created = []
    for data in items:
        r = ExamRoutine(**data.model_dump())
        db.add(r)
        created.append(r)
    db.commit()
    for r in created:
        db.refresh(r)

    # Notify all students + teachers in one batch
    from app.models.notification import Notification
    from app.models.user import User as UserModel
    if items:
        exam = db.get(Exam, items[0].exam_id)
        exam_name = exam.name if exam else "Exam"
        students = db.query(UserModel).filter(UserModel.role == UserRole.STUDENT, UserModel.is_active == True).all()
        teachers = db.query(UserModel).filter(UserModel.role == UserRole.TEACHER, UserModel.is_active == True).all()
        notify_users = students + teachers
        for u in notify_users:
            n = Notification(
                user_id=u.id,
                title=f"Exam Routine Published: {exam_name}",
                message=f"The exam routine for '{exam_name}' has been published. Check your exam schedule for details.",
                type="EXAM",
                ref_id=items[0].exam_id,
            )
            db.add(n)
        db.commit()

    return [{"id": r.id, "ok": True} for r in created]


@router.delete("/routines/{routine_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_exam_routine(routine_id: int, db: Session = Depends(get_db)):
    r = db.get(ExamRoutine, routine_id)
    if not r:
        raise HTTPException(404, "Exam routine not found")
    db.delete(r)
    db.commit()


@router.put("/routines/{routine_id}", dependencies=[Depends(require_admin)])
def update_exam_routine(routine_id: int, data: ExamRoutineCreate, db: Session = Depends(get_db)):
    r = db.get(ExamRoutine, routine_id)
    if not r:
        raise HTTPException(404, "Exam routine not found")
    for field, value in data.model_dump().items():
        setattr(r, field, value)
    db.commit()
    db.refresh(r)

    cls = db.get(SchoolClass, r.class_id)
    subj = db.get(Subject, r.subject_id)
    teacher = db.get(TeacherProfile, r.teacher_id) if r.teacher_id else None
    exam = db.get(Exam, r.exam_id)
    return {
        "id": r.id,
        "class_name": cls.name if cls else None,
        "subject_name": subj.name if subj else None,
        "teacher_name": f"{teacher.first_name} {teacher.last_name}" if teacher else None,
        "exam_name": exam.name if exam else None,
        "exam_date": r.exam_date.isoformat() if r.exam_date else None,
        "start_time": r.start_time.strftime("%H:%M") if r.start_time else None,
        "end_time": r.end_time.strftime("%H:%M") if r.end_time else None,
        "room": r.room,
    }


def _get_scheduling_rules(exam_type: str):
    """Return scheduling rules based on exam type.
    - CLASS_TEST / MONTHLY_TEST: 45-min exams, 6 per day, up to 3 days (max 18 subjects).
    - MID_TERM / FINAL: 3-hour exams, 2 per day (9-12, 13-16), up to 15 days (max 30 subjects).
    """
    if exam_type in ("CLASS_TEST", "MONTHLY_TEST"):
        return {
            "slots_per_day": 6,
            "max_days": 3,
            "slots": [
                ("09:00", "09:45"),
                ("10:00", "10:45"),
                ("11:00", "11:45"),
                ("12:00", "12:45"),
                ("13:00", "13:45"),
                ("14:00", "14:45"),
            ],
        }
    else:  # MID_TERM, FINAL
        return {
            "slots_per_day": 2,
            "max_days": 15,
            "slots": [
                ("09:00", "12:00"),
                ("13:00", "16:00"),
            ],
        }


@router.get("/routines/auto-generate", dependencies=[Depends(require_admin)])
def auto_generate_routine_preview(
    exam_id: int, class_id: int, start_date: str,
    group: str | None = Query(None, description="SCIENCE, HUMANITIES, BUSINESS_STUDIES"),
    db: Session = Depends(get_db),
):
    """Auto-generate exam routine preview.
    - Monthly: 45-min exams, 6/day, up to 3 days.
    - Half-yearly/Final: 3-hour exams, 2/day (9-12, 13-16), up to 15 days.
    If group is provided, routine includes common + group-specific subjects."""
    from datetime import timedelta
    import math

    exam = db.get(Exam, exam_id)
    if not exam:
        raise HTTPException(404, "Exam not found")
    cls = db.get(SchoolClass, class_id)
    if not cls:
        raise HTTPException(404, "Class not found")

    rules = _get_scheduling_rules(exam.exam_type.value)

    # Common subjects (all groups)
    common_subjects = cls.subjects

    # Group-specific subjects
    group_subjects = []
    if group:
        stmt = (
            select(Subject)
            .join(class_group_subjects, class_group_subjects.c.subject_id == Subject.id)
            .where(
                class_group_subjects.c.class_id == class_id,
                class_group_subjects.c.group_name == group,
            )
        )
        group_subjects = list(db.execute(stmt).scalars().all())

    # Combine: common + group-specific (deduplicated)
    seen_ids = set()
    subjects = []
    for s in common_subjects + group_subjects:
        if s.id not in seen_ids:
            seen_ids.add(s.id)
            subjects.append(s)

    if not subjects:
        raise HTTPException(400, "No subjects assigned to this class" + (f" for group {group}" if group else ""))

    try:
        start = date.fromisoformat(start_date)
    except ValueError:
        raise HTTPException(400, "Invalid start_date format (YYYY-MM-DD)")

    # Calculate how many days we need
    slots_per_day = rules["slots_per_day"]
    total_days_needed = math.ceil(len(subjects) / slots_per_day)
    total_days = min(total_days_needed, rules["max_days"])

    # Generate weekday dates
    days = []
    current = start
    while len(days) < total_days:
        while current.weekday() in (4, 5):  # Fri=4, Sat=5
            current += timedelta(days=1)
        days.append(current)
        current += timedelta(days=1)

    SLOTS = rules["slots"]

    preview = []
    for idx, subj in enumerate(subjects):
        slot_idx = idx % slots_per_day
        day_offset = idx // slots_per_day
        if day_offset >= total_days:
            break  # exceeded max days, skip remaining subjects
        exam_date = days[day_offset]

        st = time.fromisoformat(SLOTS[slot_idx][0])
        et = time.fromisoformat(SLOTS[slot_idx][1])

        preview.append({
            "subject_id": subj.id,
            "subject_name": subj.name,
            "exam_date": exam_date.isoformat(),
            "start_time": st.strftime("%H:%M"),
            "end_time": et.strftime("%H:%M"),
            "slot": slot_idx + 1,
            "day": day_offset + 1,
            "room": None,
            "teacher_id": None,
            "teacher_name": None,
            "group": group,
        })

    return {
        "exam_id": exam_id,
        "exam_name": exam.name,
        "exam_type": exam.exam_type.value,
        "class_id": class_id,
        "class_name": cls.name,
        "group": group,
        "total_subjects": len(preview),
        "total_days": total_days,
        "max_days": rules["max_days"],
        "slots_per_day": slots_per_day,
        "time_slots": [{"slot": i + 1, "start": s[0], "end": s[1]} for i, s in enumerate(SLOTS)],
        "items": preview,
    }


@router.post("/routines/auto-generate", status_code=201, dependencies=[Depends(require_admin)])
def auto_generate_and_save(
    exam_id: int, class_id: int, start_date: str,
    group: str | None = Query(None, description="SCIENCE, HUMANITIES, BUSINESS_STUDIES"),
    db: Session = Depends(get_db), user: User = Depends(get_current_user),
):
    """Auto-generate and save exam routine.
    - Monthly: 45-min exams, 6/day, up to 3 days.
    - Half-yearly/Final: 3-hour exams, 2/day (9-12, 13-16), up to 15 days.
    If group is provided, routine includes common + group-specific subjects."""
    from datetime import timedelta
    import math

    exam = db.get(Exam, exam_id)
    if not exam:
        raise HTTPException(404, "Exam not found")
    cls = db.get(SchoolClass, class_id)
    if not cls:
        raise HTTPException(404, "Class not found")

    rules = _get_scheduling_rules(exam.exam_type.value)

    # Common subjects (all groups)
    common_subjects = cls.subjects

    # Group-specific subjects
    group_subjects = []
    if group:
        stmt = (
            select(Subject)
            .join(class_group_subjects, class_group_subjects.c.subject_id == Subject.id)
            .where(
                class_group_subjects.c.class_id == class_id,
                class_group_subjects.c.group_name == group,
            )
        )
        group_subjects = list(db.execute(stmt).scalars().all())

    # Combine: common + group-specific (deduplicated)
    seen_ids = set()
    subjects = []
    for s in common_subjects + group_subjects:
        if s.id not in seen_ids:
            seen_ids.add(s.id)
            subjects.append(s)

    if not subjects:
        raise HTTPException(400, "No subjects assigned to this class" + (f" for group {group}" if group else ""))

    try:
        start = date.fromisoformat(start_date)
    except ValueError:
        raise HTTPException(400, "Invalid start_date format (YYYY-MM-DD)")

    slots_per_day = rules["slots_per_day"]
    total_days_needed = math.ceil(len(subjects) / slots_per_day)
    total_days = min(total_days_needed, rules["max_days"])

    days = []
    current = start
    while len(days) < total_days:
        while current.weekday() in (4, 5):
            current += timedelta(days=1)
        days.append(current)
        current += timedelta(days=1)

    SLOTS = rules["slots"]

    # Delete existing routines for this exam+class+group
    delete_filter = [
        ExamRoutine.exam_id == exam_id,
        ExamRoutine.class_id == class_id,
    ]
    if group:
        delete_filter.append(ExamRoutine.group == group)
    else:
        delete_filter.append(ExamRoutine.group.is_(None))
    db.query(ExamRoutine).filter(*delete_filter).delete()

    created = []
    for idx, subj in enumerate(subjects):
        slot_idx = idx % slots_per_day
        day_offset = idx // slots_per_day
        if day_offset >= total_days:
            break
        exam_date = days[day_offset]

        st = time.fromisoformat(SLOTS[slot_idx][0])
        et = time.fromisoformat(SLOTS[slot_idx][1])

        r = ExamRoutine(
            exam_id=exam_id, class_id=class_id, subject_id=subj.id,
            group=group,
            exam_date=exam_date, start_time=st, end_time=et,
        )
        db.add(r)
        created.append(r)

    db.commit()
    for r in created:
        db.refresh(r)

    # Notify students + teachers
    from app.models.notification import Notification
    from app.models.user import User as UserModel
    students = db.query(UserModel).filter(UserModel.role == UserRole.STUDENT, UserModel.is_active == True).all()
    teachers = db.query(UserModel).filter(UserModel.role == UserRole.TEACHER, UserModel.is_active == True).all()
    for u in students + teachers:
        n = Notification(
            user_id=u.id,
            title=f"Exam Routine Published: {exam.name}",
            message=f"The exam routine for '{exam.name}' ({cls.name}) has been published. Check your exam schedule.",
            type="EXAM", ref_id=exam_id,
        )
        db.add(n)
    db.commit()

    return {"generated": len(created), "class_name": cls.name, "exam_name": exam.name}


@router.delete("/routines", status_code=204, dependencies=[Depends(require_admin)])
def delete_exam_routines_by_exam(exam_id: int, db: Session = Depends(get_db)):
    """Delete all routines for an exam."""
    db.query(ExamRoutine).filter(ExamRoutine.exam_id == exam_id).delete()
    db.commit()
