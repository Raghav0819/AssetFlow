from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    email: str
    password: str = Field(min_length=1)


class SignupRequest(BaseModel):
    name: str = Field(min_length=1)
    email: str
    password: str = Field(min_length=8)
    department_id: str | None = None


class AuthResponse(BaseModel):
    access_token: str
    role: str
    name: str


class PublicUserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    status: str


class CurrentUserResponse(PublicUserResponse):
    firebase_uid: str
    department_id: str | None = None
