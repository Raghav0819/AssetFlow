from sqlalchemy import DateTime, Enum, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(primary_key=True)
    resource_asset_id: Mapped[int] = mapped_column(ForeignKey("assets.id"), nullable=False)
    booked_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    start_time: Mapped[object] = mapped_column(DateTime, nullable=False)
    end_time: Mapped[object] = mapped_column(DateTime, nullable=False)
    status: Mapped[str] = mapped_column(
        Enum("Upcoming", "Ongoing", "Completed", "Cancelled", name="bookingstatus"),
        nullable=False,
    )
    created_at: Mapped[object] = mapped_column(DateTime, server_default=func.now(), nullable=False)
