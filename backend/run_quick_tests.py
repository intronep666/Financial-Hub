import sys
from decimal import Decimal

# Ensure backend path is importable
sys.path.insert(0, r'p:\cstries\financial-hub\backend')

from services.financial_formulas import (
    pmt,
    total_interest_paid,
    money,
    remaining_balance,
    net_income,
    savings_rate,
    dti,
)


def run():
    # Test pmt & total interest
    payment = pmt(rate_per_period=Decimal("0.01"), total_periods_=24, principal=10000)
    total_interest = total_interest_paid(10000, Decimal("0.01"), 24)
    assert money(payment) == Decimal("470.73"), f"payment got {money(payment)}"
    assert money(total_interest) == Decimal("1297.63"), f"total_interest got {money(total_interest)}"

    # Remaining balance monotonic
    balance_start = remaining_balance(5000, Decimal("0.008"), 0, 36)
    balance_mid = remaining_balance(5000, Decimal("0.008"), 18, 36)
    balance_end = remaining_balance(5000, Decimal("0.008"), 36, 36)
    assert balance_start > balance_mid > balance_end
    assert balance_end == Decimal("0")

    # Ratios and aggregates
    assert net_income(12000, 9000) == Decimal("3000")
    assert savings_rate(12000, 9000) == Decimal("0.25")
    assert dti(1500, 6000) == Decimal("0.25")
    assert dti(Decimal(0), Decimal(0)) == Decimal("0")

    print("All tests passed")


if __name__ == "__main__":
    run()
