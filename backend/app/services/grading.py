"""Grading bands exactly as specified."""
from dataclasses import dataclass


@dataclass(frozen=True)
class Band:
    min_marks: float
    grade: str
    gpa: float


BANDS: list[Band] = [
    Band(80, "A+", 5.00),
    Band(70, "A", 4.00),
    Band(60, "A-", 3.50),
    Band(50, "B", 3.00),
    Band(40, "C", 2.00),
    Band(33, "D", 1.00),
    Band(0, "F", 0.00),
]


def grade_for(marks: float) -> tuple[str, float]:
    if marks < 0 or marks > 100:
        raise ValueError("marks must be within 0-100")
    for b in BANDS:
        if marks >= b.min_marks:
            return b.grade, b.gpa
    return "F", 0.0


def summarize(marks: list[float]) -> dict:
    """Total / average / GPA / pass-fail for a report card."""
    if not marks:
        return {"total": 0, "average": 0.0, "gpa": 0.0, "result": "N/A"}
    total = sum(marks)
    avg = total / len(marks)
    gpas = [grade_for(m)[1] for m in marks]
    gpa = round(sum(gpas) / len(gpas), 2)
    passed = all(m >= 33 for m in marks)
    return {"total": total, "average": round(avg, 2), "gpa": gpa, "result": "PASS" if passed else "FAIL"}


def attendance_rate(present_days: int, total_days: int) -> float:
    if total_days <= 0:
        return 0.0
    return round(present_days / total_days * 100, 2)
