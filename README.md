# Ayush HMS — Hospital Management System

A lightweight, minimalist Hospital Management System focused on simplicity, speed, and ease of use for hospital receptionists and administrators.

## Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Python + FastAPI + SQLAlchemy 2.x + PostgreSQL
- **Database**: PostgreSQL 18 (local dev) / Supabase Free (production)

## Features (MVP)

- **OPD Module**: Phone number lookup, patient registration, consultation creation, A5 print slip
- **Reports Module**: Daily revenue, patient footfall, doctor-wise summaries
- **IPD Module**: Placeholder — coming soon

## Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- PostgreSQL 14+

## Local Development Setup

### 1. Database

```bash
# Start PostgreSQL (if not running)
sudo systemctl start postgresql

# Create the database
createdb ayush_hms
```

### 2. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Configure .env (copy from .env.example)
cp .env.example .env

# Run server (auto-creates tables on startup)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

API documentation is available at http://localhost:8000/docs

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The frontend will be available at http://localhost:5173

## API Endpoints

All endpoints are under `/api/v1`.

### Patients
- `GET /api/v1/patients/search?phone=...` — Find patients by phone
- `POST /api/v1/patients` — Register new patient
- `GET /api/v1/patients/{id}` — Get patient details
- `GET /api/v1/patients/{id}/consultations` — Consultation history

### Consultations
- `POST /api/v1/consultations` — Create consultation
- `GET /api/v1/consultations/{id}` — Get consultation details
- `GET /api/v1/consultations/{id}/status` — Check validity

### Doctors
- `GET /api/v1/doctors` — List active doctors
- `POST /api/v1/doctors` — Create doctor (admin)

### Reports
- `GET /api/v1/reports/revenue?start_date=...&end_date=...`
- `GET /api/v1/reports/footfall?start_date=...&end_date=...`
- `GET /api/v1/reports/doctor-summary?start_date=...&end_date=...`

## Deployment

### Frontend: Netlify Free
```bash
cd frontend
npm run build  # Outputs to dist/
```
Configure environment variable `VITE_API_BASE_URL` pointing to the backend.

### Backend: Render Free
```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Database: Supabase Free
Create a PostgreSQL project and configure the database URL in backend env vars.

## Environment Variables

### Backend (`backend/.env`)
```
DATABASE_URL=postgresql://user:password@host:port/ayush_hms
CORS_ORIGINS=http://localhost:5173,https://your-netlify-domain.netlify.app
ENVIRONMENT=development
TIMEZONE=Asia/Kolkata
```

### Frontend (`frontend/.env`)
```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## Project Structure

```
ayush-hms/
├── frontend/          # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/# Reusable UI components
│   │   ├── pages/     # Page components
│   │   ├── services/  # API client
│   │   ├── types/     # TypeScript types
│   │   └── styles/    # CSS (Tailwind + print)
├── backend/           # FastAPI + SQLAlchemy
│   ├── app/
│   │   ├── api/v1/    # Route handlers
│   │   ├── models/    # SQLAlchemy ORM models
│   │   ├── schemas/   # Pydantic models
│   │   ├── services/  # Business logic
│   │   └── core/      # Config, database
│   ├── alembic/       # DB migrations
│   └── alembic.ini
└── README.md
```

## License

MIT