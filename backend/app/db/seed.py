"""Demo seed data — seeded into Postgres on startup, with in-memory token store for
quick demo auth (no Firebase needed during hackathon dev)."""

from __future__ import annotations

import logging
from uuid import uuid4

from sqlalchemy import select, text

from app.core.security import create_token, hash_password, verify_password
from app.db.session import async_session_maker

logger = logging.getLogger(__name__)

# ── In-memory token store (maps token → user-dict) ──────────────────────────
_users_by_token: dict[str, dict] = {}

# ── Fixed IDs for demo data ─────────────────────────────────────────────────
DEMO_USERS = [
    {
        "id": "2ac18d2a-3f14-4d9e-9a34-f8d3a2d3b7a0",
        "firebase_uid": "firebase-admin-uid",
        "name": "Admin User",
        "email": "admin@assetflow.demo",
        "role": "Admin",
        "status": "Active",
        "department_id": None,
    },
    {
        "id": "34df0c7f-8e7d-4b46-b89e-7a8c9e1f0a2d",
        "firebase_uid": "firebase-manager-uid",
        "name": "Asset Manager",
        "email": "manager@assetflow.demo",
        "role": "AssetManager",
        "status": "Active",
        "department_id": None,
    },
    {
        "id": "5d6e7f80-1a2b-4c3d-9e0f-1234567890ab",
        "firebase_uid": "firebase-depthead-uid",
        "name": "Dept Head",
        "email": "depthead@assetflow.demo",
        "role": "DeptHead",
        "status": "Active",
        "department_id": None,
    },
    {
        "id": "6f7e8d9c-0b1a-4c2d-9e0f-abcdef123456",
        "firebase_uid": "firebase-employee-uid",
        "name": "Employee User",
        "email": "employee@assetflow.demo",
        "role": "Employee",
        "status": "Active",
        "department_id": None,
    },
]

DEMO_DEPARTMENTS = [
    {
        "id": "1f0a7e7a-2e8e-4f1f-8d1a-5c78a2e0f2b1",
        "name": "Finance",
        "parent_department_id": None,
        "department_head_id": None,
        "status": "Active",
    },
    {
        "id": "5c7b31ce-60be-4d7d-9f0e-4b1a0fcbf9ac",
        "name": "IT",
        "parent_department_id": None,
        "department_head_id": None,
        "status": "Active",
    },
]

DEMO_CATEGORIES = [
    {
        "id": "5ddc6e1d-6f79-4b8c-9f5e-4a6ff7cb2ac1",
        "name": "Laptops",
        "custom_fields_schema": [{"name": "warranty_period", "type": "text"}],
    },
]

DEMO_PASSWORD = "Demo@1234"


# ── Seed Postgres on startup ────────────────────────────────────────────────
async def seed_demo_data_to_db() -> None:
    """Insert demo departments, categories, and users if they don't exist yet.
    Uses ON CONFLICT DO NOTHING so this is safe to run on every startup."""
    import json as _json

    async with async_session_maker() as session:
        logger.info("Ensuring demo seed data exists in Postgres …")

        # Departments first (no FK deps)
        for dept in DEMO_DEPARTMENTS:
            await session.execute(
                text(
                    "INSERT INTO departments (id, name, parent_department_id, department_head_id, status) "
                    "VALUES (:id, :name, :parent_department_id, :department_head_id, :status) "
                    "ON CONFLICT (id) DO NOTHING"
                ),
                dept,
            )

        # Categories
        for cat in DEMO_CATEGORIES:
            await session.execute(
                text(
                    "INSERT INTO asset_categories (id, name, custom_fields_schema) "
                    "VALUES (:id, :name, CAST(:custom_fields_schema AS jsonb)) "
                    "ON CONFLICT (id) DO NOTHING"
                ),
                {**cat, "custom_fields_schema": _json.dumps(cat["custom_fields_schema"])},
            )

        # Users
        pw_hash = hash_password(DEMO_PASSWORD)
        for user in DEMO_USERS:
            await session.execute(
                text(
                    "INSERT INTO users (id, firebase_uid, name, email, role, department_id, status, password_hash) "
                    "VALUES (:id, :firebase_uid, :name, :email, :role, :department_id, :status, :password_hash) "
                    "ON CONFLICT (id) DO NOTHING"
                ),
                {**user, "password_hash": pw_hash},
            )

        await session.commit()
        logger.info("Demo seed data ensured.")

        # Populate token store
        await _load_users_to_token_store(session)


async def _load_users_to_token_store(session) -> None:
    """Pre-create tokens for demo users so sandbox login works immediately."""
    result = await session.execute(text("SELECT id, firebase_uid, name, email, role, department_id, status FROM users"))
    for row in result.mappings():
        user_dict = dict(row)
        token = create_token()
        _users_by_token[token] = user_dict


# ── Auth helpers (used by deps.py / API routes) ─────────────────────────────

def get_user_by_token(token: str) -> dict | None:
    return _users_by_token.get(token)


