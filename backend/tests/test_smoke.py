"""Smoke tests using SQLite (no Postgres password needed)."""
import os

os.environ.setdefault("DATABASE_URL", "sqlite:///./test_smoke.db")
os.environ.setdefault("SECRET_KEY", "test-secret")
os.environ.setdefault("REFRESH_SECRET_KEY", "test-refresh")

from fastapi.testclient import TestClient  # noqa: E402

from app.core.security import hash_password, verify_password  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.db.session import engine  # noqa: E402
from app.main import app  # noqa: E402
from app.schemas.auth import LoginIn  # noqa: E402


def test_password_roundtrip():
    h = hash_password("Secret123!")
    assert verify_password("Secret123!", h)
    assert not verify_password("wrong", h)


def test_health():
    c = TestClient(app)
    r = c.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_seeded_admin_email_passes_login_schema():
    # Regression: seed default must satisfy EmailStr (`.local` was rejected).
    assert LoginIn(email="admin@school.edu", password="Admin123!").email == "admin@school.edu"
