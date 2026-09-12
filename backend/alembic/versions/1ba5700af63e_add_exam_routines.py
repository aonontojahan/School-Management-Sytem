"""add_exam_routines

Revision ID: 1ba5700af63e
Revises: a67016dcb29c
Create Date: 2026-09-12 16:02:25.349407
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '1ba5700af63e'
down_revision: Union[str, None] = 'a67016dcb29c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('exam_routines',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('exam_id', sa.Integer(), nullable=False),
    sa.Column('class_id', sa.Integer(), nullable=False),
    sa.Column('section_id', sa.Integer(), nullable=True),
    sa.Column('subject_id', sa.Integer(), nullable=False),
    sa.Column('teacher_id', sa.Integer(), nullable=True),
    sa.Column('exam_date', sa.Date(), nullable=False),
    sa.Column('start_time', sa.Time(), nullable=False),
    sa.Column('end_time', sa.Time(), nullable=False),
    sa.Column('room', sa.String(length=50), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['class_id'], ['classes.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['exam_id'], ['exams.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['section_id'], ['sections.id'], ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['subject_id'], ['subjects.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['teacher_id'], ['teacher_profiles.id'], ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('exam_id', 'class_id', 'subject_id', 'exam_date', name='uq_exam_class_subject_date')
    )
    op.create_index(op.f('ix_exam_routines_class_id'), 'exam_routines', ['class_id'], unique=False)
    op.create_index(op.f('ix_exam_routines_exam_id'), 'exam_routines', ['exam_id'], unique=False)
    op.create_index(op.f('ix_exam_routines_subject_id'), 'exam_routines', ['subject_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_exam_routines_subject_id'), table_name='exam_routines')
    op.drop_index(op.f('ix_exam_routines_exam_id'), table_name='exam_routines')
    op.drop_index(op.f('ix_exam_routines_class_id'), table_name='exam_routines')
    op.drop_table('exam_routines')
