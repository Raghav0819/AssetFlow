from sqlalchemy.ext.asyncio import async_sessionmaker

from app.db.base import Base
from app.db.session import engine


async def create_tables() -> None:
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)