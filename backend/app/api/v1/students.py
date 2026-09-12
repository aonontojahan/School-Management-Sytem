"""Student CRUD + search/filter/assign + self-service profile per spec."""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_admin, require_student
from app.db.session import get_db
from app.models.enums import PersonStatus, UserRole
from app.models.people import StudentProfile
from app.models.user import User
from app.schemas.students import StudentCreate, StudentOut, StudentUpdate

router = APIRouter(prefix="/students", tags=["students"])

# Fields a student may change on their own profile (class/roll/division/status stay admin-only).
SELF_EDITABLE = {"first_name", "last_name", "date_of_birth", "phone", "address", "guardian_name", "guardian_phone"}


def _code(db: Session) -> str:
    n = db.query(StudentProfile).count() + 1
    return f"STU-{(n):06d}"


def _get_own_profile(db: Session, user: User) -> StudentProfile:
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(404, "No student profile linked to this login")
    return profile


@router.get("/me", response_model=StudentOut)
def get_my_profile(db: Session = Depends(get_db), user: User = Depends(require_student)):
    return _get_own_profile(db, user)


@router.patch("/me", response_model=StudentOut)
def update_my_profile(data: StudentUpdate, db: Session = Depends(get_db), user: User = Depends(require_student)):
    s = _get_own_profile(db, user)
    for k, v in data.model_dump(exclude_unset=True).items():
        if k in SELF_EDITABLE:
            setattr(s, k, v)
    db.commit()
    db.refresh(s)
    return s


@router.get("", response_model=list[StudentOut])
def list_students(
    q: str | None = None,
    class_id: int | None = None,
    section_id: int | None = None,
    status: PersonStatus | None = None,
    skip: int = 0,
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    query = db.query(StudentProfile)
    if user.role == UserRole.TEACHER:
        pass  # teachers see all; scoped further in future by assignment
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
    return query.order_by(StudentProfile.id).offset(skip).limit(limit).all()


@router.post("", response_model=StudentOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_admin)])
def create_student(data: StudentCreate, db: Session = Depends(get_db)):
    if data.email and db.query(StudentProfile).filter(StudentProfile.email == data.email).first():
        raise HTTPException(400, "Student email already exists")
    user_id: int | None = None
    if data.user_id is not None:
        login = db.get(User, data.user_id)
        if not login:
            raise HTTPException(404, "Linked login not found")
        if login.role != UserRole.STUDENT:
            raise HTTPException(400, "Linked login must have role STUDENT")
        if db.query(StudentProfile).filter(StudentProfile.user_id == login.id).first():
            raise HTTPException(400, "Login is already linked to a student profile")
        if data.email and login.email.lower() != data.email.lower():
            raise HTTPException(400, "Profile email must match the login email")
        user_id = login.id
    student = StudentProfile(
        user_id=user_id,
        student_code=_code(db),
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


@router.get("/{student_id}", response_model=StudentOut)
def get_student(student_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    s = db.get(StudentProfile, student_id)
    if not s:
        raise HTTPException(404, "Student not found")
    return s


@router.patch("/{student_id}", response_model=StudentOut, dependencies=[Depends(require_admin)])
def update_student(student_id: int, data: StudentUpdate, db: Session = Depends(get_db)):
    s = db.get(StudentProfile, student_id)
    if not s:
        raise HTTPException(404, "Student not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(s, k, v)
    db.commit()
    db.refresh(s)
    return s


@router.patch("/{student_id}/deactivate", response_model=StudentOut, dependencies=[Depends(require_admin)])
def deactivate(student_id: int, db: Session = Depends(get_db)):
    s = db.get(StudentProfile, student_id)
    if not s:
        raise HTTPException(404, "Student not found")
    s.status = PersonStatus.INACTIVE
    db.commit()
    db.refresh(s)
    return s


@router.patch("/{student_id}/activate", response_model=StudentOut, dependencies=[Depends(require_admin)])
def activate(student_id: int, db: Session = Depends(get_db)):
    s = db.get(StudentProfile, student_id)
    if not s:
        raise HTTPException(404, "Student not found")
    s.status = PersonStatus.ACTIVE
    db.commit()
    db.refresh(s)
    return s


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
def delete_student(student_id: int, db: Session = Depends(get_db)):
    """Permanently delete a student, their login, and all dependent records.

    Runs in one transaction. ORM cascades remove attendances, marks/results,
    fee invoices (+payments), and assignment submissions; the linked login and
    its refresh tokens are removed too. Prefer deactivate when history must
    be preserved.
    """
    s = db.get(StudentProfile, student_id)
    if not s:
        raise HTTPException(404, "Student not found")
    try:
        login = db.get(User, s.user_id) if s.user_id is not None else None
        db.delete(s)
        db.flush()
        if login is not None:
            db.delete(login)
        db.commit()
    except Exception:
        db.rollback()
        raise
    return None