async def login_user(email: str, password: str) -> tuple[str, dict] | None:
    """Authenticate against Postgres, return (token, user_dict) or None."""
    async with async_session_maker() as session:
        result = await session.execute(
            text("SELECT id, firebase_uid, name, email, role, department_id, status, password_hash FROM users WHERE LOWER(email) = LOWER(:email)"),
            {"email": email},
        )
        row = result.mappings().first()
        if row is None or not verify_password(password, row["password_hash"]):
            return None

        user_dict = {k: row[k] for k in ("id", "firebase_uid", "name", "email", "role", "department_id", "status")}
        token = create_token()
        _users_by_token[token] = user_dict
        return token, user_dict


async def get_user_by_email(email: str) -> dict | None:
    """Lookup user by email from Postgres."""
    async with async_session_maker() as session:
        result = await session.execute(
            text("SELECT id, firebase_uid, name, email, role, department_id, status FROM users WHERE LOWER(email) = LOWER(:email)"),
            {"email": email},
        )
        row = result.mappings().first()
        return dict(row) if row else None


async def create_employee_profile(name: str, email: str, password: str, department_id: str | None) -> dict:
    """Create a new Employee user in Postgres."""
    async with async_session_maker() as session:
        # Check duplicate
        existing = await session.execute(
            text("SELECT id FROM users WHERE LOWER(email) = LOWER(:email)"),
            {"email": email},
        )
        if existing.scalar() is not None:
            raise ValueError("Email already exists")

        user_id = str(uuid4())
        firebase_uid = f"firebase-{create_token()}"
        pw_hash = hash_password(password)

        await session.execute(
            text(
                "INSERT INTO users (id, firebase_uid, name, email, role, department_id, status, password_hash) "
                "VALUES (:id, :firebase_uid, :name, :email, 'Employee', :department_id, 'Active', :password_hash)"
            ),
            {
                "id": user_id,
                "firebase_uid": firebase_uid,
                "name": name,
                "email": email,
                "department_id": department_id,
                "password_hash": pw_hash,
            },
        )
        await session.commit()

        return {
            "id": user_id,
            "name": name,
            "email": email,
            "role": "Employee",
            "status": "Active",
        }


# ── Department helpers (Postgres-backed) ─────────────────────────────────────

async def list_departments() -> list[dict]:
    async with async_session_maker() as session:
        result = await session.execute(
            text("SELECT id, name, parent_department_id, department_head_id, status FROM departments ORDER BY name")
        )
        return [dict(row) for row in result.mappings()]


async def create_department(
    name: str,
    parent_department_id: str | None,
    department_head_id: str | None,
    status: str,
) -> dict:
    async with async_session_maker() as session:
        dept_id = str(uuid4())
        await session.execute(
            text(
                "INSERT INTO departments (id, name, parent_department_id, department_head_id, status) "
                "VALUES (:id, :name, :parent_department_id, :department_head_id, :status)"
            ),
            {
                "id": dept_id,
                "name": name,
                "parent_department_id": parent_department_id,
                "department_head_id": department_head_id,
                "status": status,
            },
        )
        await session.commit()
        return {
            "id": dept_id,
            "name": name,
            "parent_department_id": parent_department_id,
            "department_head_id": department_head_id,
            "status": status,
        }


# ── Category helpers (Postgres-backed) ───────────────────────────────────────

async def list_categories() -> list[dict]:
    async with async_session_maker() as session:
        result = await session.execute(
            text("SELECT id, name, custom_fields_schema FROM asset_categories ORDER BY name")
        )
        return [dict(row) for row in result.mappings()]


async def create_category(name: str, custom_fields_schema: list[dict[str, str]]) -> dict:
    import json
    async with async_session_maker() as session:
        cat_id = str(uuid4())
        await session.execute(
            text(
                "INSERT INTO asset_categories (id, name, custom_fields_schema) "
                "VALUES (:id, :name, CAST(:custom_fields_schema AS jsonb))"
            ),
            {
                "id": cat_id,
                "name": name,
                "custom_fields_schema": json.dumps(custom_fields_schema),
            },
        )
        await session.commit()
        return {
            "id": cat_id,
            "name": name,
            "custom_fields_schema": custom_fields_schema,
        }


# ── Employee helpers (Postgres-backed) ───────────────────────────────────────

async def list_employees() -> list[dict]:
    async with async_session_maker() as session:
        result = await session.execute(
            text("SELECT id, firebase_uid, name, email, role, status, department_id FROM users ORDER BY name")
        )
        return [dict(row) for row in result.mappings()]


async def update_employee_role(employee_id: str, role: str) -> dict | None:
    async with async_session_maker() as session:
        result = await session.execute(
            text("SELECT id, firebase_uid, name, email, role, status, department_id FROM users WHERE id = :id"),
            {"id": employee_id},
        )
        row = result.mappings().first()
        if row is None:
            return None

        await session.execute(
            text("UPDATE users SET role = :role WHERE id = :id"),
            {"role": role, "id": employee_id},
        )
        await session.commit()

        updated = dict(row)
        updated["role"] = role

        # Update token store too
        for token, user in _users_by_token.items():
            if user["id"] == employee_id:
                user["role"] = role

        return updated
