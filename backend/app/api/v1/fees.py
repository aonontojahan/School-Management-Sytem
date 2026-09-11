from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_admin
from app.db.session import get_db
from app.models.enums import InvoiceStatus
from app.models.fee import FeeInvoice, FeePayment, FeeType
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


@router.get("/types", response_model=list[FeeTypeOut])
def list_types(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(FeeType).all()


@router.get("/invoices", response_model=list[InvoiceOut])
def list_invoices(student_id: int | None = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(FeeInvoice)
    if student_id:
        q = q.filter(FeeInvoice.student_id == student_id)
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
    return payment
