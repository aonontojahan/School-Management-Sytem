"""make exam class_id nullable for school-wide exams

Revision ID: e1f2a3b4c5d6
Revises: d6f7e8a9b0c1
Create Date: 2026-09-13
"""
from alembic import op
import sqlalchemy as sa


revision = "e1f2a3b4c5d6"
down_revision = "d6f7e8a9b0c1"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column("exams", "class_id", nullable=True)


def downgrade() -> None:
    op.alter_column("exams", "class_id", nullable=False)
