from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict


load_dotenv(override=True)


class Settings(BaseSettings):
    app_name: str = "AssetFlow API"
    api_prefix: str = "/api"
    demo_password: str = "Demo@1234"
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/assetflow"
    alembic_database_url: str | None = None
    database_echo: bool = False
    database_pool_pre_ping: bool = True

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
