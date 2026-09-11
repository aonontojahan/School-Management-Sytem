"""Import all models here so Alembic autogenerate sees every table."""
from app.db.base import Base  # noqa: F401
from app.models.academic import AcademicYear, SchoolClass, Section, Subject  # noqa: F401
from app.models.assignment import Assignment, AssignmentSubmission  # noqa: F401
from app.models.attendance import Attendance  # noqa: F401
from app.models.enums import (  # noqa: F401
    AttendanceStatus,
    ExamType,
    FeeTypeName,
    Gender,
    InvoiceStatus,
    PaymentMethod,
    PersonStatus,
    UserRole,
)
from app.models.exam import Exam, Mark  # noqa: F401
from app.models.fee import FeeInvoice, FeePayment, FeeType  # noqa: F401
from app.models.people import GuardianProfile, StudentProfile, TeacherProfile  # noqa: F401
from app.models.user import RefreshToken, User  # noqa: F401
