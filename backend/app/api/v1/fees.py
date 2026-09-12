"""Fee management routes — admin CRUD + student view + bulk generation."""
from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_admin
from app.db.session import get_db
from app.models.enums import FeeTypeName, InvoiceStatus, PaymentMethod, UserRole
from app.models.fee import FeeInvoice, FeePayment, FeeType
from app.models.people import StudentProfile
from app.models.user import User
from app.schemas.fees_assignments import InvoiceCreate, InvoiceOut, PaymentCreate, PaymentOut, FeeTypeOut

router = APIRouter(prefix="/fees", tags=["fees"])


def _refresh_status(inv: FeeInvoice) -> None:
    paid = float(inv.paid_amount or 0)
    total = float(inv.total_amount)
    if paid <= 0:
        inv.status = InvoiceStatus.PENDING
    elif paid < total:
        inv.status = InvoiceStatus.PARTIAL
    else:
        inv.status = InvoiceStatus.PAID


class BulkInvoiceCreate(BaseModel):
    class_id: int
    fee_type_id: int
    total_amount: float
    due_date: date | None = None


class StudentInvoiceOut(BaseModel):
    id: int
    fee_type_name: str | None = None
    total_amount: float
    paid_amount: float
    due_amount: float
    due_date: date | None = None
    status: InvoiceStatus
    payments: list[dict] = []


# ── Admin: Fee Types ────────────────────────────────────────────────────────


@router.get("/types", response_model=list[FeeTypeOut])
def list_types(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(FeeType).all()


# ── Admin: Invoices ─────────────────────────────────────────────────────────


@router.get("/invoices", response_model=list[InvoiceOut])
def list_invoices(student_id: int | None = None, status: str | None = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(FeeInvoice)
    if student_id:
        q = q.filter(FeeInvoice.student_id == student_id)
    if status:
        q = q.filter(FeeInvoice.status == status)
    invoices = q.order_by(FeeInvoice.id.desc()).all()
    out = []
    for inv in invoices:
        out.append(InvoiceOut(
            id=inv.id, student_id=inv.student_id, academic_year_id=inv.academic_year_id,
            fee_type_id=inv.fee_type_id, total_amount=float(inv.total_amount),
            paid_amount=float(inv.paid_amount or 0), due_amount=inv.due_amount,
            due_date=inv.due_date, status=inv.status,
        ))
    return out


@router.post("/invoices", status_code=201, dependencies=[Depends(require_admin)])
def create_invoice(data: InvoiceCreate, db: Session = Depends(get_db)):
    inv = FeeInvoice(**data.model_dump(), paid_amount=0, status=InvoiceStatus.PENDING)
    db.add(inv)
    db.commit()
    db.refresh(inv)
    return {"id": inv.id, "status": inv.status}


@router.post("/invoices/bulk", dependencies=[Depends(require_admin)])
def bulk_create_invoices(data: BulkInvoiceCreate, db: Session = Depends(get_db)):
    students = db.query(StudentProfile).filter(
        StudentProfile.class_id == data.class_id,
        StudentProfile.status == "ACTIVE",
    ).all()
    created = []
    for s in students:
        existing = db.query(FeeInvoice).filter(
            FeeInvoice.student_id == s.id,
            FeeInvoice.fee_type_id == data.fee_type_id,
            FeeInvoice.due_date == data.due_date,
        ).first()
        if existing:
            continue
        inv = FeeInvoice(
            student_id=s.id,
            fee_type_id=data.fee_type_id,
            total_amount=data.total_amount,
            paid_amount=0,
            due_date=data.due_date,
            status=InvoiceStatus.PENDING,
        )
        db.add(inv)
        created.append(inv)

    if created:
        db.commit()

    # Notify students
    from app.models.notification import Notification
    from app.models.user import User as UserModel
    fee_type = db.get(FeeType, data.fee_type_id)
    fee_name = fee_type.name.value if fee_type else "Fee"
    students_users = db.query(UserModel).filter(
        UserModel.role == UserRole.STUDENT,
        UserModel.is_active == True,
    ).all()
    for su in students_users:
        n = Notification(
            user_id=su.id,
            title=f"New Fee Invoice: {fee_name}",
            message=f"A {fee_name} invoice of {data.total_amount} has been generated. Due: {data.due_date or 'TBA'}.",
            type="FEE",
        )
        db.add(n)
    db.commit()

    return {"generated": len(created), "total_students": len(students)}


@router.delete("/invoices/{invoice_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_invoice(invoice_id: int, db: Session = Depends(get_db)):
    inv = db.get(FeeInvoice, invoice_id)
    if not inv:
        raise HTTPException(404, "Invoice not found")
    db.delete(inv)
    db.commit()


# ── Admin: Payments ─────────────────────────────────────────────────────────


@router.post("/invoices/{invoice_id}/payments", response_model=PaymentOut, status_code=201, dependencies=[Depends(require_admin)])
def pay(invoice_id: int, data: PaymentCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    inv = db.get(FeeInvoice, invoice_id)
    if not inv:
        raise HTTPException(404, "Invoice not found")
    payment = FeePayment(invoice_id=invoice_id, amount=data.amount, method=data.method, note=data.note, received_by=user.id)
    db.add(payment)
    inv.paid_amount = float(inv.paid_amount or 0) + float(data.amount)
    _refresh_status(inv)
    db.commit()
    db.refresh(payment)

    # Notify student if fully paid
    if inv.status == InvoiceStatus.PAID:
        from app.models.notification import Notification
        from app.models.user import User as UserModel
        student = db.get(StudentProfile, inv.student_id)
        if student and student.user_id:
            fee_type = db.get(FeeType, inv.fee_type_id)
            n = Notification(
                user_id=student.user_id,
                title="Fee Payment Complete",
                message=f"Your {fee_type.name.value if fee_type else 'fee'} invoice has been fully paid.",
                type="FEE",
            )
            db.add(n)
            db.commit()

    return payment


# ── Student: View Own Invoices ──────────────────────────────────────────────


@router.get("/my-invoices")
def my_invoices(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    student = db.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    if not student:
        return []
    invoices = db.query(FeeInvoice).filter(
        FeeInvoice.student_id == student.id
    ).order_by(FeeInvoice.id.desc()).all()
    out = []
    for inv in invoices:
        fee_type = db.get(FeeType, inv.fee_type_id)
        payments = db.query(FeePayment).filter(FeePayment.invoice_id == inv.id).order_by(FeePayment.paid_at.desc()).all()
        out.append({
            "id": inv.id,
            "fee_type_name": fee_type.name.value if fee_type else None,
            "total_amount": float(inv.total_amount),
            "paid_amount": float(inv.paid_amount or 0),
            "due_amount": inv.due_amount,
            "due_date": str(inv.due_date) if inv.due_date else None,
            "status": inv.status.value,
            "payments": [
                {
                    "amount": float(p.amount),
                    "method": p.method.value,
                    "paid_at": p.paid_at.isoformat() if p.paid_at else None,
                }
                for p in payments
            ],
        })
    return out
