from fastapi import APIRouter, Depends, status

from app.core.deps import require_role
from app.db.seed import create_department, list_departments
from app.schemas.organization import DepartmentCreateRequest, DepartmentResponse

router = APIRouter(tags=["departments"])


@router.get("/departments", response_model=list[DepartmentResponse])
async def get_departments() -> list[dict]:
    return await list_departments()


@router.post(
    "/departments",
    response_model=DepartmentResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Admin"))],
)
async def post_department(payload: DepartmentCreateRequest) -> dict:
    return await create_department(payload.name, payload.parent_department_id, payload.department_head_id, payload.status)