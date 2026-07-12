from sqlalchemy import Date, DateTime, Enum, ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Allocation(Base):
    __tablename__ = "allocations"

    id: Mapped[int] = mapped_column(primary_key=True)
    asset_id: Mapped[int] = mapped_column(ForeignKey("assets.id"), nullable=False)
    held_by_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    held_by_department_id: Mapped[int | None] = mapped_column(ForeignKey("departments.id"), nullable=True)
    allocated_at: Mapped[object] = mapped_column(DateTime, server_default=func.now(), nullable=False)
    expected_return_date: Mapped[object | None] = mapped_column(Date, nullable=True)
    returned_at: Mapped[object | None] = mapped_column(DateTime, nullable=True)
    condition_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        Enum("Active", "Returned", name="allocationstatus"),
        nullable=False,
    )
