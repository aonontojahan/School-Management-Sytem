import warnings

from contextlib import asynccontextmanager

from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.v1.router import api_router
from app.core.config import settings
from app.db.session import engine, SessionLocal


def monthly_generate_job():
    """Background job: auto-generate tuition fees + salary on the 28th of each month."""
    from app.models.enums import PersonStatus, SalaryStatus
    from app.models.fee import FeeInvoice, FeeType
    from app.models.people import StudentProfile, TeacherProfile
    from app.models.user import User
    from app.models.enums import UserRole
    from datetime import date
    from sqlalchemy import extract

    db = SessionLocal()
    try:
        today = date.today()
        m = today.month
        y = today.year

        # Generate tuition fee invoices
        tuition_fee_type = db.query(FeeType).filter(FeeType.name == "TUITION").first()
        if tuition_fee_type:
            students = db.query(StudentProfile).filter(StudentProfile.status == PersonStatus.ACTIVE).all()
            for s in students:
                existing = db.query(FeeInvoice).filter(
                    FeeInvoice.student_id == s.id,
                    FeeInvoice.fee_type_id == tuition_fee_type.id,
                    extract("month", FeeInvoice.due_date) == m,
                    extract("year", FeeInvoice.due_date) == y,
                ).first()
                if existing:
                    continue
                inv = FeeInvoice(
                    student_id=s.id,
                    fee_type_id=tuition_fee_type.id,
                    total_amount=0,
                    paid_amount=0,
                    due_date=date(y, m, 28),
                    status="PENDING",
                )
                db.add(inv)

        # Generate salary payments
        from app.models.salary import SalaryPayment, SalaryStructure
        structures = db.query(SalaryStructure).all()
        for st in structures:
            existing = db.query(SalaryPayment).filter(
                SalaryPayment.salary_structure_id == st.id,
                SalaryPayment.month == m,
                SalaryPayment.year == y,
            ).first()
            if existing:
                continue
            payment = SalaryPayment(
                salary_structure_id=st.id,
                teacher_id=st.teacher_id,
                month=m,
                year=y,
                amount=float(st.monthly_amount),
                status=SalaryStatus.PENDING,
            )
            db.add(payment)

        db.commit()

        # Send notifications
        from app.models.notification import Notification
        month_names = ["", "January", "February", "March", "April", "May", "June",
                       "July", "August", "September", "October", "November", "December"]
        month_name_str = month_names[m]

        student_users = db.query(User).filter(User.role == UserRole.STUDENT, User.is_active == True).all()
        for su in student_users:
            n = Notification(user_id=su.id, title=f"Tuition Fee: {month_name_str} {y}",
                           message=f"Your tuition fee for {month_name_str} {y} has been generated.", type="FEE")
            db.add(n)

        teacher_users = db.query(User).filter(User.role == UserRole.TEACHER, User.is_active == True).all()
        for tu in teacher_users:
            n = Notification(user_id=tu.id, title=f"Salary Processed: {month_name_str} {y}",
                           message=f"Your salary for {month_name_str} {y} has been processed.", type="SALARY")
            db.add(n)

        db.commit()
        print(f"[CRON] Monthly records generated for {month_name_str} {y}")
    except Exception as e:
        print(f"[CRON] Error: {e}")
        db.rollback()
    finally:
        db.close()


scheduler = BackgroundScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.ENVIRONMENT == "production" and "CHANGE_ME" in (settings.SECRET_KEY + settings.DATABASE_URL):
        warnings.warn("Placeholder SECRET_KEY/DATABASE_URL in production!")

    # Start APScheduler: run on 28th of each month at 23:55 (just before month ends)
    scheduler.add_job(monthly_generate_job, "cron", day="28", hour=23, minute=55, id="monthly_generate")
    scheduler.start()
    print("[CRON] APScheduler started — monthly generation scheduled for 28th at 23:55")
    yield
    scheduler.shutdown()


app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/health")
def health():
    return {"status": "ok", "app": settings.APP_NAME}


@app.get("/ready")
def ready():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ready", "db": "up"}
    except Exception as exc:  # noqa: BLE001 - surfaced for ops debugging
        return {"status": "not-ready", "db": "down", "detail": str(exc)[:300]}
