"""Demo seed data — seeded into Postgres on startup, with in-memory token store for
quick demo auth (no Firebase needed during hackathon dev).

NOTE: The actual DB has Integer primary keys and no password_hash column.
Auth tokens are stored in-memory; the seed script authenticates via a simple
demo password checked in Python (not stored in Postgres)."""

from __future__ import annotations

import json as _json
import logging
from uuid import uuid4

from sqlalchemy import text

from app.core.config import settings
from app.core.security import create_token, hash_password, verify_password
from app.db.session import async_session_maker

logger = logging.getLogger(__name__)

# ── In-memory stores ────────────────────────────────────────────────────────
_users_by_token: dict[str, dict] = {}
_demo_password_hash: str = hash_password(settings.demo_password)

# ── Fixed seed data ─────────────────────────────────────────────────────────
DEMO_USERS = [
    {"firebase_uid": "firebase-admin-uid", "name": "Admin User", "email": "admin@assetflow.demo", "role": "Admin", "status": "Active"},
    {"firebase_uid": "firebase-manager-uid", "name": "Asset Manager", "email": "manager@assetflow.demo", "role": "AssetManager", "status": "Active"},
    {"firebase_uid": "firebase-depthead-uid", "name": "Dept Head", "email": "depthead@assetflow.demo", "role": "DeptHead", "status": "Active"},
    {"firebase_uid": "firebase-employee-uid", "name": "Employee User", "email": "employee@assetflow.demo", "role": "Employee", "status": "Active"},
]

DEMO_DEPARTMENTS = [
    {"name": "Finance", "status": "Active"},
    {"name": "IT", "status": "Active"},
]

DEMO_CATEGORIES = [
    {"name": "Laptops", "custom_fields_schema": [{"name": "warranty_period", "type": "text"}]},
    {"name": "Monitors", "custom_fields_schema": [{"name": "size_inches", "type": "number"}]},
]

DEMO_ASSETS = [
    {"asset_tag": "LAP-001", "name": "MacBook Pro 14\"", "serial_number": "SN-MBP14-001", "condition": "Good", "location": "Building A", "is_bookable": False, "status": "Available"},
    {"asset_tag": "LAP-002", "name": "ThinkPad X1 Carbon", "serial_number": "SN-TPX1-001", "condition": "Good", "location": "Building B", "is_bookable": False, "status": "Available"},
    {"asset_tag": "MON-001", "name": "Dell U2723QE 27\" 4K", "serial_number": "SN-DU27-001", "condition": "Good", "location": "Building A", "is_bookable": True, "status": "Available"},
]


# ── Seed Postgres on startup ────────────────────────────────────────────────
async def seed_demo_data_to_db() -> None:
    """Insert demo departments, categories, users, and assets if they don't exist.
    Uses ON CONFLICT / check-before-insert so this is safe on every startup."""

    async with async_session_maker() as session:
        logger.info("Ensuring demo seed data exists in Postgres …")

        # Departments
        for dept in DEMO_DEPARTMENTS:
            existing = await session.execute(text("SELECT id FROM departments WHERE name = :name"), {"name": dept["name"]})
            if existing.scalar() is None:
                await session.execute(
                    text("INSERT INTO departments (name, status) VALUES (:name, :status)"),
                    dept,
                )

        # Categories
        for cat in DEMO_CATEGORIES:
            existing = await session.execute(text("SELECT id FROM asset_categories WHERE name = :name"), {"name": cat["name"]})
            if existing.scalar() is None:
                await session.execute(
                    text("INSERT INTO asset_categories (name, custom_fields_schema) VALUES (:name, CAST(:schema AS jsonb))"),
                    {"name": cat["name"], "schema": _json.dumps(cat["custom_fields_schema"])},
                )

        # Users
        for user in DEMO_USERS:
            existing = await session.execute(text("SELECT id FROM users WHERE email = :email"), {"email": user["email"]})
            if existing.scalar() is None:
                await session.execute(
                    text(
                        "INSERT INTO users (firebase_uid, name, email, role, status) "
                        "VALUES (:firebase_uid, :name, :email, :role, :status)"
                    ),
                    user,
                )

        # Assets — link to first category (Laptops)
        cat_row = await session.execute(text("SELECT id FROM asset_categories WHERE name = 'Laptops'"))
        laptops_id = cat_row.scalar()
        cat_row2 = await session.execute(text("SELECT id FROM asset_categories WHERE name = 'Monitors'"))
        monitors_id = cat_row2.scalar()

        for asset in DEMO_ASSETS:
            existing = await session.execute(text("SELECT id FROM assets WHERE asset_tag = :tag"), {"tag": asset["asset_tag"]})
            if existing.scalar() is None:
                cat_id = monitors_id if asset["asset_tag"].startswith("MON") else laptops_id
                await session.execute(
                    text(
                        "INSERT INTO assets (asset_tag, name, category_id, serial_number, condition, location, is_bookable, status) "
                        "VALUES (:asset_tag, :name, :category_id, :serial_number, :condition, :location, :is_bookable, :status)"
                    ),
                    {**asset, "category_id": cat_id},
                )

        await session.commit()
        logger.info("Demo seed data ensured.")

        # Populate in-memory token store
        await _load_users_to_token_store(session)


