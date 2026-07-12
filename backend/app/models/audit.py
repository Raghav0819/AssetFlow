from sqlalchemy import Column, Date, DateTime, Enum, ForeignKey, Integer, String, Text, Table, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


# Many-to-many association table
audit_cycle_auditors = Table(
    "audit_cycle_auditors",
    Base.metadata,
    Column("audit_cycle_id", Integer, ForeignKey("audit_cycles.id"), primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
)


class AuditCycle(Base):
    __tablename__ = "audit_cycles"

    id: Mapped[int] = mapped_column(primary_key=True)
    scope_department_id: Mapped[int | None] = mapped_column(ForeignKey("departments.id"), nullable=True)
    scope_location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    start_date: Mapped[object] = mapped_column(Date, nullable=False)
    end_date: Mapped[object] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(
        Enum("Planned", "Active", "Closed", name="auditcyclestatus"),
        nullable=False,
    )
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    created_at: Mapped[object] = mapped_column(DateTime, server_default=func.now(), nullable=False)


class AuditItem(Base):
    __tablename__ = "audit_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    audit_cycle_id: Mapped[int] = mapped_column(ForeignKey("audit_cycles.id"), nullable=False)
    asset_id: Mapped[int] = mapped_column(ForeignKey("assets.id"), nullable=False)
    result: Mapped[str] = mapped_column(
        Enum("Pending", "Verified", "Missing", "Damaged", name="audititemresult"),
        nullable=False,
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    marked_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    marked_at: Mapped[object | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[object] = mapped_column(DateTime, server_default=func.now(), nullable=False)
