"""Salary management routes — admin CRUD + teacher view."""
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_admin
from app.db.session import get_db
from app.models.enums import SalaryStatus
from app.models.people import TeacherProfile
from app.models.salary import SalaryPayment, SalaryStructure
from app.models.user import User
from app.schemas.salary import (
    BulkSalaryGenerate,
    SalaryPaymentOut,
    SalaryStructureCreate,
    SalaryStructureOut,
)

router = APIRouter(prefix="/salary", tags=["salary"])

# Designation-based salary amounts (TK)
DESIGNATION_SALARIES = {
    "HEAD TEACHER": 22000,
    "SENIOR TEACHER": 20000,
    "JUNIOR TEACHER": 16000,
}
DEFAULT_SALARY = 16000


# ── Admin: Salary Structure ──────────────────────────────────────────────────


@router.get("/structures", response_model=list[SalaryStructureOut], dependencies=[Depends(require_admin)])
def list_structures(db: Session = Depends(get_db)):
    rows = db.query(SalaryStructure).all()
    out = []
    for s in rows:
        teacher = db.get(TeacherProfile, s.teacher_id)
        out.append(SalaryStructureOut(
            id=s.id,
            teacher_id=s.teacher_id,
            teacher_name=f"{teacher.first_name} {teacher.last_name}" if teacher else None,
            designation=teacher.designation if teacher else None,
            monthly_amount=float(s.monthly_amount),
            effective_from=s.effective_from,
        ))
    return out


@router.post("/structures", status_code=201, dependencies=[Depends(require_admin)])
def create_structure(data: SalaryStructureCreate, db: Session = Depends(get_db)):
    existing = db.query(SalaryStructure).filter(
        SalaryStructure.teacher_id == data.teacher_id
    ).first()
    if existing:
        existing.monthly_amount = data.monthly_amount
        if data.effective_from:
            existing.effective_from = data.effective_from
        db.commit()
        return {"id": existing.id, "updated": True}
    s = SalaryStructure(**data.model_dump())
    db.add(s)
    db.commit()
    db.refresh(s)
    return {"id": s.id, "created": True}


