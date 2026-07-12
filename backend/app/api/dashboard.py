from fastapi import APIRouter, Depends

from sqlalchemy import text

from app.core.deps import get_current_user
from app.db.session import async_session_maker
from app.schemas.dashboard import DashboardSummaryResponse

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard/summary", response_model=DashboardSummaryResponse, dependencies=[Depends(get_current_user)])
async def summary() -> dict[str, int]:
    """Return live KPI counts from Postgres — no hardcoded values."""
    async with async_session_maker() as session:
        # Total assets
        total = (await session.execute(text("SELECT COUNT(*) FROM assets"))).scalar() if await _table_exists(session, "assets") else 0

        # Available assets
        available = (await session.execute(text("SELECT COUNT(*) FROM assets WHERE status = 'Available'"))).scalar() if await _table_exists(session, "assets") else 0

        # Allocated assets
        allocated = (await session.execute(text("SELECT COUNT(*) FROM assets WHERE status = 'Allocated'"))).scalar() if await _table_exists(session, "assets") else 0

        # Bookings today
        bookings_today = 0
        if await _table_exists(session, "bookings"):
            bookings_today = (await session.execute(
                text("SELECT COUNT(*) FROM bookings WHERE start_time::date = CURRENT_DATE")
            )).scalar() or 0

        # Overdue allocations (active allocations past expected return date)
        overdue = 0
        if await _table_exists(session, "allocations"):
            overdue = (await session.execute(
                text(
                    "SELECT COUNT(*) FROM allocations "
                    "WHERE status = 'Active' AND expected_return_date < CURRENT_DATE"
                )
            )).scalar() or 0

        return {
            "total_assets": total,
            "available_assets": available,
            "allocated_assets": allocated,
            "bookings_today": bookings_today,
            "overdue_allocations": overdue,
        }


async def _table_exists(session, table_name: str) -> bool:
    """Check if a table exists in the database (graceful for tables not yet created by migrations)."""
    result = await session.execute(
        text(
            "SELECT EXISTS (SELECT 1 FROM information_schema.tables "
            "WHERE table_schema = 'public' AND table_name = :name)"
        ),
        {"name": table_name},
    )
    return result.scalar()
