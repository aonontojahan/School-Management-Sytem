from fastapi import APIRouter

from app.api.v1 import admin, assignments, attendance, auth, academic, dashboard, exams, fees, notifications, routines, salary, students, teachers, users

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(admin.router)
api_router.include_router(students.router)
api_router.include_router(teachers.router)
api_router.include_router(academic.router)
api_router.include_router(attendance.router)
api_router.include_router(exams.router)
api_router.include_router(fees.router)
api_router.include_router(assignments.router)
api_router.include_router(dashboard.router)
api_router.include_router(routines.router)
api_router.include_router(notifications.router)
api_router.include_router(salary.router)
