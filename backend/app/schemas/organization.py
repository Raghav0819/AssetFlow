from pydantic import BaseModel, Field


class DepartmentCreateRequest(BaseModel):
    name: str = Field(min_length=1)
    parent_department_id: int | None = None
    department_head_id: int | None = None
    status: str = Field(default="Active")


class DepartmentResponse(BaseModel):
    id: int
    name: str
    parent_department_id: int | None = None
    department_head_id: int | None = None
    status: str


class CategoryCreateRequest(BaseModel):
    name: str = Field(min_length=1)
    custom_fields_schema: list[dict[str, str]] = Field(default_factory=list)


class CategoryResponse(BaseModel):
    id: int
    name: str
    custom_fields_schema: list[dict[str, str]] | None = None


class EmployeeResponse(BaseModel):
    id: int
    firebase_uid: str
    name: str
    email: str
    role: str
    status: str
    department_id: int | None = None


class EmployeeRoleUpdateRequest(BaseModel):
    role: str = Field(min_length=1)