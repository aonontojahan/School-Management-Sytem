"""Admin-only management endpoints for students and teachers with account creation."""
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_admin
from app.core.security import hash_password
from app.db.session import get_db
from app.models.academic import SchoolClass, Section, Subject
from app.models.enums import PersonStatus, UserRole
from app.models.people import StudentProfile, TeacherProfile
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
        class_id=data.class_id,
        section_id=data.section_id,
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
    classes = db.query(SchoolClass).order_by(SchoolClass.name).all()
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