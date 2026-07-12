from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import get_current_user
from app.db.seed import create_employee_profile, get_user_by_email, login_user
from app.schemas.auth import AuthResponse, CurrentUserResponse, LoginRequest, PublicUserResponse, SignupRequest

router = APIRouter(tags=["auth"])


@router.post("/auth/signup", response_model=PublicUserResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: SignupRequest) -> dict:
    try:
        return await create_employee_profile(payload.name, payload.email, payload.password, payload.department_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.post("/auth/login", response_model=AuthResponse)
async def login(payload: LoginRequest) -> dict:
    result = await login_user(payload.email, payload.password)
    if result is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token, user = result
    return {"access_token": token, "role": user["role"], "name": user["name"]}


@router.get("/me", response_model=CurrentUserResponse)
def me(user: dict = Depends(get_current_user)) -> dict:
    return user


@router.get("/auth/demo/{email}", response_model=PublicUserResponse)
async def get_demo_user(email: str) -> dict:
    user = await get_user_by_email(email)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "status": user["status"],
    }
