# AssetFlow

**Enterprise Asset & Resource Management System**

Track, allocate, maintain, audit, and analyze physical assets from one centralized platform — built as a full-stack hackathon project (React + FastAPI + PostgreSQL).

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | React 19 (Vite + TypeScript), Tailwind CSS, React Router |
| Backend | FastAPI, SQLAlchemy 2.0 (async), Pydantic v2, Alembic |
| Database | PostgreSQL (tested against [Aiven](https://aiven.io/) managed Postgres; any Postgres 14+ works) |
| Auth | Lightweight built-in email/password auth (per-user hashed passwords in Postgres). Optional real Firebase Authentication if you configure a Firebase project — falls back to a safe local mock automatically if you don't. |

## Project Structure

```
AssetFlow/
├── backend/
│   ├── app/
│   │   ├── main.py           → FastAPI app entrypoint
│   │   ├── core/              → config, security, auth dependencies
│   │   ├── db/                → session, table creation, demo seed data
│   │   ├── models/             → SQLAlchemy models
│   │   ├── schemas/           → Pydantic request/response schemas
│   │   ├── api/                → route handlers (auth, departments, categories, employees, dashboard)
│   │   └── alembic/           → migrations
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/client.ts      → API client (talks to backend, falls back to local mock data for screens without a backend route yet)
│   │   ├── auth/               → auth context/provider
│   │   ├── firebase/           → Firebase config (mock-auth fallback if unconfigured)
│   │   ├── components/
│   │   └── pages/              → Dashboard, Org Setup, Assets, Allocation, Booking, Maintenance, Audit, Reports, Notifications
│   └── .env.example
├── docs/API_CONTRACT.md
└── README.md
```

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- A **PostgreSQL** database — either a managed instance (e.g. a free [Aiven](https://aiven.io/postgresql) service) or a local Postgres install

## 1. Clone the repo

```bash
git clone https://github.com/Raghav0819/AssetFlow.git
cd AssetFlow
```

## 2. Backend setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create your local env file from the template:

```bash
cp .env.example .env
```

Edit `backend/.env` and set `DATABASE_URL` to your own Postgres connection string, e.g.:

```
DATABASE_URL=postgresql+asyncpg://<user>:<password>@<host>:<port>/<database>?sslmode=require
```

Run the server:

```bash
uvicorn app.main:app --reload --port 8000
```

On startup the app automatically creates all tables and seeds demo data — **no manual migration step is required for a fresh database.** (Alembic migrations exist under `app/alembic/` if you prefer managing schema changes that way instead.)

Backend will be live at **http://localhost:8000** (interactive API docs at `/docs`).

## 3. Frontend setup

In a separate terminal:

```bash
cd frontend
npm install
cp .env.example .env.local
```

`frontend/.env.local` defaults to pointing at `http://localhost:8000/api` — update `VITE_API_BASE_URL` if your backend runs elsewhere. The `VITE_FIREBASE_*` variables are optional; leave them blank to use the built-in mock auth (recommended unless you've set up your own Firebase project).

Run the dev server:

```bash
npm run dev
```

Frontend will be live at **http://localhost:5173**.

## 4. Log in

The backend seeds four demo accounts on first startup, all sharing one password:

| Email | Password | Role |
|---|---|---|
| `admin@assetflow.demo` | `Demo@1234` | Admin |
| `manager@assetflow.demo` | `Demo@1234` | AssetManager |
| `depthead@assetflow.demo` | `Demo@1234` | DeptHead |
| `employee@assetflow.demo` | `Demo@1234` | Employee |

**Admin** unlocks every screen (Org Setup, Reports, Audit, etc.); other roles see a restricted sidebar.

You can also use the **Sign Up** page to create your own account — real name, real password, real Postgres row.

## Notes on current scope

- **Backed by the real database:** Auth (login/signup), Org Setup (Departments/Categories/Employees), and the Dashboard KPI summary.
- **Running on local mock data (browser localStorage):** Assets, Allocation/Transfer, Booking, Maintenance, Audit, Reports, and Notifications — these screens are fully functional in the UI but don't yet have backend routes wired up. See `docs/API_CONTRACT.md` for the intended API surface.

## Security

- Never commit `backend/.env` or `frontend/.env.local` — both are gitignored. Only the `*.env.example` templates (placeholder values only) are tracked.
- If you configure a real Firebase project, keep its config out of any committed file — use `frontend/.env.local` only.

## Team

| Name |
|---|
| Shrey |
| Raghav |
| Ashish |
