"""Celery application configuration for Financial Hub."""
from __future__ import annotations

import sys
from pathlib import Path
from celery import Celery

BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.append(str(BASE_DIR))

from config.settings import settings  # noqa: E402
from telemetry.sentry import init_sentry  # noqa: E402

init_sentry()

celery_app = Celery(
    "financial_hub",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_default_queue="financial-hub",
)

celery_app.autodiscover_tasks(["tasks"])

__all__ = ["celery_app"]
