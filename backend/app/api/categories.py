from fastapi import APIRouter, Depends, status

from app.core.deps import require_role
from app.db.seed import create_category, list_categories
from app.schemas.organization import CategoryCreateRequest, CategoryResponse

router = APIRouter(tags=["categories"])


@router.get("/categories", response_model=list[CategoryResponse])
async def get_categories() -> list[dict]:
    return await list_categories()


@router.post(
    "/categories",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("Admin"))],
)
async def post_category(payload: CategoryCreateRequest) -> dict:
    return await create_category(payload.name, payload.custom_fields_schema)