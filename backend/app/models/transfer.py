from sqlalchemy import DateTime, Enum, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class TransferRequest(Base):
    __tablename__ = "transfer_requests"

    id: Mapped[int] = mapped_column(primary_key=True)
    asset_id: Mapped[int] = mapped_column(ForeignKey("assets.id"), nullable=False)
    requested_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    current_holder_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    requested_to: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    status: Mapped[str] = mapped_column(
        Enum("Requested", "Approved", "Rejected", name="transferstatus"),
        nullable=False,
    )
    created_at: Mapped[object] = mapped_column(DateTime, server_default=func.now(), nullable=False)
