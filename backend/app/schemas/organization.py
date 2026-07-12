from pydantic import BaseModel, Field


class DepartmentCreateRequest(BaseModel):
    name: str = Field(min_length=1)
    parent_department_id: str | None = None
    department_head_id: str | None = None
    status: str = Field(default="Active")


class DepartmentResponse(BaseModel):
    id: str
    name: str
    parent_department_id: str | None = None
    department_head_id: str | None = None
    status: str


class CategoryCreateRequest(BaseModel):
    name: str = Field(min_length=1)
    custom_fields_schema: list[dict[str, str]] = Field(default_factory=list)


class CategoryResponse(BaseModel):
    id: str
    name: str
    custom_fields_schema: list[dict[str, str]]


class EmployeeResponse(BaseModel):
    id: str
    firebase_uid: str
    name: str
    email: str
    role: str
    status: str
    department_id: str | None = None


class EmployeeRoleUpdateRequest(BaseModel):
    role: str = Field(min_length=1)