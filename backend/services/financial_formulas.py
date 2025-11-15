"""Core financial formulas module.
High-precision Decimal implementations. End-stage rounding only.
"""
from decimal import Decimal, getcontext, ROUND_HALF_UP
from typing import Optional

getcontext().prec = 28  # High precision for intermediate calculations

MONEY = Decimal('0.01')

def to_decimal(value) -> Decimal:
    if isinstance(value, Decimal):
        return value
    return Decimal(str(value))

def money(value: Decimal) -> Decimal:
    return value.quantize(MONEY, rounding=ROUND_HALF_UP)

# --- Period helpers ---

def periodic_rate(annual_rate: float | Decimal, periods_per_year: int) -> Decimal:
    r = to_decimal(annual_rate)
    n = to_decimal(periods_per_year)
    if n <= 0:
        raise ValueError("periods_per_year must be > 0")
    return r / n

def total_periods(periods_per_year: int, years: float | Decimal) -> int:
    n = to_decimal(periods_per_year)
    t = to_decimal(years)
    if n <= 0 or t < 0:
        raise ValueError("Invalid periods_per_year or years")
    return int((n * t).to_integral_value(rounding=ROUND_HALF_UP))

# --- Time Value of Money ---

def fv(principal: float | Decimal, rate_per_period: float | Decimal, periods: int) -> Decimal:
    P = to_decimal(principal)
    i = to_decimal(rate_per_period)
    if periods < 0:
        raise ValueError("periods must be >= 0")
    return P * (Decimal(1) + i) ** periods

def pv(future_value: float | Decimal, rate_per_period: float | Decimal, periods: int) -> Decimal:
    FV = to_decimal(future_value)
    i = to_decimal(rate_per_period)
    if periods < 0:
        raise ValueError("periods must be >= 0")
    return FV / (Decimal(1) + i) ** periods

# --- Loan / Amortization ---

def pmt(rate_per_period: float | Decimal, total_periods_: int, principal: float | Decimal) -> Decimal:
    i = to_decimal(rate_per_period)
    n = total_periods_
    P = to_decimal(principal)
    if n <= 0:
        raise ValueError("total_periods must be > 0")
    if i == 0:
        return P / n
    factor = (i * (Decimal(1) + i) ** n) / ((Decimal(1) + i) ** n - Decimal(1))
    return P * factor

def remaining_balance(principal: float | Decimal, rate_per_period: float | Decimal, periods_paid: int, total_periods_: int) -> Decimal:
    P = to_decimal(principal)
    i = to_decimal(rate_per_period)
    n = total_periods_
    k = periods_paid
    if k < 0 or k > n:
        raise ValueError("periods_paid must be between 0 and total_periods")
    if i == 0:
        return P * (Decimal(n - k) / Decimal(n))
    return P * ((Decimal(1) + i) ** n - (Decimal(1) + i) ** k) / ((Decimal(1) + i) ** n - Decimal(1))

def total_interest_paid(principal: float | Decimal, rate_per_period: float | Decimal, total_periods_: int) -> Decimal:
    P = to_decimal(principal)
    i = to_decimal(rate_per_period)
    n = total_periods_
    payment = pmt(i, n, P)
    return payment * n - P

# --- Savings / Investment ---

def fv_periodic(payment: float | Decimal, rate_per_period: float | Decimal, periods: int) -> Decimal:
    PMT = to_decimal(payment)
    i = to_decimal(rate_per_period)
    if periods < 0:
        raise ValueError("periods must be >= 0")
    if i == 0:
        return PMT * periods
    return PMT * (((Decimal(1) + i) ** periods - Decimal(1)) / i)

def required_contribution(target_fv: float | Decimal, rate_per_period: float | Decimal, periods: int) -> Decimal:
    FV_target = to_decimal(target_fv)
    i = to_decimal(rate_per_period)
    if periods <= 0:
        raise ValueError("periods must be > 0")
    if i == 0:
        return FV_target / periods
    return FV_target * i / ((Decimal(1) + i) ** periods - Decimal(1))

# --- Rule of 72 ---

def rule_of_72(annual_rate_percent: float | Decimal) -> Decimal:
    r_pct = to_decimal(annual_rate_percent)
    if r_pct <= 0:
        raise ValueError("annual_rate_percent must be > 0")
    return Decimal(72) / r_pct

# --- Ratios & Aggregates ---

def net_income(total_income: float | Decimal, total_expense: float | Decimal) -> Decimal:
    return to_decimal(total_income) - to_decimal(total_expense)

def savings_rate(total_income: float | Decimal, total_expense: float | Decimal) -> Decimal:
    inc = to_decimal(total_income)
    exp = to_decimal(total_expense)
    if inc <= 0:
        return Decimal(0)
    return (inc - exp) / inc

def dti(monthly_debt_payments: float | Decimal, gross_monthly_income: float | Decimal) -> Decimal:
    income = to_decimal(gross_monthly_income)
    if income <= 0:
        return Decimal(0)
    return to_decimal(monthly_debt_payments) / income

__all__ = [
    'periodic_rate','total_periods','fv','pv','pmt','remaining_balance','total_interest_paid',
    'fv_periodic','required_contribution','rule_of_72','net_income','savings_rate','dti','money','to_decimal'
]
