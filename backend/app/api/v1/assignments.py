from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_teacher
from app.db.session import get_db
from app.models.assignment import Assignment, AssignmentSubmission
from app.models.people import TeacherProfile
from app.models.user import User
from app.schemas.fees_assignments import AssignmentCreate, AssignmentOut, SubmissionCreate, SubmissionOut

router = APIRouter(prefix="/assignments", tags=["assignments"])


def _teacher_id(db: Session, user: User) -> int | None:
    if user.role.value == "ADMIN":
        return None
    t = db.query(TeacherProfile).filter(TeacherProfile.user_id == user.id).first()
    return t.id if t else None


@router.get("", response_model=list[AssignmentOut])
def list_assignments(class_id: int | None = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(Assignment)
    if class_id:
        q = q.filter(Assignment.class_id == class_id)
    return q.order_by(Assignment.id.desc()).all()


@router.post("", response_model=AssignmentOut, status_code=201, dependencies=[Depends(require_teacher)])
def create_assignment(data: AssignmentCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    a = Assignment(**data.model_dump(), teacher_id=_teacher_id(db, user))
    db.add(a)
    db.commit()
    db.refresh(a)
    return a


@router.post("/{assignment_id}/submissions", response_model=SubmissionOut, status_code=201)
def submit(assignment_id: int, data: SubmissionCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    from app.models.people import StudentProfile
    student = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    if not student and user.role.value != "ADMIN":
        raise HTTPException(403, "Only students can submit")
    student_id = student.id if student else data_student_fallback(db, user)
    sub = AssignmentSubmission(assignment_id=assignment_id, student_id=student_id, **data.model_dump())
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


def data_student_fallback(db: Session, user: User) -> int:
    from app.models.people import StudentProfile
    s = db.query(StudentProfile).filter(StudentProfile.email == user.email).first()
    if not s:
        raise HTTPException(400, "No student profile linked to account")
    return s.id


@router.get("/{assignment_id}/submissions", response_model=list[SubmissionOut], dependencies=[Depends(require_teacher)])
def list_submissions(assignment_id: int, db: Session = Depends(get_db)):
    return db.query(AssignmentSubmission).filter(AssignmentSubmission.assignment_id == assignment_id).all()
