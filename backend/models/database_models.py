"""
Enhanced database models with PostgreSQL support and new features
- Tags support for transactions
- Target dates for goals
- Improved relationships
"""

from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, DateTime, Boolean, JSON, ARRAY, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from config.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    transactions = relationship("Transaction", back_populates="owner", cascade="all, delete-orphan")
    categories = relationship("Category", back_populates="owner", cascade="all, delete-orphan")
    loans = relationship("Loan", back_populates="owner", cascade="all, delete-orphan")
    goals = relationship("Goal", back_populates="owner", cascade="all, delete-orphan")
    budgets = relationship("Budget", back_populates="owner", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="owner", cascade="all, delete-orphan")


class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    description = Column(String(500), nullable=False)
    amount = Column(Float, nullable=False)
    type = Column(String(20), nullable=False)  # 'income' or 'expense'
    date = Column(DateTime, default=datetime.utcnow, index=True)
    
    # TASK 3.3: Expense Tagging Support
    # For PostgreSQL: Use ARRAY, for SQLite: Use JSON
    tags = Column(JSON, default=list)  # ['#college', '#trip', '#urgent']
    
    # AI-generated fields
    ai_category_confidence = Column(Float, nullable=True)  # 0.0 to 1.0
    is_recurring = Column(Boolean, default=False)
    is_anomaly = Column(Boolean, default=False)  # Flagged by AI
    
    # Relationships
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    owner = relationship("User", back_populates="transactions")
    category = relationship("Category", back_populates="transactions")


class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    icon = Column(String(50), nullable=True)  # Emoji or icon name
    color = Column(String(7), nullable=True)  # Hex color code
    
    # Relationships
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="categories")
    transactions = relationship("Transaction", back_populates="category")
    budget = relationship("Budget", uselist=False, back_populates="category")


class Budget(Base):
    __tablename__ = "budgets"
    
    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    month = Column(Integer, nullable=False)  # 1-12
    year = Column(Integer, nullable=False)
    
    # AI predictions
    predicted_spending = Column(Float, nullable=True)
    alert_threshold = Column(Float, default=0.8)  # Alert at 80%
    
    # Relationships
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="budgets")
    category_id = Column(Integer, ForeignKey("categories.id"), unique=True)
    category = relationship("Category", back_populates="budget")


class Loan(Base):
    __tablename__ = "loans"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)  # Person or institution
    amount = Column(Float, nullable=False)  # Total amount
    paid = Column(Float, default=0)  # Amount paid so far
    type = Column(String(20), nullable=False)  # 'borrowed' or 'lent'
    date_taken = Column(Date, nullable=False)
    due_date = Column(Date, nullable=True)
    source = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    # NEW: Financial terms for proper amortization & risk metrics
    annual_interest_rate = Column(Float, nullable=True)  # e.g. 0.12 for 12%
    term_years = Column(Float, nullable=True)  # Loan length in years
    periods_per_year = Column(Integer, default=12)  # Usually 12 for monthly
    
    # Relationships
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="loans")
    
    @property
    def remaining(self):
        """Calculate remaining amount"""
        return self.amount - self.paid

    @property
    def has_amortization(self):
        return self.annual_interest_rate is not None and self.term_years is not None and self.periods_per_year > 0

    @property
    def total_periods(self):
        if not self.has_amortization:
            return None
        return int(self.term_years * self.periods_per_year)

    @property
    def periodic_rate(self):
        if not self.has_amortization:
            return None
        return self.annual_interest_rate / self.periods_per_year

    @property
    def scheduled_payment(self):
        """Compute PMT if amortization data exists."""
        if not self.has_amortization:
            return None
        from services.financial_formulas import pmt
        return float(pmt(self.periodic_rate, self.total_periods, self.amount))

    @property
    def total_interest(self):
        if not self.has_amortization:
            return None
        from services.financial_formulas import total_interest_paid
        return float(total_interest_paid(self.amount, self.periodic_rate, self.total_periods))

    @property
    def remaining_balance_amortized(self):
        """Remaining balance based on amortization schedule using paid proportion (approx)."""
        if not self.has_amortization:
            return None
        from services.financial_formulas import remaining_balance
        # Approximate periods paid from amount paid vs scheduled payment
        if self.scheduled_payment is None or self.scheduled_payment == 0:
            return None
        periods_paid_estimate = int((self.paid / self.scheduled_payment))
        periods_paid_estimate = max(0, min(periods_paid_estimate, self.total_periods))
        return float(remaining_balance(self.amount, self.periodic_rate, periods_paid_estimate, self.total_periods))


class Goal(Base):
    __tablename__ = "goals"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0)
    
    # TASK 3.5: Enhanced Goal Tracking
    target_date = Column(Date, nullable=True)  # NEW: Target completion date
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # AI predictions
    ai_predicted_completion = Column(Date, nullable=True)
    ai_success_probability = Column(Float, nullable=True)  # 0.0 to 1.0
    ai_recommended_monthly_saving = Column(Float, nullable=True)
    
    # Relationships
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship("User", back_populates="goals")
    
    @property
    def progress_percentage(self):
        """Calculate progress percentage"""
        if self.target_amount == 0:
            return 0
        return (self.current_amount / self.target_amount) * 100


class Notification(Base):
    """New table for storing notifications and alerts"""
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String(50), nullable=False)  # 'alert', 'reminder', 'insight'
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # AI-generated insights
    severity = Column(String(20), default='info')  # 'info', 'warning', 'critical'
    action_required = Column(Boolean, default=False)
    
    # Relationship
    owner = relationship("User", back_populates="notifications")
