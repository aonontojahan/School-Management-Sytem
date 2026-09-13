"""add exam routine group

Revision ID: d6f7e8a9b0c1
Revises: c5e1b1a5e2ed
Create Date: 2026-09-13 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d6f7e8a9b0c1"
down_revision: Union[str, None] = "c5e1b1a5e2ed"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("exam_routines", sa.Column("group", sa.String(32), nullable=True))


def downgrade() -> None:
    op.drop_column("exam_routines", "group")
