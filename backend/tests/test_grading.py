from app.services.grading import attendance_rate, grade_for, summarize


def test_grade_bands_spec():
    assert grade_for(85) == ("A+", 5.0)
    assert grade_for(72) == ("A", 4.0)
    assert grade_for(65) == ("A-", 3.5)
    assert grade_for(55) == ("B", 3.0)
    assert grade_for(45) == ("C", 2.0)
    assert grade_for(35) == ("D", 1.0)
    assert grade_for(10) == ("F", 0.0)


def test_report_card_example():
    # Spec example: 85, 78, 91, 88
    s = summarize([85, 78, 91, 88])
    assert s["total"] == 342
    assert s["result"] == "PASS"
    assert s["gpa"] > 4.0


def test_fail_if_any_below_33():
    assert summarize([80, 20])["result"] == "FAIL"


def test_attendance_rate():
    assert attendance_rate(18, 20) == 90.0
    assert attendance_rate(0, 0) == 0.0
