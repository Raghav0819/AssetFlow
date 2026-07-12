from sqlalchemy import DateTime, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Category(Base):
    __tablename__ = "asset_categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    custom_fields_schema: Mapped[object] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[object] = mapped_column(DateTime, server_default=func.now(), nullable=False)