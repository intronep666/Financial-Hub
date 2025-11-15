# Financial Hub – Comprehensive Project Summary

_Last updated: 2025-11-15_

## 1. Vision & Scope
Financial Hub is an AI-enabled personal finance platform that unifies expense tracking, budgeting, goal management, loan oversight, and intelligent insights across a modern web frontend and a FastAPI backend. The initiative focused on upgrading the legacy CRA stack to Vite + React Query, centralizing API communication, improving performance via virtualization, and hardening the backend with migrations, Celery/Redis processing, Sentry, Dockerized deployment, and CI automation.

## 2. Repository Layout
```
Financial-Hub/
├── backend/               # FastAPI application, Celery tasks, Alembic migrations
├── frontend/              # React + Vite SPA with Tailwind and React Query
├── docker-compose.yml     # Orchestration for Postgres, Redis, API, worker, frontend
├── .github/workflows/ci.yml
├── PROJECT_SUMMARY.md     # This document
└── README.md              # High-level instructions and marketing content
```

## 3. Backend Breakdown (`backend/`)
### 3.1 Core Technologies
- **Framework**: FastAPI 0.115+ with Pydantic v2 schemas (`models/schemas.py`).
- **ORM**: SQLAlchemy 2.0 models defined in `models/database_models.py`.
- **Database Support**: SQLite for local usage, PostgreSQL for production via `config/settings.py` and `config/database.py`.
- **Migrations**: Alembic (initialized under `backend/alembic/`) with two revisions:
  - `20241115_0001_initial_schema.py`: Recreates tables for users, categories, transactions, budgets, loans, notifications, goals, and indexes.
  - `20241115_0002_financial_summary_view.py`: Adds the `user_financial_summary_mv` materialized view (Postgres) / view (SQLite).
- **Async Jobs**: Celery + Redis, defined in `celery_app.py` and `tasks/transaction_tasks.py`.
- **Observability**: Sentry integration (`telemetry/sentry.py`) hooking into both FastAPI (`main.py`) and Celery worker (`celery_app.py`).

### 3.2 Service Modules
- `services/auth_service.py`: Cookie-based JWT authentication helpers.
- `services/transaction_service.py`: CRUD endpoints for transactions, AI enrichment hooks, streaming, and Celery-based summary refreshes/event dispatch.
- `services/goal_service.py`, `services/loan_service.py`, `services/notification_service.py`, `services/summary_service.py`, etc., each exposing routers attached in `main.py`.
- `services/summary_service.py`: Aggregates totals from `user_financial_summary_mv` with fallback to live SQL; calculates financial health metrics (net income, savings rate, DTI) and consumes `services/financial_formulas.py` utilities.
- `services/summary_refresh.py`: Issues `REFRESH MATERIALIZED VIEW` on supported dialects.
- `services/financial_formulas.py`: High-precision Decimal amortization and ratio helpers, now unit-tested via `tests/test_financial_formulas.py`.
- `services/streaming_service.py`, `services/ai_service.py`, `services/voice` stubs: Integration points for future AI/streaming features (placeholders remain but are wired for Celery dispatch).

### 3.3 Configuration & Settings
- `.env.example`: Documents DB credentials, Redis/Celery URLs, and new Sentry knobs.
- `config/settings.py`: Pydantic settings class with convenience properties for DB URL selection, Celery broker/result backend, and Sentry toggles.
- `config/database.py`: Engine factory handling SQLite vs. Postgres, plus `Base = declarative_base()` and `get_db` dependency.

### 3.4 Background Processing
- `tasks/transaction_tasks.py` defines Celery tasks for:
  - `publish_transaction_event_task`: Wraps streaming events with retries.
  - `refresh_financial_summary_view_task`: Refreshes the materialized view asynchronously.
- `services/transaction_service.py` calls `enqueue_summary_refresh()` and `dispatch_transaction_event()` to queue tasks with synchronous fallbacks when the broker is down.

### 3.5 Tests
- `backend/tests/test_financial_formulas.py`: Validates PMT, remaining balance monotonic behavior, and ratio calculations ensuring deterministic CI outputs.
 - `backend/tests/test_summary_service.py`: Verifies the logic that reads from `user_financial_summary_mv` materialized view when available and safely falls back to live aggregation; uses temporary SQLite DB to verify both view and fallback paths.
 - `backend/tests/test_debug_sentry.py`: Verifies the `/debug-sentry` endpoint behavior under both enabled and disabled Sentry environments without invoking heavy DB migrations.
- CI (`.github/workflows/ci.yml`) executes `pytest --maxfail=1 --disable-warnings` and `python -m compileall -q .` to catch syntax errors across all backend modules.

