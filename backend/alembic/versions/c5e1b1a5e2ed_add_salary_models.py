"""add salary models

Revision ID: c5e1b1a5e2ed
Revises: 1ba5700af63e
Create Date: 2026-09-12 22:29:24.730340

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'c5e1b1a5e2ed'
down_revision: Union[str, None] = '1ba5700af63e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('salary_structures',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('teacher_id', sa.Integer(), nullable=False),
    sa.Column('academic_year_id', sa.Integer(), nullable=True),
    sa.Column('monthly_amount', sa.Numeric(precision=12, scale=2), nullable=False),
    sa.Column('effective_from', sa.Date(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['academic_year_id'], ['academic_years.id'], ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['teacher_id'], ['teacher_profiles.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('teacher_id', 'academic_year_id', name='uq_teacher_year_salary')
    )
    op.create_index(op.f('ix_salary_structures_teacher_id'), 'salary_structures', ['teacher_id'], unique=False)
    op.create_table('salary_payments',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('salary_structure_id', sa.Integer(), nullable=False),
    sa.Column('teacher_id', sa.Integer(), nullable=False),
    sa.Column('month', sa.Integer(), nullable=False),
    sa.Column('year', sa.Integer(), nullable=False),
    sa.Column('amount', sa.Numeric(precision=12, scale=2), nullable=False),
    sa.Column('status', sa.Enum('PENDING', 'PAID', 'OVERDUE', name='salarystatus'), nullable=False),
    sa.Column('paid_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('paid_by', sa.Integer(), nullable=True),
    sa.Column('note', sa.String(length=500), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['paid_by'], ['users.id'], ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['salary_structure_id'], ['salary_structures.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['teacher_id'], ['teacher_profiles.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('salary_structure_id', 'month', 'year', name='uq_salary_month_year')
    )
    op.create_index(op.f('ix_salary_payments_salary_structure_id'), 'salary_payments', ['salary_structure_id'], unique=False)
    op.create_index(op.f('ix_salary_payments_teacher_id'), 'salary_payments', ['teacher_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_salary_payments_teacher_id'), table_name='salary_payments')
    op.drop_index(op.f('ix_salary_payments_salary_structure_id'), table_name='salary_payments')
    op.drop_table('salary_payments')
    op.drop_index(op.f('ix_salary_structures_teacher_id'), table_name='salary_structures')
    op.drop_table('salary_structures')
