from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_admin
from app.db.session import get_db
from app.models.academic import Section, Subject
from app.models.enums import PersonStatus
from app.models.people import TeacherProfile
from app.schemas.people import TeacherCreate, TeacherOut, TeacherUpdate

router = APIRouter(prefix="/teachers", tags=["teachers"])


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
    t = TeacherProfile(
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
