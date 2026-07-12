"""add users.password_hash

Revision ID: 83c2e74ea64b
Revises: 4c40c9a30248
Create Date: 2026-07-12 17:00:00.000000

"""
from alembic import op


# revision identifiers, used by Alembic.
revision = '83c2e74ea64b'
down_revision = '4c40c9a30248'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # IF NOT EXISTS makes this safe to run against a DB where the app's own
    # startup routine (app/db/init_db.py) already added the column.
    op.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)")


def downgrade() -> None:
    op.execute("ALTER TABLE users DROP COLUMN IF EXISTS password_hash")
