import datetime
import tempfile
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

import importlib

summary_refresh = importlib.import_module('backend.services.summary_refresh')
summary_service = importlib.import_module('backend.services.summary_service')
_fetch_cached_totals = summary_service._fetch_cached_totals
refresh_financial_summary_view = summary_refresh.refresh_financial_summary_view


def make_session():
    # Use a temporary file-backed SQLite DB to allow multiple connections in tests
    tmp = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
    tmp.close()
    db_path = tmp.name
    engine = create_engine(f"sqlite:///{db_path}")
    SessionLocal = sessionmaker(bind=engine)
    return engine, SessionLocal(), db_path


def test_fetch_cached_totals_from_view(monkeypatch):
    engine, session, db_path = make_session()
    # Create a simple `user_financial_summary_mv` table to simulate the view
    with engine.begin() as conn:
        conn.execute(
            text(
                """
                CREATE TABLE user_financial_summary_mv (
                    user_id INTEGER PRIMARY KEY,
                    total_income REAL,
                    total_expense REAL,
                    balance REAL,
                    last_transaction_at TEXT,
                    transaction_count INTEGER
                )
                """
            )
        )
        conn.execute(
            text(
                "INSERT INTO user_financial_summary_mv (user_id, total_income, total_expense, balance, last_transaction_at, transaction_count) VALUES (1, 1000.0, 500.0, 500.0, :ts, 10)"
            ),
            {"ts": datetime.datetime.utcnow().isoformat()}
        )

    # Monkeypatch the SUPPORTED_DIALECTS in the loaded summary_service to allow SQLite for test
    monkeypatch.setattr(summary_service, 'SUPPORTED_DIALECTS', {'sqlite'})

    # Sanity check: session should be bound to the same engine and dialect
    assert session.get_bind().dialect.name == engine.dialect.name
    # Sanity check: the session should be able to select the inserted row
    row_val = session.execute(text("SELECT total_income FROM user_financial_summary_mv WHERE user_id = :uid"), {"uid": 1}).scalar()
    assert row_val == 1000.0
    # Also check the mapping shape used by _fetch_cached_totals
    mapping_row = session.execute(
        text(
            "SELECT total_income, total_expense, balance, last_transaction_at, transaction_count FROM user_financial_summary_mv WHERE user_id = :uid"
        ),
        {"uid": 1},
    ).mappings().first()
    assert mapping_row is not None
    result = _fetch_cached_totals(session, 1)
    assert result is not None
    assert result['total_income'] == 1000.0
    assert result['total_expense'] == 500.0
    assert result['balance'] == 500.0
    assert result['transaction_count'] == 10
    session.close()
    engine.dispose()
    os.unlink(db_path)


def test_fetch_cached_totals_fallback_when_view_absent(monkeypatch):
    engine, session, db_path = make_session()
    # No table created intentionally
    monkeypatch.setattr(summary_service, 'SUPPORTED_DIALECTS', {'sqlite'})
    result = _fetch_cached_totals(session, 1)
    assert result is None
    session.close()
    engine.dispose()
    os.unlink(db_path)


def test_refresh_financial_summary_view_is_noop_on_sqlite(monkeypatch):
    # Ensure we can call refresh without it blowing up on SQLite dialect
    # Monkeypatch `engine` in the module to an in-memory sqlite for this test
    from sqlalchemy import create_engine as sa_create_engine
    new_engine = sa_create_engine("sqlite:///:memory:")
    monkeypatch.setattr(summary_refresh, 'engine', new_engine, raising=False)
    # If the dialect is sqlite, this should simply return (no error)
    refresh_financial_summary_view()