## 4. Frontend Breakdown (`frontend/`)
### 4.1 Core Technologies
- **Build Tool**: Vite 6 with React 19 and Tailwind CSS 3.4.
- **Data Layer**: React Query (`@tanstack/react-query`) manages caching, with hooks defined in `src/hooks/useTransactions.js` (and similarly for other entities if expanded).
- **HTTP Client**: Shared Axios instance at `src/api.js` to centralize interceptors and auth headers.
- **State Enhancements**: Components rely on React Query results + local UI state; virtualization via `react-window` improves transaction list performance.

### 4.2 Key Components (in `src/components/`)
- `Dashboard.js`: Overview cards, charts, progress indicators.
- `Transactions.jsx`: Enhanced to use `TransactionsList.jsx` (react-window) with tag filtering, voice-entry modal stub, and React Query integration for create/fetch flows.
- `Goals.js`, `Loans.js`, `Navbar.js`, `Login.js`, `Register.js`, `TransactionsList.jsx`: UI modules interacting with API endpoints provided by FastAPI backend.
- `App.js`, `App.css`, `index.js`, `index.css`: Vite entrypoints configuring React Router (if used), QueryClientProvider, and global styling.

### 4.3 Styling & Assets
- Tailwind configuration in `tailwind.config.js` and `postcss.config.js` with custom glassmorphism design tokens.
- Public assets (icons, manifest, service worker placeholders) under `frontend/public/`.

### 4.4 Testing & Tooling
- Vite-provided `npm test` (Jest environment) and `npm run build` for production bundles. CI runs `npm ci` and `npm run build` (tests can be reinstated as needed).
- `TransactionsList.jsx` ensures virtualization logic for thousands of rows, reusing render props for summary vs. detailed views.

### 4.5 Docker Image
- `frontend/Dockerfile` builds the Vite app in a `node:20-alpine` stage, then serves with `nginx:1.27-alpine` using the SPA-friendly `nginx.conf`.

## 5. Infrastructure & Deployment
### 5.1 Docker Compose (`docker-compose.yml`)
Services:
- `postgres`: PostgreSQL 16 with health checks.
- `redis`: Redis 7 for Celery broker/result backend.
- `backend`: Builds from `backend/Dockerfile`, runs Alembic + Uvicorn, exposes port 8000.
- `celery`: Reuses backend image but runs `celery -A celery_app.celery_app worker`.
- `migrate`: One-shot Alembic upgrade service to ensure schema is current.
- `frontend`: Builds SPA image and serves via Nginx on port 3000.
Environment variables pass DB URLs, Redis connection strings, AI endpoint placeholders, and `ENVIRONMENT=docker` for Sentry tagging.

Note: The frontend image build now accepts Vite/React build args (VITE_API_URL/REACT_APP_API_URL) that are passed via `docker-compose` build args so the static build is configured to communicate with the back-end host at build time.

### 5.2 CI/CD (`.github/workflows/ci.yml`)
- **Backend job**: Python 3.13, `pip install -r requirements.txt`, `pytest`, `python -m compileall -q .`.
- **Frontend job**: Node 20, `npm ci`, `npm run build`.
- **Integration job**: Optional Docker Compose integration job (new) that brings up the full stack on CI runners, waits for health, runs the smoke tests (API endpoints), and validates the materialized view/index via `psql` in the Postgres container.
- Triggered on pushes to `main` and `improve/performance-infra` plus pull requests.

### 5.3 Observability
- Sentry instrumentation activated whenever `SENTRY_DSN` is set (with optional `SENTRY_TRACES_SAMPLE_RATE` and `ENVIRONMENT`). Logs at `ERROR` create events; traces sample rate default is 0.2.

## 6. Feature Highlights
| Domain | Capabilities |
| --- | --- |
| Transactions | CRUD, AI enrichment stubs, tag filtering, React Query caching, virtualization UI, voice input modal stub |
| Budgets/Goals | Models and services for budgets (`Budget`), goals with AI prediction fields, progress calculations |
| Loans | Support for amortization metrics (scheduled payment, total interest, remaining balance), additional columns delivered via light migrations in `main.py` `run_light_migrations()` |
| Notifications | Schema for severity-based insights, ready for integration with AI/streaming events |
| Summary | Materialized view-backed aggregation for total income/expense, health score, DTI, with fallback for non-Postgres environments |

## 7. Getting Started Summary
1. `cp backend/.env.example backend/.env` and adjust DB credentials, Redis URLs, and Sentry DSN.
2. **Local dev**: run backend via `uvicorn main:app --reload`, frontend via `npm run dev`, and Celery worker optionally.
3. **Docker Compose**: `docker compose up --build` brings up the entire stack with Postgres/Redis.
   - After the stack is healthy, you can run the quick smoke test to validate API flows and user journeys:
     - Bash: `./scripts/smoke_test.sh`
     - PowerShell: `./scripts/smoke_test.ps1`
   - Materialized view verification can be performed using `./scripts/check_matview.sh` or `./scripts/check_matview.ps1`.
