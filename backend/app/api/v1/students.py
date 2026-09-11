"""Student CRUD + search/filter/assign per spec."""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_admin
from app.db.session import get_db
from app.models.enums import PersonStatus, UserRole
from app.models.people import GuardianProfile, StudentProfile
from app.models.user import User
from app.schemas.students import StudentCreate, StudentOut, StudentUpdate

router = APIRouter(prefix="/students", tags=["students"])


def _code(db: Session) -> str:
    n = db.query(StudentProfile).count() + 1
    return f"STU-{(n):06d}"


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
    student = StudentProfile(
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
        status=PersonStatus.ACTIVE,
    )
    if data.guardian_ids:
        student.guardians = db.query(GuardianProfile).filter(GuardianProfile.id.in_(data.guardian_ids)).all()
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
    payload = data.model_dump(exclude_unset=True, exclude={"guardian_ids"})
    for k, v in payload.items():
        setattr(s, k, v)
    if data.guardian_ids is not None:
        s.guardians = db.query(GuardianProfile).filter(GuardianProfile.id.in_(data.guardian_ids)).all()
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
