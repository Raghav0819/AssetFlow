from sqlalchemy import text
from sqlalchemy.ext.asyncio import async_sessionmaker

from app.db.base import Base
from app.db.session import engine


async def create_tables() -> None:
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
        # Base.metadata.create_all only creates missing tables, it never alters
        # existing ones — so columns added to a model after the table already
        # exists in Postgres need an explicit idempotent ALTER here.
        await connection.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)"))