@router.delete("/structures/{structure_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_structure(structure_id: int, db: Session = Depends(get_db)):
    s = db.get(SalaryStructure, structure_id)
    if not s:
        raise HTTPException(404, "Salary structure not found")
    db.delete(s)
    db.commit()


@router.post("/structures/auto-generate", dependencies=[Depends(require_admin)])
def auto_generate_structures(db: Session = Depends(get_db)):
    """Auto-create/update salary structures for all teachers based on designation."""
    teachers = db.query(TeacherProfile).all()
    created = 0
    updated = 0
    for t in teachers:
        designation = (t.designation or "").strip().upper()
        amount = DESIGNATION_SALARIES.get(designation, DEFAULT_SALARY)

        existing = db.query(SalaryStructure).filter(
            SalaryStructure.teacher_id == t.id
        ).first()

        if existing:
            if float(existing.monthly_amount) != amount:
                existing.monthly_amount = amount
                updated += 1
        else:
            s = SalaryStructure(teacher_id=t.id, monthly_amount=amount)
            db.add(s)
            created += 1

    db.commit()
    return {"created": created, "updated": updated, "total_teachers": len(teachers)}


# ── Admin: Salary Payments ──────────────────────────────────────────────────


@router.get("/payments", dependencies=[Depends(require_admin)])
def list_payments(month: int | None = None, year: int | None = None, db: Session = Depends(get_db)):
    q = db.query(SalaryPayment)
    if month:
        q = q.filter(SalaryPayment.month == month)
    if year:
        q = q.filter(SalaryPayment.year == year)
    rows = q.order_by(SalaryPayment.year.desc(), SalaryPayment.month.desc()).all()
    out = []
    for p in rows:
        teacher = db.get(TeacherProfile, p.teacher_id)
        out.append(SalaryPaymentOut(
            id=p.id,
            salary_structure_id=p.salary_structure_id,
            teacher_id=p.teacher_id,
            teacher_name=f"{teacher.first_name} {teacher.last_name}" if teacher else None,
            month=p.month,
            year=p.year,
            amount=float(p.amount),
            status=p.status,
            paid_at=p.paid_at,
            note=p.note,
        ))
    return out


@router.post("/payments/generate", dependencies=[Depends(require_admin)])
def bulk_generate_payments(data: BulkSalaryGenerate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    structures = db.query(SalaryStructure).all()
    created = []
    for s in structures:
        existing = db.query(SalaryPayment).filter(
            SalaryPayment.salary_structure_id == s.id,
            SalaryPayment.month == data.month,
            SalaryPayment.year == data.year,
        ).first()
        if existing:
            continue
        payment = SalaryPayment(
            salary_structure_id=s.id,
            teacher_id=s.teacher_id,
            month=data.month,
            year=data.year,
            amount=float(s.monthly_amount),
            status=SalaryStatus.PENDING,
        )
        db.add(payment)
        created.append(payment)

    if created:
        db.commit()

    # Notify teachers about salary
    from app.models.notification import Notification
    from app.models.user import User as UserModel
    from app.models.enums import UserRole
    teachers = db.query(UserModel).filter(UserModel.role == UserRole.TEACHER, UserModel.is_active == True).all()
    month_names = ["", "January", "February", "March", "April", "May", "June",
                   "July", "August", "September", "October", "November", "December"]
    month_name = month_names[data.month] if 1 <= data.month <= 12 else str(data.month)
    for t in teachers:
        n = Notification(
            user_id=t.id,
            title=f"Salary Update: {month_name} {data.year}",
            message=f"Your salary for {month_name} {data.year} has been processed. Check your salary page for details.",
            type="SALARY",
        )
        db.add(n)
    db.commit()

    return {"generated": len(created), "total_structures": len(structures)}


@router.post("/payments/{payment_id}/pay", dependencies=[Depends(require_admin)])
def mark_paid(payment_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    p = db.get(SalaryPayment, payment_id)
    if not p:
        raise HTTPException(404, "Salary payment not found")
    p.status = SalaryStatus.PAID
    p.paid_at = datetime.utcnow()
    p.paid_by = user.id
    db.commit()

    # Notify teacher
    from app.models.notification import Notification
    from app.models.user import User as UserModel
    teacher_user = db.query(UserModel).join(TeacherProfile).filter(TeacherProfile.id == p.teacher_id).first()
    if teacher_user:
        month_names = ["", "January", "February", "March", "April", "May", "June",
                       "July", "August", "September", "October", "November", "December"]
        month_name = month_names[p.month] if 1 <= p.month <= 12 else str(p.month)
        n = Notification(
            user_id=teacher_user.id,
            title=f"Salary Paid: {month_name} {p.year}",
            message=f"Your salary of {p.amount} for {month_name} {p.year} has been paid.",
            type="SALARY",
        )
        db.add(n)
        db.commit()

    return {"ok": True}


# ── Teacher: View Own Salary ────────────────────────────────────────────────


@router.get("/my-salary")
def my_salary(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    teacher = db.query(TeacherProfile).filter(TeacherProfile.user_id == user.id).first()
    if not teacher:
        return {"structure": None, "payments": []}

    structure = db.query(SalaryStructure).filter(SalaryStructure.teacher_id == teacher.id).first()
    payments = db.query(SalaryPayment).filter(
        SalaryPayment.teacher_id == teacher.id
    ).order_by(SalaryPayment.year.desc(), SalaryPayment.month.desc()).all()

    return {
        "structure": {
            "monthly_amount": float(structure.monthly_amount) if structure else None,
            "effective_from": str(structure.effective_from) if structure and structure.effective_from else None,
        } if structure else None,
        "payments": [
            {
                "id": p.id,
                "month": p.month,
                "year": p.year,
                "amount": float(p.amount),
                "status": p.status.value,
                "paid_at": p.paid_at.isoformat() if p.paid_at else None,
            }
            for p in payments
        ],
    }
