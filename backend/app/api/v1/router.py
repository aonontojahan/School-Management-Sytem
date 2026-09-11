from fastapi import APIRouter

from app.api.v1 import assignments, attendance, auth, academic, dashboard, exams, fees, guardians, students, teachers, users

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(students.router)
api_router.include_router(teachers.router)
api_router.include_router(guardians.router)
api_router.include_router(academic.router)
api_router.include_router(attendance.router)
api_router.include_router(exams.router)
api_router.include_router(fees.router)
api_router.include_router(assignments.router)
api_router.include_router(dashboard.router)
