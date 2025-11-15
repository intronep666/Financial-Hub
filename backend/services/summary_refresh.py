from __future__ import annotations

from sqlalchemy import text
from config.database import engine

SUPPORTED_DIALECTS = {"postgresql", "postgres"}


def refresh_financial_summary_view() -> None:
    """Refresh the materialized view if the backend database supports it."""
    dialect = engine.dialect.name
    if dialect not in SUPPORTED_DIALECTS:
        return

    with engine.begin() as connection:
        connection.execute(text("REFRESH MATERIALIZED VIEW user_financial_summary_mv"))
