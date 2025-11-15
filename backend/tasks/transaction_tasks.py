from __future__ import annotations

from celery import shared_task

from services.streaming_service import publish_transaction_event
from services.summary_refresh import refresh_financial_summary_view


@shared_task(bind=True, name="transactions.publish_event", max_retries=3, default_retry_delay=5)
def publish_transaction_event_task(self, event_type: str, transaction_id: int, user_id: int, data: dict) -> None:
    """Send transaction events to the streaming pipeline with retries."""
    try:
        publish_transaction_event(
            event_type=event_type,
            transaction_id=transaction_id,
            user_id=user_id,
            data=data,
        )
    except Exception as exc:  # pragma: no cover - side-effectful I/O
        raise self.retry(exc=exc)


@shared_task(name="summary.refresh_materialized_view")
def refresh_financial_summary_view_task() -> None:
    """Refresh the materialized summary view asynchronously."""
    refresh_financial_summary_view()
