"""Add periods, routines, class_group_subjects, student group/academic_year

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-09-12
"""
from alembic import op
import sqlalchemy as sa

revision = "c3d4e5f6a7b8"
down_revision = "b2c3d4e5f6a7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add group and academic_year_id to student_profiles
    op.add_column("student_profiles", sa.Column("group", sa.String(32), nullable=True))
    op.add_column("student_profiles", sa.Column("academic_year_id", sa.Integer(), nullable=True))
    op.create_foreign_key("fk_student_academic_year", "student_profiles", "academic_years", ["academic_year_id"], ["id"], ondelete="SET NULL")

    # Create class_group_subjects table
    op.create_table(
        "class_group_subjects",
        sa.Column("class_id", sa.Integer(), sa.ForeignKey("classes.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("group_name", sa.String(32), primary_key=True),
        sa.Column("subject_id", sa.Integer(), sa.ForeignKey("subjects.id", ondelete="CASCADE"), primary_key=True),
    )

    # Create periods table
    op.create_table(
        "periods",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("academic_year_id", sa.Integer(), sa.ForeignKey("academic_years.id", ondelete="CASCADE"), index=True),
        sa.Column("period_number", sa.Integer(), nullable=False),
        sa.Column("label", sa.String(32), nullable=False),
        sa.Column("start_time", sa.Time(), nullable=False),
        sa.Column("end_time", sa.Time(), nullable=False),
        sa.UniqueConstraint("academic_year_id", "period_number", name="uq_year_period"),
    )

    # Create routines table
    op.create_table(
        "routines",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("academic_year_id", sa.Integer(), sa.ForeignKey("academic_years.id", ondelete="CASCADE"), index=True),
        sa.Column("class_id", sa.Integer(), sa.ForeignKey("classes.id", ondelete="CASCADE"), index=True),
        sa.Column("section_id", sa.Integer(), sa.ForeignKey("sections.id", ondelete="CASCADE"), index=True),
        sa.Column("group", sa.String(32), nullable=True),
        sa.Column("day", sa.String(16), nullable=False),
        sa.Column("period_id", sa.Integer(), sa.ForeignKey("periods.id", ondelete="CASCADE"), index=True),
        sa.Column("subject_id", sa.Integer(), sa.ForeignKey("subjects.id", ondelete="CASCADE"), index=True),
        sa.Column("teacher_id", sa.Integer(), sa.ForeignKey("teacher_profiles.id", ondelete="SET NULL"), index=True),
        sa.UniqueConstraint("class_id", "section_id", "day", "period_id", name="uq_class_section_day_period"),
    )


def downgrade() -> None:
    op.drop_table("routines")
    op.drop_table("periods")
    op.drop_table("class_group_subjects")
    op.drop_constraint("fk_student_academic_year", "student_profiles", type_="foreignkey")
    op.drop_column("student_profiles", "academic_year_id")
    op.drop_column("student_profiles", "group")
