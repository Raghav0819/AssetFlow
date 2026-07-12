from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.categories import router as categories_router
from app.api.departments import router as departments_router
from app.api.auth import router as auth_router
from app.api.employees import router as employees_router
from app.api.dashboard import router as dashboard_router
from app.core.config import settings
from app.db.init_db import create_tables
from app.db.seed import seed_demo_data_to_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup (idempotent)
    await create_tables()
    # Seed demo users, departments, categories into Postgres
    await seed_demo_data_to_db()
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)

# CORS — allow React frontend (dev and production origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix=settings.api_prefix)
app.include_router(departments_router, prefix=settings.api_prefix)
app.include_router(categories_router, prefix=settings.api_prefix)
app.include_router(employees_router, prefix=settings.api_prefix)
app.include_router(dashboard_router, prefix=settings.api_prefix)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
