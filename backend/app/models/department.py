from sqlalchemy import DateTime, Enum, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    parent_department_id: Mapped[int | None] = mapped_column(ForeignKey("departments.id"), nullable=True)
    department_head_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    status: Mapped[str] = mapped_column(
        Enum("Active", "Inactive", name="activestatus"),
        nullable=False,
    )
    created_at: Mapped[object] = mapped_column(DateTime, server_default=func.now(), nullable=False)