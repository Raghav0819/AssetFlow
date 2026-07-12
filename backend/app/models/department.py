from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    parent_department_id: Mapped[str | None] = mapped_column(ForeignKey("departments.id"), nullable=True)
    department_head_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="Active")
    created_at: Mapped[object] = mapped_column(DateTime(timezone=True), server_default=func.now())