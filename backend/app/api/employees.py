from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import require_role
from app.db.seed import list_employees, update_employee_role
from app.schemas.organization import EmployeeResponse, EmployeeRoleUpdateRequest

router = APIRouter(tags=["employees"])


@router.get("/employees", response_model=list[EmployeeResponse], dependencies=[Depends(require_role("Admin"))])
async def get_employees() -> list[dict]:
    return await list_employees()


@router.patch(
    "/employees/{employee_id}/role",
    response_model=EmployeeResponse,
    dependencies=[Depends(require_role("Admin"))],
)
async def patch_employee_role(employee_id: str, payload: EmployeeRoleUpdateRequest) -> dict:
    updated = await update_employee_role(employee_id, payload.role)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    return updated