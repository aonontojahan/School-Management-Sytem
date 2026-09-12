from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_admin, require_teacher
from app.db.session import get_db
from app.models.academic import Subject
from app.models.exam import Exam, Mark
from app.models.people import StudentProfile
from app.models.user import User
from app.schemas.exams import ExamCreate, ExamOut, MarkBulkIn, MarkOut, ReportCardOut, ReportCardRow
from app.services.grading import grade_for, summarize

router = APIRouter(prefix="/exams", tags=["exams"])


@router.get("", response_model=list[ExamOut])
def list_exams(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Exam).order_by(Exam.id.desc()).all()


@router.post("", response_model=ExamOut, status_code=201, dependencies=[Depends(require_admin)])
def create_exam(data: ExamCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    e = Exam(**data.model_dump(), created_by=user.id)
    db.add(e)
    db.commit()
    db.refresh(e)
    return e


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
