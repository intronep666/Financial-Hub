from decimal import Decimal

from backend.services.financial_formulas import (
    dti,
    money,
    net_income,
    pmt,
    remaining_balance,
    savings_rate,
    total_interest_paid,
)


def test_pmt_and_interest_round_trip():
    payment = pmt(rate_per_period=Decimal("0.01"), total_periods_=24, principal=10000)
    total_interest = total_interest_paid(10000, Decimal("0.01"), 24)
    assert money(payment) == Decimal("470.73")
    assert money(total_interest) == Decimal("1297.63")


def test_remaining_balance_monotonic():
    balance_start = remaining_balance(5000, Decimal("0.008"), 0, 36)
    balance_mid = remaining_balance(5000, Decimal("0.008"), 18, 36)
    balance_end = remaining_balance(5000, Decimal("0.008"), 36, 36)
    assert balance_start > balance_mid > balance_end
    assert balance_end == Decimal("0")


def test_ratios_and_aggregates():
    assert net_income(12000, 9000) == Decimal("3000")
    assert savings_rate(12000, 9000) == Decimal("0.25")
    assert dti(1500, 6000) == Decimal("0.25")
    assert dti(Decimal(0), Decimal(0)) == Decimal("0")
