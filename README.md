# AssetFlow

**AI-Powered Enterprise Asset & Resource Management System**

Track, allocate, maintain, audit, and analyze all physical assets from one centralized platform.

## Project Structure

```
AssetFlow/
├── frontend/          → Next.js 16 · TypeScript · Tailwind CSS
│   ├── src/
│   │   ├── app/       → Pages & layouts (App Router)
│   │   ├── components/→ Reusable UI components
│   │   ├── contexts/  → React contexts (Auth, etc.)
│   │   └── lib/       → Utilities, Firebase config, roles
│   ├── public/        → Static assets
│   └── package.json
│
├── backend/           → FastAPI · Python · PostgreSQL (coming soon)
│
├── .gitignore
└── README.md          ← you are here
```

## Quick Start

### Frontend

```bash
cd frontend
npm install
npm run dev            # → http://localhost:3000
```

### Backend (when ready)

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload  # → http://localhost:8000
```

## Team

| Name   | Area     |
|--------|----------|
| Shrey  |          |
| Raghav | Frontend |
| Ashish |          |

## Tech Stack

| Layer    | Stack                                  |
|----------|----------------------------------------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS, Framer Motion |
| Backend  | FastAPI, Python                        |
| Database | PostgreSQL                             |
| Auth     | Firebase (Email + Google OAuth)        |
| Storage  | Cloudinary / Supabase Storage          |
