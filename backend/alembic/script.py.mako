"""Alembic migration script template."""
revision: str = "${revises}")
down_revision: str | None = ${down_revision}
branch_labels: str | None = ${branch_labels}
depends_on: str | None = ${depends_on}


def upgrade() -> None:
    ${upgrades if upgrades else "pass"}


def downgrade() -> None:
    ${downgrades if downgrades else "pass"}