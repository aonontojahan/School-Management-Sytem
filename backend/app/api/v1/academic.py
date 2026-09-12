"""Academic structure endpoints: years, classes, sections, subjects."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_admin
from app.db.session import get_db
from app.models.academic import AcademicYear, SchoolClass, Section, Subject
from app.schemas.academic import (
    AcademicYearCreate,
    AcademicYearOut,
    ClassSubjectsUpdate,
    SchoolClassCreate,
    SchoolClassOut,
    SectionCreate,
    SectionOut,
    SubjectCreate,
    SubjectOut,
)

router = APIRouter(prefix="/academic", tags=["academic"])


@router.get("/years", response_model=list[AcademicYearOut])
def list_years(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(AcademicYear).order_by(AcademicYear.id).all()


@router.post("/years", response_model=AcademicYearOut, status_code=201, dependencies=[Depends(require_admin)])
def create_year(data: AcademicYearCreate, db: Session = Depends(get_db)):
    y = AcademicYear(**data.model_dump())
    db.add(y)
    db.commit()
    db.refresh(y)
    return y


@router.get("/classes", response_model=list[SchoolClassOut])
def list_classes(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(SchoolClass).order_by(SchoolClass.sort_order).all()


@router.post("/classes", response_model=SchoolClassOut, status_code=201, dependencies=[Depends(require_admin)])
def create_class(data: SchoolClassCreate, db: Session = Depends(get_db)):
    c = SchoolClass(**data.model_dump())
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


@router.get("/classes/{class_id}/sections", response_model=list[SectionOut])
def list_sections(class_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Section).filter(Section.class_id == class_id).all()


@router.post("/sections", response_model=SectionOut, status_code=201, dependencies=[Depends(require_admin)])
def create_section(data: SectionCreate, db: Session = Depends(get_db)):
    s = Section(**data.model_dump())
    db.add(s)
    db.commit()
    db.refresh(s)
    return s


@router.get("/subjects", response_model=list[SubjectOut])
def list_subjects(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Subject).order_by(Subject.id).all()


@router.post("/subjects", response_model=SubjectOut, status_code=201, dependencies=[Depends(require_admin)])
def create_subject(data: SubjectCreate, db: Session = Depends(get_db)):
    s = Subject(**data.model_dump())
    db.add(s)
    db.commit()
    db.refresh(s)
    return s


@router.put("/classes/{class_id}/subjects", dependencies=[Depends(require_admin)])
def set_class_subjects(class_id: int, data: ClassSubjectsUpdate, db: Session = Depends(get_db)):
    c = db.get(SchoolClass, class_id)
    if not c:
        raise HTTPException(404, "Class not found")
    c.subjects = db.query(Subject).filter(Subject.id.in_(data.subject_ids)).all()
    db.commit()
    return {"message": "Class subjects updated"}
