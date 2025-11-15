from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from config.settings import settings
import os
from config.database import Base, engine

# Routers
from services.auth_service import router as auth_router
from services.transaction_service import router as transactions_router
from services.goal_service import router as goals_router
from services.notification_service import router as notifications_router
from services.summary_service import router as summary_router
from services.loan_service import router as loans_router
from services.category_service import router as categories_router
from telemetry.sentry import init_sentry


init_sentry()


def run_light_migrations():
    """Lightweight, idempotent migrations for adding new Loan columns.
    Handles SQLite and Postgres dialects to add columns if missing.
    """
    dialect = engine.dialect.name
    with engine.begin() as conn:
        if dialect == 'sqlite':
            # Check existing columns
            cols = conn.execute(text("PRAGMA table_info(loans)"))
            existing = {row[1] for row in cols}
            add_cmds = []
            if 'annual_interest_rate' not in existing:
                add_cmds.append("ALTER TABLE loans ADD COLUMN annual_interest_rate REAL")
            if 'term_years' not in existing:
                add_cmds.append("ALTER TABLE loans ADD COLUMN term_years REAL")
            if 'periods_per_year' not in existing:
                add_cmds.append("ALTER TABLE loans ADD COLUMN periods_per_year INTEGER DEFAULT 12")
            for cmd in add_cmds:
                conn.execute(text(cmd))
        elif dialect in ('postgresql', 'postgres'):
            conn.execute(text(
                """
                ALTER TABLE IF EXISTS loans
                ADD COLUMN IF NOT EXISTS annual_interest_rate double precision,
                ADD COLUMN IF NOT EXISTS term_years double precision,
                ADD COLUMN IF NOT EXISTS periods_per_year integer DEFAULT 12;
                """
            ))


def create_app() -> FastAPI:
    app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION, debug=settings.DEBUG)

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Create tables and apply light migrations unless explicitly skipped.
    # This avoids tests reloading the main app from triggering heavy DB operations
    # (set `SKIP_DB_INIT=true` in environment to disable table creation and light migrations).
    if os.getenv("SKIP_DB_INIT", "false").lower() != "true":
        # Create tables (no destructive changes)
        Base.metadata.create_all(bind=engine)
        # Apply light migrations for new columns
        run_light_migrations()

    # Include routers
    app.include_router(auth_router)
    app.include_router(transactions_router)
    app.include_router(goals_router)
    app.include_router(notifications_router)
    app.include_router(summary_router)
    app.include_router(loans_router)
    app.include_router(categories_router)

    @app.get("/health")
    def health():
        return {"status": "ok", "version": settings.APP_VERSION}

    @app.get("/debug-sentry")
    def debug_sentry():
        """Trigger an exception intentionally to verify Sentry event capture.

        Returns a friendly message when `SENTRY_DSN` is not configured so this endpoint
        can be safely called in dev environments without raising errors.
        """
        if not settings.is_sentry_enabled:
            return {"message": "Sentry is not enabled; set SENTRY_DSN to enable"}
        # Raise an unhandled exception to ensure it gets captured by Sentry
        raise RuntimeError("Sentry debug endpoint triggered")

    return app


app = create_app()