4. **Testing**: `cd backend && pytest`; `cd frontend && npm run build` for verification.
5. **CI**: Pushing changes automatically enforces the same checks.

## 8. Notable Design Choices
- **React Query + Axios**: Eliminates repetitive fetch logic and enables cache invalidation/invalidation after mutations.
- **React Window Virtualization**: Scales transaction lists and prevents DOM thrash.
- **Materialized View**: Provides near-real-time aggregates for dashboard summary with asynchronous refresh to balance performance and accuracy.
- **Celery Fallbacks**: When Redis/Celery are unavailable (e.g., developer environment), the system still performs critical refreshes and streaming inline, preventing feature regression.
- **Sentry Everywhere**: Ensures API routes and background tasks share observability context without duplicating code.
- **Docker & Compose**: Aligns local and production environments, including DB migrations via the `migrate` service.

## 9. Future Enhancements (Optional Ideas)
- Flesh out `services/ai_service.py` and `services/streaming_service.py` with actual providers.
- Add more unit/integration tests (e.g., API contract tests, React component tests).
- Implement GitHub Actions deployment steps (e.g., Docker push, CD).
- Expand voice-to-text pipeline and tag suggestion AI endpoints.

## 10. Recent verification & infra updates (branch: `verify/infra-rollout`)
Summary of verification and infrastructure improvements made in this branch, November 15, 2025:

- New production environment example files:
  - `backend/.env.production.example`
  - `frontend/.env.production.example`
  - `frontend/.env.example` (development example now added)

- Docker & build flows:
  - Frontend `Dockerfile` accepts `VITE_API_URL` and `REACT_APP_API_URL` build args so the static site is baked with the correct backend URL; these args are now provided by `docker-compose.yml`.
  - `docker-compose.yml` now populates those args and defaults the backend to `http://backend:8000` for internal networking.

- Tests & verification:
  - Added `backend/tests/test_summary_service.py` to validate matview read path and fallback behavior to live aggregation.
  - Added `backend/tests/test_debug_sentry.py` to test `/debug-sentry` behavior without triggering migrations; targeted tests avoid heavy DB interactions and assert expected return codes.
  - Ensured the backend test suite passes locally with venv-based dependencies; CI already runs the backend tests.

- Smoke & infra checks:
  - Added small manual smoke test scripts (`scripts/smoke_test.sh`, `scripts/smoke_test.ps1`) to validate API basic auth/register/login/transactions flow after the stack is up.
  - Added matview verification scripts (`scripts/check_matview.sh` and `.ps1`) to inspect `user_financial_summary_mv` existence and associated index via `psql` in the `postgres` container.
  - The CI integration job brings up `docker compose`, waits for the backend `GET /health` endpoint, runs smoke tests and matview checks, and tears down the stack.

- Observability & debug endpoints:
  - Exposed `/debug-sentry` to trigger an exception (used to validate Sentry event capture in staging or CI with `SENTRY_DSN` set).

- Documentation & developer UX:
  - Updated README and backend README to point to `.env.production.example` and to recommend the `financial_hub` DB name across config files.
  - Added quick-run scripts and explicit dev+CI steps for maintainers.
  - `start-frontend.bat` now sets a local default `VITE_API_URL=http://localhost:8000` so the Vite dev server has a deterministic backend base if no `.env` variables are present.
    - Frontend runtime config: Added `frontend/public/env-config.js` default and `frontend/docker-entrypoint.sh` to inject `env-config.js` at container startup; `frontend/src/api.js` now will prefer `window.__RUNTIME_CONFIG__` for API base if present. This allows changing the backend URL at runtime without rebuilding the static assets.
  - Added `start-dev.sh`, `start-celery.sh`, and `start-dev.ps1` cross-platform scripts for easier development on macOS/Linux and PowerShell. These scripts default to `SKIP_DB_INIT=true` for quicker imports and local iterations; see README for instructions on running migrations if required (e.g., `alembic upgrade head`).

Notes:
- The verification includes local unit test runs and CI run definitions; some checks (Docker Compose stack, Alembic migrations, Postgres matview) require Docker as well as proper environment variables (e.g., SENTRY_DSN, SECRET_KEY) and will fail if run on hosts missing Docker or Postgres.
- The test suite includes non-blocking warnings (Pydantic migration guidance) that are out of scope for this pass but noted for future upgrades.

---
This document captures the full state of the Financial Hub project after the modernization initiative. Use it as a reference for onboarding, audits, or deployment planning.
