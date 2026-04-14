# ITSM KPI Dashboard

This project is a React + Django ITSM dashboard. It now supports PostgreSQL for local development and for a cleaner DevOps handoff.

## Stack

- Frontend: React + Vite
- Backend: Django + Django REST Framework
- Auth: JWT
- Database: PostgreSQL via Docker Compose

## Run With PostgreSQL

1. Create a local env file from [.env.example](C:/Users/wael/kpis-itsm-dashboards/.env.example):

```powershell
Copy-Item .env.example .env
```

2. Start the full stack:

```powershell
docker compose up -d --build
```

3. Open the app:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8001`
- PostgreSQL: `localhost:5433`

The backend container automatically runs migrations before starting Django.

## Environment Variables

- `DB_ENGINE=postgres` to use PostgreSQL
- `DB_ENGINE=sqlite` to temporarily use SQLite
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT`
- `POSTGRES_EXPOSE_PORT` for the host-side port, default `5433`
- `OPENAI_API_KEY` for the AI dashboard builder

## Move Existing Data From SQLite To PostgreSQL

The safest app-level migration path here is Django fixtures.

1. Export data from the old SQLite database:

```powershell
docker compose run --rm -e DB_ENGINE=sqlite -e SQLITE_PATH=/app/db.sqlite3 backend python manage.py dumpdata itsm_data auth.User --indent 2 > data-export.json
```

2. Start PostgreSQL normally:

```powershell
docker compose up -d postgres backend
```

3. Load the exported data into PostgreSQL:

```powershell
Get-Content .\data-export.json | docker compose exec -T backend python manage.py loaddata -
```

4. Verify the migration:

```powershell
docker compose exec backend python manage.py shell -c "from itsm_data.models import Incident, Request, Change; print(Incident.objects.count(), Request.objects.count(), Change.objects.count())"
```

There is also a direct migration helper for this repository:

```powershell
docker compose exec backend python scripts/import_sqlite_to_current_db.py
```

## Seed Demo Data

The seed script is now database-agnostic and works with the currently configured database:

```powershell
docker compose exec backend python scripts/seed_realistic_demo_data.py
```

## DevOps Handoff

For DevOps, the minimum clean handoff is:

- Keep secrets in environment variables or a secret manager, not in git
- Set `DEBUG=False` in production
- Replace Django dev server with Gunicorn or Uvicorn
- Put Nginx or a reverse proxy in front of frontend/backend
- Restrict `ALLOWED_HOSTS` and CORS
- Use a managed PostgreSQL instance or a persistent PostgreSQL volume
- Add CI steps for `python manage.py migrate`, tests, and frontend build
- Add automated backups for PostgreSQL

## Current Docker Services

- `frontend`: Vite dev server
- `backend`: Django app
- `postgres`: PostgreSQL 16 with persistent Docker volume
