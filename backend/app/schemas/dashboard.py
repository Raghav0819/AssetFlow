from pydantic import BaseModel


class DashboardSummaryResponse(BaseModel):
    total_assets: int
    available_assets: int
    allocated_assets: int
    bookings_today: int
    overdue_allocations: int