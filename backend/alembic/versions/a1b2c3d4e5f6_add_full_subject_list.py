"""add full subject list

Revision ID: a1b2c3d4e5f6
Revises: ed2a1854a423
Create Date: 2026-09-12 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = 'ed2a1854a423'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

NEW_SUBJECTS = [
    ("Bangla 1st Paper", "BAN1"),
    ("Bangla 2nd Paper", "BAN2"),
    ("English 1st Paper", "ENG1"),
    ("English 2nd Paper", "ENG2"),
    ("Mathematics", "MATH"),
    ("Science", "SCI"),
    ("Physics", "PHY"),
    ("Chemistry", "CHEM"),
    ("Biology", "BIO"),
    ("Higher Mathematics", "HMATH"),
    ("Bangladesh & Global Studies", "BGS"),
    ("History of Bangladesh & World Civilization", "HIST"),
    ("Geography & Environment", "GEO"),
    ("Civics & Citizenship", "CIV"),
    ("Economics", "ECON"),
    ("Accounting", "ACC"),
    ("Finance & Banking", "FIN"),
    ("Business Entrepreneurship", "BEnt"),
    ("Information & Communication Technology", "ICT"),
    ("Religion & Moral Education", "REL"),
    ("Physical Education, Health Science & Sports", "PE"),
    ("Career Education", "Career"),
    ("Arts & Crafts", "Art"),
]


def upgrade() -> None:
    conn = op.get_bind()
    for name, code in NEW_SUBJECTS:
        exists = conn.execute(
            sa.text("SELECT 1 FROM subjects WHERE code = :code"), {"code": code}
        ).first()
        if not exists:
            conn.execute(
                sa.text("INSERT INTO subjects (name, code) VALUES (:name, :code)"),
                {"name": name, "code": code},
            )


def downgrade() -> None:
    conn = op.get_bind()
    codes = [code for _, code in NEW_SUBJECTS]
    conn.execute(
        sa.text("DELETE FROM subjects WHERE code IN :codes"), {"codes": tuple(codes)}
    )
