from collections.abc import AsyncGenerator
import ssl

from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings


database_url = make_url(settings.database_url)
connect_args: dict[str, object] = {}

if database_url.query.get("sslmode") == "require" or "aivencloud.com" in database_url.host or "aivencloud.com" in database_url.render_as_string(hide_password=False):
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE
    connect_args["ssl"] = ssl_context
    database_url = database_url.set(query={key: value for key, value in database_url.query.items() if key != "sslmode"})


engine = create_async_engine(
    database_url,
    echo=settings.database_echo,
    pool_pre_ping=settings.database_pool_pre_ping,
    connect_args=connect_args,
)

async_session_maker = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session