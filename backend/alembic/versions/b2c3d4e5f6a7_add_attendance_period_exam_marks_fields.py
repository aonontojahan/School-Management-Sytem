"""add attendance period, exam marks fields, mark remarks

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-09-12 11:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('attendances', sa.Column('period', sa.Integer(), nullable=True))
    op.add_column('exams', sa.Column('total_marks', sa.Integer(), server_default='100', nullable=False))
    op.add_column('exams', sa.Column('passing_marks', sa.Integer(), server_default='33', nullable=False))
    op.add_column('marks', sa.Column('remarks', sa.String(length=500), nullable=True))


def downgrade() -> None:
    op.drop_column('marks', 'remarks')
    op.drop_column('exams', 'passing_marks')
    op.drop_column('exams', 'total_marks')
    op.drop_column('attendances', 'period')
