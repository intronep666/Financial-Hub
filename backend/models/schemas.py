"""
Pydantic schemas for API request/response validation
Enhanced with new features: tags, target_date, AI fields
"""

from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime, date
from typing import Optional, List

# ============== USER SCHEMAS ==============

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    email: Optional[EmailStr] = None


class UserOut(BaseModel):
    id: int
    username: str
    email: Optional[str]
    created_at: datetime
    is_active: bool
    
    class Config:
        orm_mode = True
        from_attributes = True


class Token(BaseModel):
    """✅ FIXED: Token response includes user info for frontend verification"""
    access_token: str
    token_type: str = "bearer"
    user_id: int
    username: str
    message: str = "Authentication successful. Secure session established."


# ============== CATEGORY SCHEMAS ==============

class CategoryOut(BaseModel):
    id: int
    name: str
    icon: Optional[str]
    color: Optional[str]
    
    class Config:
        orm_mode = True
        from_attributes = True


# ============== TRANSACTION SCHEMAS ==============

class TransactionCreate(BaseModel):
    description: str = Field(..., min_length=1, max_length=500)
    amount: float = Field(..., gt=0)
    type: str = Field(..., pattern="^(income|expense)$")
    category_id: int
    tags: List[str] = Field(default_factory=list)  # TASK 3.3: Tags support
    date: Optional[datetime] = None
    
    @validator('tags')
    def validate_tags(cls, tags):
        """Ensure tags are lowercase and start with #"""
        return [tag.lower() if tag.startswith('#') else f'#{tag.lower()}' for tag in tags]


class TransactionOut(BaseModel):
    id: int
    description: str
    amount: float
    type: str
    date: datetime
    tags: List[str]  # TASK 3.3
    category: CategoryOut
    
    # AI fields
    ai_category_confidence: Optional[float]
    is_recurring: bool
    is_anomaly: bool
    
    class Config:
        orm_mode = True
        from_attributes = True


# ============== LOAN SCHEMAS ==============

class LoanCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    amount: float = Field(..., gt=0)
    paid: float = Field(default=0, ge=0)
    type: str = Field(..., pattern="^(borrowed|lent)$")
    date_taken: date
    due_date: Optional[date] = None
    source: Optional[str] = None
    notes: Optional[str] = None
    annual_interest_rate: Optional[float] = Field(default=None, ge=0)
    term_years: Optional[float] = Field(default=None, ge=0)
    periods_per_year: Optional[int] = Field(default=12, ge=1, le=365)


class LoanOut(BaseModel):
    id: int
    name: str
    amount: float
    paid: float
    remaining: float
    type: str
    date_taken: date
    due_date: Optional[date]
    source: Optional[str]
    notes: Optional[str]
    annual_interest_rate: Optional[float]
    term_years: Optional[float]
    periods_per_year: Optional[int]
    scheduled_payment: Optional[float]
    total_interest: Optional[float]
    remaining_balance_amortized: Optional[float]
    
    class Config:
        orm_mode = True
        from_attributes = True


# ============== GOAL SCHEMAS ==============

class GoalCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    target_amount: float = Field(..., gt=0)
    current_amount: float = Field(default=0, ge=0)
    target_date: Optional[date] = None  # TASK 3.5: Target date


class GoalOut(BaseModel):
    id: int
    name: str
    target_amount: float
    current_amount: float
    target_date: Optional[date]  # TASK 3.5
    created_at: datetime
    progress_percentage: float
    
    # AI predictions (TASK 3.5)
    ai_predicted_completion: Optional[date]
    ai_success_probability: Optional[float]
    ai_recommended_monthly_saving: Optional[float]
    
    class Config:
        orm_mode = True
        from_attributes = True


# ============== VOICE INPUT SCHEMA ==============

class VoiceTransactionCreate(BaseModel):
    """TASK 3.2: Voice input for expenses"""
    audio_data: str  # Base64 encoded audio
    audio_format: str = Field(default="wav", pattern="^(wav|mp3|ogg)$")


class VoiceTransactionResponse(BaseModel):
    """Response from voice transcription"""
    transcribed_text: str
    suggested_transaction: Optional[TransactionCreate]
    confidence: float


# ============== NOTIFICATION SCHEMAS ==============

class NotificationOut(BaseModel):
    id: int
    type: str
    title: str
    message: str
    severity: str
    is_read: bool
    action_required: bool
    created_at: datetime
    
    class Config:
        orm_mode = True
        from_attributes = True


# ============== AI INSIGHTS SCHEMAS ==============

class SpendingInsight(BaseModel):
    """TASK 3.4: AI-generated spending insights"""
    insight_type: str  # 'trend', 'anomaly', 'recommendation', 'alert'
    category: Optional[str]
    message: str
    severity: str  # 'info', 'warning', 'critical'
    suggested_action: Optional[str]
    confidence: float


class BudgetAlert(BaseModel):
    """TASK 3.4: Smart budget alerts"""
    category: str
    budget_amount: float
    current_spending: float
    percentage_used: float
    predicted_overspend: bool
    days_remaining: int
    recommended_daily_limit: float


class BudgetCreate(BaseModel):
    """Create budget request"""
    category_id: int
    amount: float
    month: int
    year: int


class BudgetOut(BaseModel):
    """Budget response"""
    id: int
    category_id: int
    amount: float
    month: int
    year: int
    
    class Config:
        orm_mode = True
        from_attributes = True


# ============== SUMMARY SCHEMAS ==============

class FinancialSummary(BaseModel):
    total_income: float
    total_expense: float
    balance: float
    total_debt: float  # Money you owe
    total_lent_outstanding: float  # Money owed to you
    # Derived metrics
    net_income: float
    savings_rate: float  # 0-1 proportion
    dti_ratio: float  # 0-1 proportion
    financial_health_score: Optional[float]  # 0-100 composite
    
    # Optional AI guidance
    spending_trend: Optional[str]  # 'increasing', 'decreasing', 'stable'
    ai_recommendations: Optional[List[str]]
