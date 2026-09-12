"""Admin-only management endpoints for students and teachers with account creation."""
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_admin
from app.core.security import hash_password
from app.db.session import get_db
from app.models.academic import SchoolClass, Section, Subject
from app.models.enums import PersonStatus, StudentGroup, UserRole
from app.models.people import StudentProfile, TeacherProfile
from app.models.routine import Period
from app.models.user import User
from app.schemas.students import StudentCreate, StudentOut, StudentUpdate
from app.schemas.people import TeacherCreate, TeacherOut, TeacherUpdate
from app.schemas.auth import PasswordResetIn

router = APIRouter(prefix="/admin", tags=["admin"])


def _next_student_code(db: Session) -> str:
    n = db.query(StudentProfile).count() + 1
    return f"STU-{(n):06d}"


def _next_teacher_code(db: Session) -> str:
    n = db.query(TeacherProfile).count() + 1
    return f"TCH-{n:05d}"


@router.post("/students", response_model=StudentOut, status_code=status.HTTP_201_CREATED)
def admin_create_student(data: StudentCreate, db: Session = Depends(get_db)):
    """Create a student profile AND a linked user account in one transaction."""
    if data.email and db.query(StudentProfile).filter(StudentProfile.email == data.email).first():
        raise HTTPException(400, "Student email already exists")

    user_id = None
    if data.email:
        if db.query(User).filter(User.email == data.email).first():
            raise HTTPException(400, "A user with this email already exists")

        if not hasattr(data, "initial_password") or not data.initial_password:
            raise HTTPException(400, "initial_password is required when creating a new student with email")

        user = User(
            email=data.email,
            username=data.email.split("@")[0],
            hashed_password=hash_password(data.initial_password),
            role=UserRole.STUDENT,
            is_active=True,
        )
        db.add(user)
        db.flush()
        user_id = user.id

    student = StudentProfile(
        user_id=user_id,
        student_code=_next_student_code(db),
        first_name=data.first_name,
        last_name=data.last_name,
        date_of_birth=data.date_of_birth,
        gender=data.gender,
        email=data.email,
        phone=data.phone,
        address=data.address,
        admission_date=data.admission_date,
        academic_year_id=data.academic_year_id,
        class_id=data.class_id,
        section_id=data.section_id,
        group=data.group,
        roll_number=data.roll_number,
        division=data.division,
        guardian_name=data.guardian_name,
        guardian_phone=data.guardian_phone,
        status=PersonStatus.ACTIVE,
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


@router.post("/teachers", response_model=TeacherOut, status_code=status.HTTP_201_CREATED)
def admin_create_teacher(data: TeacherCreate, db: Session = Depends(get_db)):
    """Create a teacher profile AND a linked user account in one transaction."""
    if data.email and db.query(TeacherProfile).filter(TeacherProfile.email == data.email).first():
        raise HTTPException(400, "Teacher email already exists")

    user_id = None
    if data.email:
        if db.query(User).filter(User.email == data.email).first():
            raise HTTPException(400, "A user with this email already exists")

        if not hasattr(data, "initial_password") or not data.initial_password:
            raise HTTPException(400, "initial_password is required when creating a new teacher with email")

        user = User(
            email=data.email,
            username=data.email.split("@")[0],
            hashed_password=hash_password(data.initial_password),
            role=UserRole.TEACHER,
            is_active=True,
        )
        db.add(user)
        db.flush()
        user_id = user.id

    t = TeacherProfile(
        user_id=user_id,
        teacher_code=_next_teacher_code(db),
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        phone=data.phone,
        department=data.department,
        joining_date=data.joining_date,
        designation=data.designation,
        status=PersonStatus.ACTIVE,
    )
    if data.subject_ids:
        t.subjects = db.query(Subject).filter(Subject.id.in_(data.subject_ids)).all()
    if data.section_ids:
        t.sections = db.query(Section).filter(Section.id.in_(data.section_ids)).all()
    db.add(t)
    db.commit()
    db.refresh(t)
    return t


@router.patch("/students/{student_id}/reset-password", response_model=StudentOut)
def admin_reset_student_password(
    student_id: int, data: PasswordResetIn, db: Session = Depends(get_db)
):
    """Admin resets a student's login password."""
    student = db.get(StudentProfile, student_id)
    if not student:
        raise HTTPException(404, "Student not found")
    if not student.user_id:
        raise HTTPException(400, "Student has no linked login account")
    user = db.get(User, student.user_id)
    if not user:
        raise HTTPException(404, "Linked user not found")
    user.hashed_password = hash_password(data.new_password)
    db.commit()
    db.refresh(student)
    return student


@router.patch("/teachers/{teacher_id}/reset-password", response_model=TeacherOut)
def admin_reset_teacher_password(
    teacher_id: int, data: PasswordResetIn, db: Session = Depends(get_db)
):
    """Admin resets a teacher's login password."""
    teacher = db.get(TeacherProfile, teacher_id)
    if not teacher:
        raise HTTPException(404, "Teacher not found")
    if not teacher.user_id:
        raise HTTPException(400, "Teacher has no linked login account")
    user = db.get(User, teacher.user_id)
    if not user:
        raise HTTPException(404, "Linked user not found")
    user.hashed_password = hash_password(data.new_password)
    db.commit()
    db.refresh(teacher)
    return teacher


@router.get("/students", response_model=list[StudentOut])
def admin_list_students(
    q: str | None = None,
    class_id: int | None = None,
    section_id: int | None = None,
    status: PersonStatus | None = None,
    division: str | None = None,
    skip: int = 0,
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    query = db.query(StudentProfile)
    if q:
        like = f"%{q}%"
        query = query.filter(
            (StudentProfile.first_name.ilike(like))
            | (StudentProfile.last_name.ilike(like))
            | (StudentProfile.student_code.ilike(like))
            | (StudentProfile.email.ilike(like))
        )
    if class_id:
        query = query.filter(StudentProfile.class_id == class_id)
    if section_id:
        query = query.filter(StudentProfile.section_id == section_id)
    if status:
        query = query.filter(StudentProfile.status == status)
    if division:
        query = query.filter(StudentProfile.division == division)
    return query.order_by(StudentProfile.id).offset(skip).limit(limit).all()


@router.get("/teachers", response_model=list[TeacherOut])
def admin_list_teachers(
    q: str | None = None,
    status: PersonStatus | None = None,
    department: str | None = None,
    skip: int = 0,
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    query = db.query(TeacherProfile)
    if q:
        like = f"%{q}%"
        query = query.filter(
            (TeacherProfile.first_name.ilike(like))
            | (TeacherProfile.last_name.ilike(like))
            | (TeacherProfile.teacher_code.ilike(like))
            | (TeacherProfile.email.ilike(like))
        )
    if status:
        query = query.filter(TeacherProfile.status == status)
    if department:
        query = query.filter(TeacherProfile.department.ilike(f"%{department}%"))
    return query.order_by(TeacherProfile.id).offset(skip).limit(limit).all()


@router.get("/departments")
def admin_list_departments(user: User = Depends(require_admin)):
    from app.seed import DEFAULT_DEPARTMENTS
    return DEFAULT_DEPARTMENTS


@router.get("/students/{student_id}", response_model=StudentOut)
def admin_get_student(student_id: int, db: Session = Depends(get_db), user: User = Depends(require_admin)):
    student = db.get(StudentProfile, student_id)
    if not student:
        raise HTTPException(404, "Student not found")
    return student


@router.get("/teachers/{teacher_id}", response_model=TeacherOut)
def admin_get_teacher(teacher_id: int, db: Session = Depends(get_db), user: User = Depends(require_admin)):
    teacher = db.get(TeacherProfile, teacher_id)
    if not teacher:
        raise HTTPException(404, "Teacher not found")
    return teacher


@router.patch("/students/{student_id}", response_model=StudentOut)
def admin_update_student(
    student_id: int, data: StudentUpdate, db: Session = Depends(get_db), user: User = Depends(require_admin)
):
    student = db.get(StudentProfile, student_id)
    if not student:
        raise HTTPException(404, "Student not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(student, k, v)
    db.commit()
    db.refresh(student)
    return student


@router.patch("/teachers/{teacher_id}", response_model=TeacherOut)
def admin_update_teacher(
    teacher_id: int, data: TeacherUpdate, db: Session = Depends(get_db), user: User = Depends(require_admin)
):
    teacher = db.get(TeacherProfile, teacher_id)
    if not teacher:
        raise HTTPException(404, "Teacher not found")
    payload = data.model_dump(exclude_unset=True, exclude={"subject_ids", "section_ids"})
    for k, v in payload.items():
        setattr(teacher, k, v)
    if data.subject_ids is not None:
        teacher.subjects = db.query(Subject).filter(Subject.id.in_(data.subject_ids)).all()
    if data.section_ids is not None:
        teacher.sections = db.query(Section).filter(Section.id.in_(data.section_ids)).all()
    db.commit()
    db.refresh(teacher)
    return teacher


@router.patch("/students/{student_id}/deactivate", response_model=StudentOut)
def admin_deactivate_student(student_id: int, db: Session = Depends(get_db), user: User = Depends(require_admin)):
    student = db.get(StudentProfile, student_id)
    if not student:
        raise HTTPException(404, "Student not found")
    student.status = PersonStatus.INACTIVE
    if student.user_id:
        linked_user = db.get(User, student.user_id)
        if linked_user:
            linked_user.is_active = False
    db.commit()
    db.refresh(student)
    return student


@router.patch("/students/{student_id}/activate", response_model=StudentOut)
def admin_activate_student(student_id: int, db: Session = Depends(get_db), user: User = Depends(require_admin)):
    student = db.get(StudentProfile, student_id)
    if not student:
        raise HTTPException(404, "Student not found")
    student.status = PersonStatus.ACTIVE
    if student.user_id:
        linked_user = db.get(User, student.user_id)
        if linked_user:
            linked_user.is_active = True
    db.commit()
    db.refresh(student)
    return student


@router.patch("/teachers/{teacher_id}/deactivate", response_model=TeacherOut)
def admin_deactivate_teacher(teacher_id: int, db: Session = Depends(get_db), user: User = Depends(require_admin)):
    teacher = db.get(TeacherProfile, teacher_id)
    if not teacher:
        raise HTTPException(404, "Teacher not found")
    teacher.status = PersonStatus.INACTIVE
    if teacher.user_id:
        linked_user = db.get(User, teacher.user_id)
        if linked_user:
            linked_user.is_active = False
    db.commit()
    db.refresh(teacher)
    return teacher


@router.patch("/teachers/{teacher_id}/activate", response_model=TeacherOut)
def admin_activate_teacher(teacher_id: int, db: Session = Depends(get_db), user: User = Depends(require_admin)):
    teacher = db.get(TeacherProfile, teacher_id)
    if not teacher:
        raise HTTPException(404, "Teacher not found")
    teacher.status = PersonStatus.ACTIVE
    if teacher.user_id:
        linked_user = db.get(User, teacher.user_id)
        if linked_user:
            linked_user.is_active = True
    db.commit()
    db.refresh(teacher)
    return teacher


@router.delete("/students/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_student(student_id: int, db: Session = Depends(get_db), user: User = Depends(require_admin)):
    """Permanently delete a student, their login, and all dependent records.
    Runs in one transaction. ORM cascades remove attendances, marks/results,
    fee invoices (+payments), and assignment submissions; the linked login and
    its refresh tokens are removed too. Prefer deactivate when history must
    be preserved.
    """
    student = db.get(StudentProfile, student_id)
    if not student:
        raise HTTPException(404, "Student not found")
    try:
        login = db.get(User, student.user_id) if student.user_id is not None else None
        db.delete(student)
        db.flush()
        if login is not None:
            db.delete(login)
        db.commit()
    except Exception:
        db.rollback()
        raise
    return None


@router.delete("/teachers/{teacher_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_teacher(teacher_id: int, db: Session = Depends(get_db), user: User = Depends(require_admin)):
    """Permanently delete a teacher, their login, and dependent links.
    Runs in one transaction. Class/subject assignment links are removed;
    authored assignments, marked attendance, and entered marks keep their
    records with the author reference cleared (SET NULL) so history survives.
    Prefer deactivate when the teacher may return.
    """
    teacher = db.get(TeacherProfile, teacher_id)
    if not teacher:
        raise HTTPException(404, "Teacher not found")
    try:
        login = db.get(User, teacher.user_id) if teacher.user_id is not None else None
        db.delete(teacher)
        db.flush()
        if login is not None:
            db.delete(login)
        db.commit()
    except Exception:
        db.rollback()
        raise
    return None


@router.get("/students/{student_id}/detail")
def admin_get_student_detail(student_id: int, db: Session = Depends(get_db), user: User = Depends(require_admin)):
    """Get detailed student information including class, section, guardian, and linked user status."""
    student = db.get(StudentProfile, student_id)
    if not student:
        raise HTTPException(404, "Student not found")
    
    class_info = None
    if student.class_id:
        cls = db.get(SchoolClass, student.class_id)
        if cls:
            class_info = {"id": cls.id, "name": cls.name, "code": cls.code}
    
    section_info = None
    if student.section_id:
        sec = db.get(Section, student.section_id)
        if sec:
            section_info = {"id": sec.id, "name": sec.name, "capacity": sec.capacity}
    
    user_info = None
    if student.user_id:
        u = db.get(User, student.user_id)
        if u:
            user_info = {"id": u.id, "email": u.email, "username": u.username, "is_active": u.is_active, "role": u.role.value}
    
    return {
        "id": student.id,
        "student_code": student.student_code,
        "first_name": student.first_name,
        "last_name": student.last_name,
        "date_of_birth": student.date_of_birth,
        "gender": student.gender.value if student.gender else None,
        "email": student.email,
        "phone": student.phone,
        "address": student.address,
        "admission_date": student.admission_date,
        "class": class_info,
        "section": section_info,
        "roll_number": student.roll_number,
        "division": student.division,
        "guardian_name": student.guardian_name,
        "guardian_phone": student.guardian_phone,
        "status": student.status.value,
        "profile_photo_url": student.profile_photo_url,
        "created_at": student.created_at,
        "updated_at": student.updated_at,
        "user": user_info,
    }


@router.get("/teachers/{teacher_id}/detail")
def admin_get_teacher_detail(teacher_id: int, db: Session = Depends(get_db), user: User = Depends(require_admin)):
    """Get detailed teacher information including subjects, sections, and linked user status."""
    teacher = db.get(TeacherProfile, teacher_id)
    if not teacher:
        raise HTTPException(404, "Teacher not found")
    
    subjects = [{"id": s.id, "name": s.name, "code": s.code} for s in teacher.subjects]
    sections = [{"id": s.id, "name": s.name, "class_id": s.class_id} for s in teacher.sections]
    
    user_info = None
    if teacher.user_id:
        u = db.get(User, teacher.user_id)
        if u:
            user_info = {"id": u.id, "email": u.email, "username": u.username, "is_active": u.is_active, "role": u.role.value}
    
    return {
        "id": teacher.id,
        "teacher_code": teacher.teacher_code,
        "first_name": teacher.first_name,
        "last_name": teacher.last_name,
        "email": teacher.email,
        "phone": teacher.phone,
        "department": teacher.department,
        "joining_date": teacher.joining_date,
        "designation": teacher.designation,
        "status": teacher.status.value,
        "created_at": teacher.created_at,
        "updated_at": teacher.updated_at,
        "subjects": subjects,
        "sections": sections,
        "user": user_info,
    }


@router.get("/classes", response_model=list[dict])
def admin_list_classes_for_dropdown(db: Session = Depends(get_db), user: User = Depends(require_admin)):
    """Get classes for dropdown selection."""
    classes = db.query(SchoolClass).order_by(SchoolClass.sort_order).all()
    return [{"id": c.id, "name": c.name, "code": c.code} for c in classes]


@router.get("/sections", response_model=list[dict])
def admin_list_sections_for_dropdown(
    class_id: int | None = None, db: Session = Depends(get_db), user: User = Depends(require_admin)
):
    """Get sections for dropdown selection, optionally filtered by class."""
    query = db.query(Section)
    if class_id:
        query = query.filter(Section.class_id == class_id)
    sections = query.order_by(Section.name).all()
    return [{"id": s.id, "name": s.name, "class_id": s.class_id} for s in sections]


@router.get("/subjects", response_model=list[dict])
def admin_list_subjects_for_dropdown(db: Session = Depends(get_db), user: User = Depends(require_admin)):
    """Get subjects for dropdown selection."""
    subjects = db.query(Subject).order_by(Subject.name).all()
    return [{"id": s.id, "name": s.name, "code": s.code} for s in subjects]


@router.get("/class-subjects")
def admin_get_class_subjects(
    class_id: int = Query(...),
    group: str | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    """Get subjects for a class, optionally filtered by group (for Class 9-10)."""
    cls = db.get(SchoolClass, class_id)
    if not cls:
        raise HTTPException(404, "Class not found")

    # Extract class number from name like "Class 9" -> "9"
    class_num = cls.name.replace("Class ", "").strip()

    if class_num in ("9", "10") and group:
        # Get group-specific subjects
        result = db.execute(
            text("SELECT s.id, s.name, s.code FROM class_group_subjects cgs "
                 "JOIN subjects s ON s.id = cgs.subject_id "
                 "WHERE cgs.class_id = :cid AND cgs.group_name = :gn "
                 "ORDER BY s.name"),
            {"cid": class_id, "gn": group},
        )
        return [{"id": r[0], "name": r[1], "code": r[2]} for r in result]
    else:
        # Get class subjects (for classes without groups)
        return [{"id": s.id, "name": s.name, "code": s.code} for s in cls.subjects]


@router.get("/student-subjects")
def admin_get_student_subjects(
    student_id: int = Query(...),
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    """Get subjects for a student based on their class and group."""
    student = db.get(StudentProfile, student_id)
    if not student:
        raise HTTPException(404, "Student not found")
    if not student.class_id:
        raise HTTPException(400, "Student has no class assigned")

    cls = db.get(SchoolClass, student.class_id)
    if not cls:
        raise HTTPException(404, "Class not found")

    class_num = cls.name.replace("Class ", "").strip()

    if class_num in ("9", "10") and student.group:
        result = db.execute(
            text("SELECT s.id, s.name, s.code FROM class_group_subjects cgs "
                 "JOIN subjects s ON s.id = cgs.subject_id "
                 "WHERE cgs.class_id = :cid AND cgs.group_name = :gn "
                 "ORDER BY s.name"),
            {"cid": student.class_id, "gn": student.group.value},
        )
        return [{"id": r[0], "name": r[1], "code": r[2]} for r in result]
    else:
        return [{"id": s.id, "name": s.name, "code": s.code} for s in cls.subjects]


@router.get("/groups")
def admin_list_groups(user: User = Depends(require_admin)):
    """Get available student groups."""
    return [{"value": g.value, "label": g.value.replace("_", " ").title()} for g in StudentGroup]


@router.get("/periods")
def admin_list_periods(db: Session = Depends(get_db), user: User = Depends(require_admin)):
    """Get all periods for the active academic year."""
    from app.models.academic import AcademicYear
    year = db.query(AcademicYear).filter(AcademicYear.is_active == True).first()
    if not year:
        year = db.query(AcademicYear).order_by(AcademicYear.id).first()
    if not year:
        return []
    periods = db.query(Period).filter(Period.academic_year_id == year.id).order_by(Period.period_number).all()
    return [{"id": p.id, "number": p.period_number, "label": p.label, "start_time": p.start_time.isoformat(), "end_time": p.end_time.isoformat()} for p in periods]


@router.post("/subjects", status_code=status.HTTP_201_CREATED)
def admin_create_subject(data: dict, db: Session = Depends(get_db), user: User = Depends(require_admin)):
    name = (data.get("name") or "").strip()
    code = (data.get("code") or "").strip()
    if not name or not code:
        raise HTTPException(400, "Name and code are required")
    if db.query(Subject).filter(Subject.name == name).first():
        raise HTTPException(400, "Subject name already exists")
    if db.query(Subject).filter(Subject.code == code).first():
        raise HTTPException(400, "Subject code already exists")
    subject = Subject(name=name, code=code, description=data.get("description"))
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return {"id": subject.id, "name": subject.name, "code": subject.code, "description": subject.description}


@router.put("/subjects/{subject_id}")
def admin_update_subject(subject_id: int, data: dict, db: Session = Depends(get_db), user: User = Depends(require_admin)):
    subject = db.get(Subject, subject_id)
    if not subject:
        raise HTTPException(404, "Subject not found")
    if "name" in data:
        name = data["name"].strip()
        dup = db.query(Subject).filter(Subject.name == name, Subject.id != subject_id).first()
        if dup:
            raise HTTPException(400, "Subject name already exists")
        subject.name = name
    if "code" in data:
        code = data["code"].strip()
        dup = db.query(Subject).filter(Subject.code == code, Subject.id != subject_id).first()
        if dup:
            raise HTTPException(400, "Subject code already exists")
        subject.code = code
    if "description" in data:
        subject.description = data["description"]
    db.commit()
    db.refresh(subject)
    return {"id": subject.id, "name": subject.name, "code": subject.code, "description": subject.description}


@router.delete("/subjects/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_subject(subject_id: int, db: Session = Depends(get_db), user: User = Depends(require_admin)):
    subject = db.get(Subject, subject_id)
    if not subject:
        raise HTTPException(404, "Subject not found")
    db.delete(subject)
    db.commit()
    return None


@router.get("/subjects/{subject_id}")
def admin_get_subject(subject_id: int, db: Session = Depends(get_db), user: User = Depends(require_admin)):
    subject = db.get(Subject, subject_id)
    if not subject:
        raise HTTPException(404, "Subject not found")
    return {"id": subject.id, "name": subject.name, "code": subject.code, "description": subject.description}


@router.get("/teachers/{teacher_id}/workload")
def admin_teacher_workload(
    teacher_id: int,
    academic_year_id: int | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    """Get a teacher's weekly workload: how many classes per day, with details."""
    from app.models.routine import Routine, Period

    teacher = db.get(TeacherProfile, teacher_id)
    if not teacher:
        raise HTTPException(404, "Teacher not found")

    query = db.query(Routine).filter(Routine.teacher_id == teacher_id)
    if academic_year_id:
        query = query.filter(Routine.academic_year_id == academic_year_id)

    routines = query.order_by(Routine.day, Routine.period_id).all()

    days = {}
    for r in routines:
        day_val = r.day.value if hasattr(r.day, "value") else r.day
        if day_val not in days:
            days[day_val] = []
        cls = db.get(SchoolClass, r.class_id)
        sec = db.get(Section, r.section_id)
        subj = db.get(Subject, r.subject_id)
        period = db.get(Period, r.period_id)
        days[day_val].append({
            "id": r.id,
            "period_id": r.period_id,
            "period_label": period.label if period else None,
            "start_time": period.start_time.isoformat() if period else None,
            "end_time": period.end_time.isoformat() if period else None,
            "class_id": r.class_id,
            "class_name": cls.name if cls else None,
            "section_id": r.section_id,
            "section_name": sec.name if sec else None,
            "subject_id": r.subject_id,
            "subject_name": subj.name if subj else None,
        })

    all_days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY"]
    summary = {}
    for d in all_days:
        entries = days.get(d, [])
        summary[d] = {"count": len(entries), "entries": entries, "is_full": len(entries) >= 4}

    total = sum(len(v) for v in days.values())
    return {
        "teacher_id": teacher_id,
        "teacher_name": f"{teacher.first_name} {teacher.last_name}",
        "total_classes": total,
        "daily": summary,
        "max_per_day": 4,
        "max_per_week": 20,
        "recommended_min": 0,
    }


@router.post("/teachers/{teacher_id}/assign-batch")
def admin_teacher_assign_batch(
    teacher_id: int,
    data: dict,
    db: Session = Depends(get_db),
    user: User = Depends(require_admin),
):
    """Bulk assign routine entries for a teacher. Accepts {academic_year_id, assignments: [{class_id, section_id, subject_id, day, period_id, group?}]}. Validates no conflicts."""
    from app.models.routine import Routine, Period
    from app.models.enums import DayOfWeek

    teacher = db.get(TeacherProfile, teacher_id)
    if not teacher:
        raise HTTPException(404, "Teacher not found")

    academic_year_id = data.get("academic_year_id")
    assignments = data.get("assignments", [])
    if not assignments:
        raise HTTPException(400, "No assignments provided")

    created = []
    errors = []
    for i, a in enumerate(assignments):
        required = ["class_id", "section_id", "subject_id", "day", "period_id"]
        missing = [f for f in required if not a.get(f)]
        if missing:
            errors.append(f"Entry {i+1}: missing {', '.join(missing)}")
            continue

        day_val = a["day"]
        if isinstance(day_val, str):
            try:
                day_val = DayOfWeek(day_val.upper())
            except ValueError:
                errors.append(f"Entry {i+1}: invalid day '{a['day']}'")
                continue

        period = db.get(Period, a["period_id"])
        if not period:
            errors.append(f"Entry {i+1}: period not found")
            continue

        subject = db.get(Subject, a["subject_id"])
        if not subject:
            errors.append(f"Entry {i+1}: subject not found")
            continue

        # Validate subject is assigned to this teacher
        teacher_subject_ids = {s.id for s in teacher.subjects}
        if a["subject_id"] not in teacher_subject_ids:
            errors.append(f"Entry {i+1}: subject '{subject.name}' is not assigned to this teacher")
            continue

        class_sec_dup = db.query(Routine).filter(
            Routine.class_id == a["class_id"],
            Routine.section_id == a["section_id"],
            Routine.day == day_val,
            Routine.period_id == a["period_id"],
        ).first()
        if class_sec_dup:
            errors.append(f"Entry {i+1}: class-section already has a class at {day_val.value} period {a['period_id']}")
            continue

        teacher_dup = db.query(Routine).filter(
            Routine.teacher_id == teacher_id,
            Routine.day == day_val,
            Routine.period_id == a["period_id"],
        ).first()
        if teacher_dup:
            errors.append(f"Entry {i+1}: you already have a class at {day_val.value} period {a['period_id']}")
            continue

        routine = Routine(
            academic_year_id=academic_year_id,
            class_id=a["class_id"],
            section_id=a["section_id"],
            group=a.get("group"),
            day=day_val,
            period_id=a["period_id"],
            subject_id=a["subject_id"],
            teacher_id=teacher_id,
        )
        db.add(routine)
        db.flush()
        created.append(routine.id)

    if errors and not created:
        db.rollback()
        raise HTTPException(400, detail={"message": "All entries failed", "errors": errors})

    db.commit()
    return {"created": len(created), "errors": errors, "ids": created}