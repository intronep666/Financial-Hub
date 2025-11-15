from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from typing import Optional

from config.database import get_db
from services.auth_service import get_current_user_from_cookie
from models.database_models import Transaction, Loan
from models.schemas import FinancialSummary
from services.financial_formulas import net_income, savings_rate, dti
from services.summary_refresh import SUPPORTED_DIALECTS

router = APIRouter(prefix="/summary", tags=["Summary"])


def _fetch_cached_totals(db: Session, user_id: int) -> Optional[dict]:
    """Attempt to pull pre-aggregated totals from the materialized view."""
    bind = db.get_bind()
    if bind is None or bind.dialect.name not in SUPPORTED_DIALECTS:
        return None

    try:
        row = db.execute(
            text(
                "SELECT total_income, total_expense, balance, last_transaction_at, transaction_count "
                "FROM user_financial_summary_mv WHERE user_id = :uid"
            ),
            {"uid": user_id}
        ).mappings().first()
        if not row:
            return None
        return {
            "total_income": float(row.get("total_income") or 0.0),
            "total_expense": float(row.get("total_expense") or 0.0),
            "balance": float(row.get("balance") or 0.0),
            "last_transaction_at": row.get("last_transaction_at"),
            "transaction_count": int(row.get("transaction_count") or 0)
        }
    except Exception as exc:  # pragma: no cover - defensive logging
        print(f"Materialized view lookup failed, falling back to live aggregation: {exc}")
        return None

@router.get("/", response_model=FinancialSummary)
def get_financial_summary(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_from_cookie)
):
    """Aggregate core financial metrics and derived ratios."""
    cached_totals = _fetch_cached_totals(db, current_user.id)

    if cached_totals:
        total_income = cached_totals["total_income"]
        total_expense = cached_totals["total_expense"]
        balance = cached_totals["balance"]
    else:
        total_income = db.query(func.sum(Transaction.amount)).filter(
            Transaction.owner_id == current_user.id,
            Transaction.type == 'income'
        ).scalar() or 0.0

        total_expense = db.query(func.sum(Transaction.amount)).filter(
            Transaction.owner_id == current_user.id,
            Transaction.type == 'expense'
        ).scalar() or 0.0

        balance = total_income - total_expense

    # Loans: borrowed amounts outstanding (you owe)
    borrowed_loans = db.query(Loan).filter(Loan.owner_id == current_user.id, Loan.type == 'borrowed').all()
    total_debt = sum(l.remaining for l in borrowed_loans)

    # Lent loans (money others owe you)
    lent_loans = db.query(Loan).filter(Loan.owner_id == current_user.id, Loan.type == 'lent').all()
    total_lent_outstanding = sum(l.remaining for l in lent_loans)

    # Standardized net income and savings rate
    net_inc = float(net_income(total_income, total_expense))
    savings_rate_value = float(savings_rate(total_income, total_expense))  # 0-1

    # DTI approximation: monthly debt payment vs average monthly income
    # Approximate monthly income from last 30 days income transactions
    from datetime import datetime, timedelta
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    monthly_income = db.query(func.sum(Transaction.amount)).filter(
        Transaction.owner_id == current_user.id,
        Transaction.type == 'income',
        Transaction.date >= thirty_days_ago
    ).scalar() or 0.0

    # Monthly debt payments: sum scheduled payments for borrowed loans with amortization
    monthly_debt_payments = sum(l.scheduled_payment for l in borrowed_loans if l.scheduled_payment) or 0.0
    dti_ratio = float(dti(monthly_debt_payments, monthly_income)) if monthly_income > 0 else 0.0

    # Financial health score (placeholder improved weighting)
    # Weights: income stability, spending control, savings rate, debt load, DTI moderation
    spending_control = (total_income - total_expense) / total_income if total_income > 0 else 0
    debt_pressure = 1 - min(1, total_debt / (total_income + 1))
    savings_component = savings_rate_value
    dti_component = 1 - min(1, dti_ratio)  # Lower DTI is better

    # Weighted score scaled to 0-100
    health_score = max(0, min(100, (spending_control * 0.25 + debt_pressure * 0.25 + savings_component * 0.3 + dti_component * 0.2) * 100))

    return FinancialSummary(
        total_income=total_income,
        total_expense=total_expense,
        balance=balance,
        total_debt=total_debt,
        total_lent_outstanding=total_lent_outstanding,
        net_income=net_inc,
        savings_rate=savings_rate_value,
        dti_ratio=dti_ratio,
        financial_health_score=health_score
    )
