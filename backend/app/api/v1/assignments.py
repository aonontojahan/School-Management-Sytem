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


@router.get("")
def list_assignments(class_id: int | None = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(Assignment)
    if class_id:
        q = q.filter(Assignment.class_id == class_id)
    if user.role.value == "TEACHER":
        t = db.query(TeacherProfile).filter(TeacherProfile.user_id == user.id).first()
        if t:
            q = q.filter(Assignment.teacher_id == t.id)
    elif user.role.value == "STUDENT":
        from app.models.people import StudentProfile
        s = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
        if s and s.class_id:
            q = q.filter(Assignment.class_id == s.class_id)
            if s.section_id:
                q = q.filter((Assignment.section_id == s.section_id) | (Assignment.section_id.is_(None)))
    assignments = q.order_by(Assignment.id.desc()).all()
    result = []
    for a in assignments:
        cls = db.get(__import__("app.models.academic", fromlist=["SchoolClass"]).SchoolClass, a.class_id)
        sec = db.get(__import__("app.models.academic", fromlist=["Section"]).Section, a.section_id) if a.section_id else None
        subj = db.get(__import__("app.models.academic", fromlist=["Subject"]).Subject, a.subject_id)
        submissions = db.query(AssignmentSubmission).filter(AssignmentSubmission.assignment_id == a.id).all()
        sub_student_ids = {s.student_id for s in submissions}
        result.append({
            "id": a.id,
            "class_id": a.class_id,
            "class_name": cls.name if cls else None,
            "section_id": a.section_id,
            "section_name": sec.name if sec else None,
            "subject_id": a.subject_id,
            "subject_name": subj.name if subj else None,
            "teacher_id": a.teacher_id,
            "title": a.title,
            "description": a.description,
            "due_date": a.due_date.isoformat() if a.due_date else None,
            "created_at": a.created_at.isoformat() if a.created_at else None,
            "submission_count": len(submissions),
            "submitted_student_ids": list(sub_student_ids),
        })
    return result


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


@router.get("/my")
def student_my_assignments(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Get assignments for the logged-in student with submission status."""
    from app.models.people import StudentProfile
    from app.models.academic import SchoolClass, Section, Subject

    student = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    if not student or not student.class_id:
        return []

    q = db.query(Assignment).filter(Assignment.class_id == student.class_id)
    if student.section_id:
        q = q.filter((Assignment.section_id == student.section_id) | (Assignment.section_id.is_(None)))

    assignments = q.order_by(Assignment.id.desc()).all()
    result = []
    for a in assignments:
        cls = db.get(SchoolClass, a.class_id)
        sec = db.get(Section, a.section_id) if a.section_id else None
        subj = db.get(Subject, a.subject_id)
        my_sub = db.query(AssignmentSubmission).filter(
            AssignmentSubmission.assignment_id == a.id,
            AssignmentSubmission.student_id == student.id,
        ).first()
        from datetime import date as _date
        due = a.due_date
        today = _date.today()
        if my_sub:
            status_val = "SUBMITTED"
        elif due and due < today:
            status_val = "MISSING"
        else:
            status_val = "PENDING"
        result.append({
            "id": a.id,
            "title": a.title,
            "description": a.description,
            "due_date": a.due_date.isoformat() if a.due_date else None,
            "created_at": a.created_at.isoformat() if a.created_at else None,
            "class_name": cls.name if cls else None,
            "section_name": sec.name if sec else None,
            "subject_name": subj.name if subj else None,
            "status": status_val,
            "submitted_at": my_sub.submitted_at.isoformat() if my_sub else None,
        })
    return result
