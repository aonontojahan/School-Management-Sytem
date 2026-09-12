"""Teacher CRUD + self-service profile. Admin assigns subjects/classes."""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_admin
from app.core.deps import require_roles
from app.db.session import get_db
from app.models.academic import Section, Subject
from app.models.enums import PersonStatus, UserRole
from app.models.people import TeacherProfile
from app.models.user import User
from app.schemas.people import TeacherCreate, TeacherOut, TeacherUpdate

router = APIRouter(prefix="/teachers", tags=["teachers"])

require_teacher_self = require_roles(UserRole.TEACHER)

# Fields a teacher may change on their own profile (status/assignments stay admin-only).
SELF_EDITABLE = {"first_name", "last_name", "phone", "department", "joining_date", "designation"}


def _get_own_profile(db: Session, user: User) -> TeacherProfile:
    profile = db.query(TeacherProfile).filter(TeacherProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(404, "No teacher profile linked to this login")
    return profile


@router.get("/me", response_model=TeacherOut)
def get_my_profile(db: Session = Depends(get_db), user: User = Depends(require_teacher_self)):
    return _get_own_profile(db, user)


@router.patch("/me", response_model=TeacherOut)
def update_my_profile(data: TeacherUpdate, db: Session = Depends(get_db), user: User = Depends(require_teacher_self)):
    t = _get_own_profile(db, user)
    for k, v in data.model_dump(exclude_unset=True).items():
        if k in SELF_EDITABLE:
            setattr(t, k, v)
    db.commit()
    db.refresh(t)
    return t


@router.get("", response_model=list[TeacherOut])
def list_teachers(
    q: str | None = None,
    status: PersonStatus | None = None,
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    query = db.query(TeacherProfile)
    if q:
        like = f"%{q}%"
        query = query.filter(
            (TeacherProfile.first_name.ilike(like))
            | (TeacherProfile.last_name.ilike(like))
            | (TeacherProfile.teacher_code.ilike(like))
        )
    if status:
        query = query.filter(TeacherProfile.status == status)
    return query.order_by(TeacherProfile.id).limit(limit).all()


@router.post("", response_model=TeacherOut, status_code=201, dependencies=[Depends(require_admin)])
def create_teacher(data: TeacherCreate, db: Session = Depends(get_db)):
    n = db.query(TeacherProfile).count() + 1
    user_id: int | None = None
    if data.user_id is not None:
        login = db.get(User, data.user_id)
        if not login:
            raise HTTPException(404, "Linked login not found")
        if login.role != UserRole.TEACHER:
            raise HTTPException(400, "Linked login must have role TEACHER")
        if db.query(TeacherProfile).filter(TeacherProfile.user_id == login.id).first():
            raise HTTPException(400, "Login is already linked to a teacher profile")
        if data.email and login.email.lower() != data.email.lower():
            raise HTTPException(400, "Profile email must match the login email")
        user_id = login.id
    t = TeacherProfile(
        user_id=user_id,
        teacher_code=f"TCH-{n:05d}",
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


@router.get("/{teacher_id}", response_model=TeacherOut)
def get_teacher(teacher_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    t = db.get(TeacherProfile, teacher_id)
    if not t:
        raise HTTPException(404, "Teacher not found")
    return t


@router.patch("/{teacher_id}", response_model=TeacherOut, dependencies=[Depends(require_admin)])
def update_teacher(teacher_id: int, data: TeacherUpdate, db: Session = Depends(get_db)):
    t = db.get(TeacherProfile, teacher_id)
    if not t:
        raise HTTPException(404, "Teacher not found")
    payload = data.model_dump(exclude_unset=True, exclude={"subject_ids", "section_ids"})
    for k, v in payload.items():
        setattr(t, k, v)
    if data.subject_ids is not None:
        t.subjects = db.query(Subject).filter(Subject.id.in_(data.subject_ids)).all()
    if data.section_ids is not None:
        t.sections = db.query(Section).filter(Section.id.in_(data.section_ids)).all()
    db.commit()
    db.refresh(t)
    return t


@router.patch("/{teacher_id}/deactivate", response_model=TeacherOut, dependencies=[Depends(require_admin)])
def deactivate_teacher(teacher_id: int, db: Session = Depends(get_db)):
    t = db.get(TeacherProfile, teacher_id)
    if not t:
        raise HTTPException(404, "Teacher not found")
    t.status = PersonStatus.INACTIVE
    db.commit()
    db.refresh(t)
    return t


@router.patch("/{teacher_id}/activate", response_model=TeacherOut, dependencies=[Depends(require_admin)])
def activate_teacher(teacher_id: int, db: Session = Depends(get_db)):
    t = db.get(TeacherProfile, teacher_id)
    if not t:
        raise HTTPException(404, "Teacher not found")
    t.status = PersonStatus.ACTIVE
    db.commit()
    db.refresh(t)
    return t


@router.delete("/{teacher_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
def delete_teacher(teacher_id: int, db: Session = Depends(get_db)):
    """Permanently delete a teacher, their login, and dependent links.

    Runs in one transaction. Class/subject assignment links are removed;
    authored assignments, marked attendance, and entered marks keep their
    records with the author reference cleared (SET NULL) so history survives.
    Prefer deactivate when the teacher may return.
    """
    t = db.get(TeacherProfile, teacher_id)
    if not t:
        raise HTTPException(404, "Teacher not found")
    try:
        login = db.get(User, t.user_id) if t.user_id is not None else None
        db.delete(t)
        db.flush()
        if login is not None:
            db.delete(login)
        db.commit()
    except Exception:
        db.rollback()
        raise
    return None