async def _load_users_to_token_store(session) -> None:
    """Pre-create tokens for all users so sandbox login works immediately."""
    result = await session.execute(text("SELECT id, firebase_uid, name, email, role, department_id, status FROM users"))
    for row in result.mappings():
        user_dict = dict(row)
        token = create_token()
        _users_by_token[token] = user_dict


# ── Auth helpers ─────────────────────────────────────────────────────────────

def get_user_by_token(token: str) -> dict | None:
    return _users_by_token.get(token)


async def login_user(email: str, password: str) -> tuple[str, dict] | None:
    """Authenticate: verify demo password in Python, lookup user in Postgres."""
    if not verify_password(password, _demo_password_hash):
        return None

    async with async_session_maker() as session:
        result = await session.execute(
            text("SELECT id, firebase_uid, name, email, role, department_id, status FROM users WHERE LOWER(email) = LOWER(:email)"),
            {"email": email},
        )
        row = result.mappings().first()
        if row is None:
            return None

        user_dict = dict(row)
        token = create_token()
        _users_by_token[token] = user_dict
        return token, user_dict


async def get_user_by_email(email: str) -> dict | None:
    async with async_session_maker() as session:
        result = await session.execute(
            text("SELECT id, firebase_uid, name, email, role, department_id, status FROM users WHERE LOWER(email) = LOWER(:email)"),
            {"email": email},
        )
        row = result.mappings().first()
        return dict(row) if row else None


async def create_employee_profile(name: str, email: str, password: str, department_id: int | None) -> dict:
    """Create a new Employee user in Postgres (no password stored in DB)."""
    async with async_session_maker() as session:
        existing = await session.execute(
            text("SELECT id FROM users WHERE LOWER(email) = LOWER(:email)"),
            {"email": email},
        )
        if existing.scalar() is not None:
            raise ValueError("Email already exists")

        firebase_uid = f"firebase-{create_token()}"
        result = await session.execute(
            text(
                "INSERT INTO users (firebase_uid, name, email, role, department_id, status) "
                "VALUES (:firebase_uid, :name, :email, 'Employee', :department_id, 'Active') RETURNING id"
            ),
            {"firebase_uid": firebase_uid, "name": name, "email": email, "department_id": department_id},
        )
        user_id = result.scalar()
        await session.commit()

        return {"id": user_id, "name": name, "email": email, "role": "Employee", "status": "Active"}


# ── Department helpers ───────────────────────────────────────────────────────

async def list_departments() -> list[dict]:
    async with async_session_maker() as session:
        result = await session.execute(
            text("SELECT id, name, parent_department_id, department_head_id, status FROM departments ORDER BY name")
        )
        return [dict(row) for row in result.mappings()]


async def create_department(name: str, parent_department_id: int | None, department_head_id: int | None, status: str) -> dict:
    async with async_session_maker() as session:
        result = await session.execute(
            text(
                "INSERT INTO departments (name, parent_department_id, department_head_id, status) "
                "VALUES (:name, :parent_department_id, :department_head_id, :status) RETURNING id"
            ),
            {"name": name, "parent_department_id": parent_department_id, "department_head_id": department_head_id, "status": status},
        )
        dept_id = result.scalar()
        await session.commit()
        return {"id": dept_id, "name": name, "parent_department_id": parent_department_id, "department_head_id": department_head_id, "status": status}


# ── Category helpers ─────────────────────────────────────────────────────────

async def list_categories() -> list[dict]:
    async with async_session_maker() as session:
        result = await session.execute(
            text("SELECT id, name, custom_fields_schema FROM asset_categories ORDER BY name")
        )
        return [dict(row) for row in result.mappings()]


async def create_category(name: str, custom_fields_schema: list[dict[str, str]]) -> dict:
    async with async_session_maker() as session:
        result = await session.execute(
            text(
                "INSERT INTO asset_categories (name, custom_fields_schema) "
                "VALUES (:name, CAST(:schema AS jsonb)) RETURNING id"
            ),
            {"name": name, "schema": _json.dumps(custom_fields_schema)},
        )
        cat_id = result.scalar()
        await session.commit()
        return {"id": cat_id, "name": name, "custom_fields_schema": custom_fields_schema}


# ── Employee helpers ─────────────────────────────────────────────────────────

async def list_employees() -> list[dict]:
    async with async_session_maker() as session:
        result = await session.execute(
            text("SELECT id, firebase_uid, name, email, role, status, department_id FROM users ORDER BY name")
        )
        return [dict(row) for row in result.mappings()]


async def update_employee_role(employee_id: int, role: str) -> dict | None:
    async with async_session_maker() as session:
        result = await session.execute(
            text("SELECT id, firebase_uid, name, email, role, status, department_id FROM users WHERE id = :id"),
            {"id": employee_id},
        )
        row = result.mappings().first()
        if row is None:
            return None

        await session.execute(text("UPDATE users SET role = :role WHERE id = :id"), {"role": role, "id": employee_id})
        await session.commit()

        updated = dict(row)
        updated["role"] = role

        # Sync token store
        for user in _users_by_token.values():
            if user["id"] == employee_id:
                user["role"] = role

        return updated
