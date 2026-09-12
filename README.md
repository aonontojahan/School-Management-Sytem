# School Management System (SMS)

A role-based school management system with dedicated workflows for
administrators, teachers, students, and guardians — covering students,
teachers, guardians, classes, subjects, attendance, exams/results, fees,
assignments, and reports.

## Stack

| Layer    | Tech |
|----------|------|
| Frontend | React 19, TypeScript, React Router 7, Axios, TanStack React Query, React Hook Form, Zod, Tailwind CSS, Vite |
| Backend  | Python, FastAPI, SQLAlchemy 2.0, Pydantic v2, Alembic, Uvicorn, PostgreSQL, JWT (access + refresh), Bcrypt, RBAC |
| Deploy   | Frontend → Vercel · Backend → any FastAPI-compatible host (persistent Uvicorn server, **not** Vercel serverless) · DB → managed PostgreSQL |

## Roles & Menus

| Admin | Teacher | Student | Guardian |
|-------|---------|---------|----------|
| Dashboard, Students, Teachers, Guardians, Classes, Subjects, Attendance, Exams, Results, Fees, Reports | Dashboard, My Classes, Students, Attendance, Assignments, Exams, Results | Dashboard, My Profile, My Classes, Attendance, Assignments, Exams, Results | Dashboard, Children, Attendance, Results, Fees |

Grading bands are computed server-side: 80+ A+, 70–79 A, 60–69 A-,
50–59 B, 40–49 C, 33–39 D, below 33 F (fail).

## Prerequisites

- Windows 11, VS Code, Git (**all commands below run in Git Bash**)
- Python 3.12, Node.js 20+
- PostgreSQL 16 running on `localhost:5432` with a login role
  (e.g. user `aonontojahan`)

## 1. Backend setup

```bash
cd backend

# Virtual environment (already exists as .venv — create only if missing)
python -m venv .venv
source .venv/Scripts/activate
pip install -r requirements.txt

# Environment — copy the example and fill in REAL values (never commit .env)
cp .env.example .env
# .env must contain:
#   DATABASE_URL=postgresql+psycopg://USER:PASSWORD@localhost:5432/sms_db
#   SECRET_KEY=<long random string>
#   REFRESH_SECRET_KEY=<another long random string>
#   Generate with: python -c "import secrets; print(secrets.token_urlsafe(64))"

# Database (run once; password is read from PGPASSWORD, never typed visibly)
export PGPASSWORD='<YOUR_POSTGRES_PASSWORD>'
psql -U aonontojahan -h localhost -d postgres -c "CREATE DATABASE sms_db;"
alembic upgrade head
python -m app.seed
# Seed creates: 7 subjects, 6 fee types, and admin
#   admin@school.edu / Admin123!  (override via ADMIN_EMAIL / ADMIN_PASSWORD env vars)
#   Change this password after first login (Profile → Change password).

# Run (keep this terminal open)
python -m uvicorn app.main:app --reload
# API: http://127.0.0.1:8000  ·  Docs: http://127.0.0.1:8000/docs
# Health: /health  ·  DB readiness: /ready
```

## 2. Frontend setup (new Git Bash terminal)

```bash
cd frontend
npm install

# Environment
cp .env.example .env
# VITE_API_URL=http://127.0.0.1:8000  (must match the running backend)

npm run dev      # http://localhost:5173
npm run build    # production build (tsc + vite)
```

Login with the seeded admin (`admin@school.edu` / `Admin123!`).
Access/refresh tokens are handled automatically (axios interceptor +
refresh rotation); logout revokes the refresh token server-side.

## Creating teacher / student / guardian accounts

There is no public self-registration — the **admin creates every account**.
Each person needs two records: a **login** (`/users`) and a **profile**
(`/teachers`, `/students`, or `/guardians`). Use the interactive docs at
http://127.0.0.1:8000/docs (authorize with an admin token), or curl in
Git Bash while the backend is running:

```bash
# 1. Log in as admin and save the token
TOKEN=$(curl -s -X POST http://127.0.0.1:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.edu","password":"Admin123!"}' \
  | python -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

# 2. Create a login (role = TEACHER, STUDENT or GUARDIAN)
curl -s -X POST http://127.0.0.1:8000/api/v1/users \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"email":"rahim.teacher@school.edu","password":"Teacher123!","role":"TEACHER","is_active":true}'

# 3. Create the matching profile (use the SAME email so they stay linked)
curl -s -X POST http://127.0.0.1:8000/api/v1/teachers \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"first_name":"Rahim","last_name":"Uddin","email":"rahim.teacher@school.edu","department":"Science","designation":"Assistant Teacher"}'

# Students accept class/section/roll + guardian links, e.g.:
# '{"first_name":"Karim",...,"class_id":1,"section_id":1,"roll_number":12,"guardian_ids":[1]}'
```

The new user then logs in at http://localhost:5173 with their own
email/password and automatically sees their role's menu. Only admins can
hit `/users` (teachers/students get 403), and deactivation is
`PATCH /users/{id}/status?is_active=false`.

## 3. Verify everything works

```bash
cd backend
source .venv/Scripts/activate
python -m pytest -q          # unit + smoke tests
alembic current              # fa06b4e695d5 (head)
curl http://127.0.0.1:8000/ready   # {"status":"ready","db":"up"}
```

## Project structure

```
backend/
  app/
    api/v1/        # auth, users, students, teachers, guardians, academic,
                   # attendance, exams, fees, assignments, dashboard
    core/          # config (env-only), security (bcrypt+JWT), deps (RBAC guards)
    db/            # engine/session, Base
    models/        # users, people, academic, attendance, exam, fee, assignment, enums
    schemas/       # Pydantic request/response models
    services/      # grading bands, report-card summary, attendance rate
    main.py        # FastAPI app, CORS, /health, /ready
    seed.py        # idempotent baseline seed
  alembic/         # migrations (committed — env-driven, no hardcoded creds)
  tests/           # pytest suite (SQLite, no Postgres password needed)
frontend/
  src/
    auth/          # AuthContext, ProtectedRoute (role guards)
    components/    # Layout with per-role sidebar menus
    pages/         # Login, Dashboard, Tables (per-module views)
    lib/api.ts     # axios client + token refresh
```

## Environment variables

Backend (`backend/.env`, git-ignored):

| Var | Purpose |
|-----|---------|
| `DATABASE_URL` | SQLAlchemy URL, e.g. `postgresql+psycopg://USER:PASSWORD@localhost:5432/sms_db` |
| `SECRET_KEY` / `REFRESH_SECRET_KEY` | JWT signing keys (long random strings) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` / `REFRESH_TOKEN_EXPIRE_DAYS` | Token lifetimes (defaults 30 / 7) |
| `BACKEND_CORS_ORIGINS` | Allowed frontend origins (comma-separated) |
| `APP_NAME`, `ENVIRONMENT` | App metadata |

Frontend (`frontend/.env`, git-ignored): `VITE_API_URL` only.

> Never commit `.env` files or passwords. Share only `.env.example`.

## Deployment notes

- Push the frontend to **Vercel** with `VITE_API_URL` set to the public
  backend URL.
- Host the backend on a platform that runs a persistent Uvicorn process
  (Render, Railway, Fly.io, VPS, …) with `DATABASE_URL` pointing at a
  managed PostgreSQL instance; run `alembic upgrade head` on deploy.
