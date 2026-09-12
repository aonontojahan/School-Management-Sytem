"""Role-system tests: username login, self-service /me, admin delete cascade, RBAC denials.

Uses an isolated SQLite DB via FastAPI dependency_overrides (immune to the
real Postgres .env and to other test modules' settings).
"""
import os

os.environ.setdefault("SECRET_KEY", "test-secret-roles")
os.environ.setdefault("REFRESH_SECRET_KEY", "test-refresh-roles")

from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402

from app.core.security import hash_password  # noqa: E402
from app.db.base import Base  # noqa: E402
from app.db.session import get_db  # noqa: E402
import app.models  # noqa: F401,E402 (register tables)
from app.main import app  # noqa: E402
from app.models.user import User  # noqa: E402
from app.models.enums import UserRole  # noqa: E402

TEST_DB = "./test_roles.db"
if os.path.exists(TEST_DB):
    os.remove(TEST_DB)

engine = create_engine(TEST_DB and f"sqlite:///{TEST_DB}", connect_args={"check_same_thread": False})
TestingSession = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)
Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


def _seed_admin():
    with TestingSession() as db:
        if not db.query(User).filter(User.email == "admin@school.edu").first():
            db.add(User(email="admin@school.edu", username="admin",
                        hashed_password=hash_password("Admin123!"), role=UserRole.ADMIN))
            db.commit()


def _login(identifier: str, password: str):
    r = client.post("/api/v1/auth/login", json={"identifier": identifier, "password": password})
    assert r.status_code == 200, r.text
    return r.json()


def _admin_token() -> str:
    _seed_admin()
    return _login("admin@school.edu", "Admin123!")["access_token"]


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


def test_username_and_email_login_teacher_self_service():
    admin = _auth(_admin_token())
    # Admin creates teacher login with gmail + username + password.
    r = client.post("/api/v1/users", headers=admin, json={
        "email": "t1@school.edu", "username": "t1rahim",
        "password": "Teacher123!", "role": "TEACHER"})
    assert r.status_code == 201, r.text
    teacher_user_id = r.json()["id"]
    # Duplicate username rejected; guardian role rejected.
    assert client.post("/api/v1/users", headers=admin, json={
        "email": "other@school.edu", "username": "t1rahim",
        "password": "Teacher123!", "role": "TEACHER"}).status_code == 400
    assert client.post("/api/v1/users", headers=admin, json={
        "email": "g@school.edu", "username": "gg",
        "password": "Guardian1!", "role": "GUARDIAN"}).status_code == 400
    # Admin creates linked teacher profile.
    r = client.post("/api/v1/teachers", headers=admin, json={
        "first_name": "Rahim", "last_name": "U", "email": "t1@school.edu",
        "user_id": teacher_user_id})
    assert r.status_code == 201, r.text
    assert r.json()["user_id"] == teacher_user_id
    teacher_id = r.json()["id"]

    # Login works with username AND with email.
    assert _login("t1rahim", "Teacher123!")["role"] == "TEACHER"
    ttok = _auth(_login("t1@school.edu", "Teacher123!")["access_token"])
    # Self-service: read + update own profile; status change silently ignored.
    assert client.get("/api/v1/teachers/me", headers=ttok).status_code == 200
    r = client.patch("/api/v1/teachers/me", headers=ttok, json={"phone": "017111", "status": "INACTIVE"})
    assert r.status_code == 200, r.text
    assert r.json()["phone"] == "017111" and r.json()["status"] == "ACTIVE"
    # Teacher can never touch admin endpoints or other profiles.
    assert client.post("/api/v1/users", headers=ttok, json={
        "email": "z@school.edu", "username": "zz9", "password": "Zzzzz123!", "role": "STUDENT"}).status_code == 403
    assert client.patch(f"/api/v1/teachers/{teacher_id}", headers=ttok, json={"phone": "x"}).status_code == 403
    assert client.delete(f"/api/v1/teachers/{teacher_id}", headers=ttok).status_code == 403


def test_student_self_service_and_admin_delete_cascade():
    admin = _auth(_admin_token())
    r = client.post("/api/v1/users", headers=admin, json={
        "email": "s1@school.edu", "username": "s1karim",
        "password": "Student123!", "role": "STUDENT"})
    assert r.status_code == 201, r.text
    student_user_id = r.json()["id"]
    r = client.post("/api/v1/students", headers=admin, json={
        "first_name": "Karim", "last_name": "H", "email": "s1@school.edu",
        "roll_number": 12, "division": "Science",
        "guardian_name": "Nasrin", "guardian_phone": "017000",
        "user_id": student_user_id})
    assert r.status_code == 201, r.text
    assert r.json()["division"] == "Science" and r.json()["guardian_name"] == "Nasrin"
    student_id = r.json()["id"]

    stok = _auth(_login("s1karim", "Student123!")["access_token"])
    assert client.get("/api/v1/students/me", headers=stok).status_code == 200
    # Roll/status changes are ignored for self-service.
    r = client.patch("/api/v1/students/me", headers=stok,
                     json={"phone": "018222", "roll_number": 99, "status": "INACTIVE"})
    assert r.status_code == 200, r.text
    assert r.json()["phone"] == "018222" and r.json()["roll_number"] == 12
    assert r.json()["status"] == "ACTIVE"
    assert client.delete(f"/api/v1/students/{student_id}", headers=stok).status_code == 403

    # Admin resets password, then deletes: profile + login vanish, no orphans.
    assert client.patch(f"/api/v1/users/{student_user_id}/password",
                        headers=admin, json={"new_password": "BrandNew123!"}).status_code == 200
    assert _login("s1karim", "BrandNew123!")["role"] == "STUDENT"
    assert client.delete(f"/api/v1/students/{student_id}", headers=admin).status_code == 204
    assert client.get(f"/api/v1/students/{student_id}", headers=admin).status_code == 404
    assert client.post("/api/v1/auth/login",
                       json={"identifier": "s1karim", "password": "BrandNew123!"}).status_code == 401
    with TestingSession() as db:
        assert db.query(User).filter(User.email == "s1@school.edu").first() is None


def test_guardians_endpoints_are_gone():
    admin = _auth(_admin_token())
    assert client.get("/api/v1/guardians", headers=admin).status_code == 404
    assert "guardians" not in client.get(
        "/api/v1/dashboard/summary", headers=admin).json()
