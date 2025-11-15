# Backend Developer Guide

## Environment Setup
1. Create and activate a virtual environment (Python 3.13+ recommended).
2. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```
3. Copy `.env.example` to `.env` and adjust the values for your database (PostgreSQL in production, SQLite for local experimentation).

> Tip: During tests or when importing the app in an environment that does not or cannot run a DB, set `SKIP_DB_INIT=true` to skip `Base.metadata.create_all(bind=engine)` and the lightweight `run_light_migrations()` performed on app startup.

> For production deployments, use `.env.production.example` as a reference and configure environment variables in your hosting platform / container orchestration (or copy it to `.env`). When using the included Docker Compose, the DB name is `financial_hub` (see docker-compose.yml).

### Docker (optional)
The backend Dockerfile installs dependencies and runs `alembic upgrade head` automatically before launching Uvicorn. You can build it directly:

```powershell
docker build -t financial-hub-backend ./backend
docker run --env-file backend/.env -p 8000:8000 financial-hub-backend
```

When using the root `docker-compose.yml`, the backend, Celery worker, Redis, PostgreSQL, and migrations come online together—no extra configuration required beyond populating `.env`.

## Windows (Local) - Start Scripts
For convenience during local Windows development, a set of batch scripts are included at the repo root:

 - `START-ALL.bat`: Launches the Backend (Uvicorn), Celery worker, and Frontend Vite dev server in separate windows.
 - `start-backend.bat`: Starts the backend server using the repo-level Python venv. The script sets dev env variables (SQLite dev mode, Redis/Celery defaults) and then runs Uvicorn. If you want to skip DB initialization for fast import/testing, set `SKIP_DB_INIT=true`.
 - `start-celery.bat`: Starts a Celery worker for background tasks (requires a running Redis instance).
 - `start-frontend.bat`: Starts the frontend Vite dev server (`npm run dev -- --host`).
- `start-backend.sh` / `start-backend.ps1`: Cross-platform convenience scripts for Linux/macOS and PowerShell respectively. They use the same dev defaults but set `SKIP_DB_INIT=true` by default to avoid expensive DB operations during imports and to speed up iterative development. If you prefer the startup to create tables and run light migrations, set `SKIP_DB_INIT=false` or run `alembic upgrade head` manually.

Use these scripts for easy local development on Windows. They are thin wrappers around existing commands and keep development workflow consistent with Linux/Mac instructions.

## Database Migrations (Alembic)
Alembic is now the source of truth for schema changes.

- Apply migrations:
  ```powershell
  alembic upgrade head
  ```
- Create a new migration after editing SQLAlchemy models:
  ```powershell
  alembic revision --autogenerate -m "describe change"
  alembic upgrade head
  ```

> `alembic/env.py` automatically points to the URL configured via `config.settings.Settings`, so keep your `.env` updated before running commands.

## Materialized Summary View
Revision `20241115_0002` introduces `user_financial_summary_mv`:
- PostgreSQL: created as a materialized view with a unique index on `user_id`.
- SQLite: created as a standard view (auto-updating) to preserve portability.

Whenever transactions are created, updated, or deleted on PostgreSQL, the backend triggers `REFRESH MATERIALIZED VIEW user_financial_summary_mv` so that `/summary` can serve pre-aggregated totals. The summary endpoint automatically falls back to live aggregation when the view or database engine is unavailable.

If you need to refresh manually (e.g., after bulk imports):
```powershell
python -c "from services.summary_refresh import refresh_financial_summary_view; refresh_financial_summary_view()"
```

## Background Jobs (Celery + Redis)
Celery handles non-critical work such as publishing streaming events and refreshing aggregates.

1. Ensure Redis is running locally:
  ```powershell
  docker run --name fh-redis -p 6379:6379 -d redis:7
  ```
2. Install backend dependencies (see above) and export/update `.env` with `REDIS_URL`, `CELERY_BROKER_URL`, and `CELERY_RESULT_BACKEND` if they differ from defaults.
3. Start the Celery worker from the `backend/` directory:
  ```powershell
  celery -A celery_app.celery_app worker --loglevel=info
  ```

The application enqueues tasks defensively—if Celery or Redis are unreachable it falls back to synchronous execution so requests still succeed, but you should keep the worker online in production for optimal throughput.

## Observability (Sentry)
Set `SENTRY_DSN` in your `.env` to enable automatic error and performance monitoring. The FastAPI app and Celery worker both call `telemetry.sentry.init_sentry()`, so once the DSN is present you will see:

- API exceptions and performance traces (`FastApiIntegration`).
- Celery task failures/retries (`CeleryIntegration`).
- Log breadcrumbs for WARNING/ERROR messages (via logging integration).

Tweak sampling with `SENTRY_TRACES_SAMPLE_RATE` and tag deployments via `ENVIRONMENT`.

## Health Check
Run the FastAPI app (e.g., `uvicorn main:app --reload`) and hit `GET /health` to verify connectivity once migrations are in place.
