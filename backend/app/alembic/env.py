from __future__ import annotations

import os
from pathlib import Path
from logging.config import fileConfig

from alembic import context
from dotenv import load_dotenv
from sqlalchemy import create_engine, pool
from sqlalchemy.engine import make_url

load_dotenv(Path(__file__).resolve().parents[2] / ".env", override=True)

from app import models  # noqa: F401 - ensure model metadata is registered
from app.db.base import Base

config = context.config
database_url = make_url(os.getenv("ALEMBIC_DATABASE_URL", config.get_main_option("sqlalchemy.url")))

# Strip sslmode from URL query params — we pass it via connect_args instead
# to avoid psycopg2 seeing it both as a DSN param and a keyword arg.
connect_args: dict = {}
url_str = database_url.render_as_string(hide_password=False)
if "sslmode=require" in url_str or "aivencloud.com" in url_str:
    connect_args["sslmode"] = "require"
    # Remove sslmode from the URL query to prevent duplicate-argument errors
    clean_query = {k: v for k, v in database_url.query.items() if k != "sslmode"}
    database_url = database_url.set(query=clean_query)

config.set_main_option("sqlalchemy.url", database_url.render_as_string(hide_password=False))

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata, compare_type=True)

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = create_engine(
        database_url,
        poolclass=pool.NullPool,
        connect_args=connect_args,
    )

    with connectable.connect() as connection:
        do_run_migrations(connection)

    connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()