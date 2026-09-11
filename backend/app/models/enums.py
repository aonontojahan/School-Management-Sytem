"""Shared enums — single source of truth for spec statuses/grades."""
import enum


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    TEACHER = "TEACHER"
    STUDENT = "STUDENT"
    GUARDIAN = "GUARDIAN"


class Gender(str, enum.Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    OTHER = "OTHER"


class PersonStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class AttendanceStatus(str, enum.Enum):
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    LATE = "LATE"
    EXCUSED = "EXCUSED"


class ExamType(str, enum.Enum):
    MID_TERM = "MID_TERM"
    FINAL = "FINAL"
    CLASS_TEST = "CLASS_TEST"
    MONTHLY_TEST = "MONTHLY_TEST"


class FeeTypeName(str, enum.Enum):
    ADMISSION = "ADMISSION"
    TUITION = "TUITION"
    EXAM = "EXAM"
    LIBRARY = "LIBRARY"
    TRANSPORT = "TRANSPORT"
    OTHER = "OTHER"


class InvoiceStatus(str, enum.Enum):
    PENDING = "PENDING"
    PARTIAL = "PARTIAL"
    PAID = "PAID"
    OVERDUE = "OVERDUE"


class PaymentMethod(str, enum.Enum):
    CASH = "CASH"
    BKASH = "BKASH"
    NAGAD = "NAGAD"
    BANK = "BANK"
    OTHER = "OTHER"
