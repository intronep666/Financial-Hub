import importlib
from fastapi.testclient import TestClient


def _reload_app_with_sentry(monkeypatch, sentry_dsn_value):
    # Ensure environment and settings are reloaded with the desired DSN
    monkeypatch.setenv("SENTRY_DSN", sentry_dsn_value or "")
    # Reload config.settings so the `settings` object reflects the new envvars
    settings_mod = importlib.reload(importlib.import_module("config.settings"))
    # Create a minimal FastAPI app that mirrors the debug route logic from main.py
    from fastapi import FastAPI
    from config.settings import settings as conf_settings
    app = FastAPI()

    @app.get("/debug-sentry")
    def debug_sentry():
        if not conf_settings.is_sentry_enabled:
            return {"message": "Sentry is not enabled; set SENTRY_DSN to enable"}
        raise RuntimeError("Sentry debug endpoint triggered")

    return TestClient(app, raise_server_exceptions=False)


def test_debug_sentry_route_returns_message_when_disabled(monkeypatch):
    client = _reload_app_with_sentry(monkeypatch, "")
    r = client.get("/debug-sentry")
    assert r.status_code == 200
    assert r.json().get("message") and "Sentry is not enabled" in r.json().get("message")


def test_debug_sentry_route_raises_when_enabled(monkeypatch):
    # Use an example DSN that won't actually attempt to publish events in tests
    client = _reload_app_with_sentry(monkeypatch, "https://public@sentry.example/1")
    r = client.get("/debug-sentry")
    # If Sentry is enabled we expect an internal server error triggered by the route
    assert r.status_code == 500
