import asyncio
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

import httpx
from sqlalchemy import func
from sqlalchemy.orm import Session

from config.settings import settings
from models.database_models import Transaction, Category


# ============== CATEGORIZATION ==============

async def categorize_transaction(
    description: str,
    amount: float,
    current_category_id: int
) -> Dict[str, Any]:
    """Categorize a transaction using the AI service."""
    # In production, call your ML model API
    # Example with external AI service:
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.AI_SERVICE_URL}/categorize",
                json={
                    "description": description,
                    "amount": amount,
                    "model": settings.AI_MODEL_CATEGORIZATION
                },
                timeout=5.0
            )
            
            if response.status_code == 200:
                return response.json()
    except Exception as e:
        print(f"AI categorization error: {e}")
    
    # Fallback: return low confidence for current category
    return {
        "suggested_category_id": current_category_id,
        "confidence": 0.5,
        "reasoning": "Default categorization"
    }


# ============== ANOMALY DETECTION ==============

def detect_anomaly(
    user_id: int,
    amount: float,
    category_id: int,
    db: Session
) -> bool:
    """Return True when a transaction deviates significantly from history."""
    # Get last 90 days of transactions in same category
    ninety_days_ago = datetime.utcnow() - timedelta(days=90)
    
    historical_transactions = db.query(Transaction).filter(
        Transaction.owner_id == user_id,
        Transaction.category_id == category_id,
        Transaction.type == 'expense',
        Transaction.date >= ninety_days_ago
    ).all()
    
    if len(historical_transactions) < 3:
        # Not enough data for anomaly detection
        return False
    
    # Calculate mean and standard deviation
    amounts = [t.amount for t in historical_transactions]
    mean_amount = sum(amounts) / len(amounts)
    
    variance = sum((x - mean_amount) ** 2 for x in amounts) / len(amounts)
    std_dev = variance ** 0.5
    
    # Flag as anomaly if >2 standard deviations from mean
    if std_dev > 0:
        z_score = abs(amount - mean_amount) / std_dev
        return z_score > 2.0
    
    return False


# ============== SPENDING PREDICTIONS ==============

async def predict_monthly_spending(
    user_id: int,
    category_id: int,
    db: Session
) -> Dict[str, Any]:
    """Predict current-month spending for a category."""
    # Get historical data
    from sqlalchemy import extract
    from datetime import date
    
    current_month = date.today().month
    current_year = date.today().year
    
    # Get spending for same month in previous years
    historical_months = db.query(
        func.sum(Transaction.amount).label('total')
    ).filter(
        Transaction.owner_id == user_id,
        Transaction.category_id == category_id,
        Transaction.type == 'expense',
        extract('month', Transaction.date) == current_month
    ).group_by(
        extract('year', Transaction.date)
    ).all()
    
    # Get current month spending so far
    current_spending = db.query(
        func.sum(Transaction.amount)
    ).filter(
        Transaction.owner_id == user_id,
        Transaction.category_id == category_id,
        Transaction.type == 'expense',
        extract('month', Transaction.date) == current_month,
        extract('year', Transaction.date) == current_year
    ).scalar() or 0.0
    
    # Simple prediction: average of historical months
    if historical_months:
        avg_spending = sum(m.total for m in historical_months if m.total) / len(historical_months)
        predicted = max(current_spending, avg_spending)
    else:
        predicted = current_spending * 2  # Simple extrapolation
    
    # In production, call ML model for sophisticated prediction
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.AI_SERVICE_URL}/predict",
                json={
                    "user_id": user_id,
                    "category_id": category_id,
                    "current_spending": current_spending,
                    "model": settings.AI_MODEL_PREDICTION
                },
                timeout=5.0
            )
            
            if response.status_code == 200:
                return response.json()
    except Exception as e:
        print(f"AI prediction error: {e}")
    
    # Fallback prediction
    return {
        "predicted_amount": predicted,
        "confidence": 0.6,
        "trend": "stable",
        "recommendation": "Continue monitoring spending"
    }


# ============== GOAL PREDICTIONS ==============

async def predict_goal_completion(
    goal_id: int,
    current_amount: float,
    target_amount: float,
    target_date: Optional[datetime],
    user_id: int,
    db: Session
) -> Dict[str, Any]:
    """Predict goal completion metrics and recommendations."""
    # Calculate savings rate from income/expense history
    last_3_months = datetime.utcnow() - timedelta(days=90)
    
    income = db.query(func.sum(Transaction.amount)).filter(
        Transaction.owner_id == user_id,
        Transaction.type == 'income',
        Transaction.date >= last_3_months
    ).scalar() or 0.0
    
    expense = db.query(func.sum(Transaction.amount)).filter(
        Transaction.owner_id == user_id,
        Transaction.type == 'expense',
        Transaction.date >= last_3_months
    ).scalar() or 0.0
    
    avg_monthly_surplus = (income - expense) / 3.0
    
    remaining_amount = target_amount - current_amount
    
    if avg_monthly_surplus <= 0:
        return {
            "predicted_completion_date": None,
            "success_probability": 0.0,
            "recommended_monthly_saving": remaining_amount / 12,  # Spread over 12 months
            "warning": "Current spending exceeds income. Immediate budget adjustment needed."
        }
    
    months_needed = remaining_amount / avg_monthly_surplus
    predicted_date = datetime.utcnow() + timedelta(days=months_needed * 30)
    
    # Calculate success probability
    if target_date:
        days_until_target = (target_date - datetime.utcnow().date()).days
        months_until_target = days_until_target / 30
        
        if months_until_target > months_needed:
            success_prob = min(0.95, 0.7 + (months_until_target - months_needed) / months_until_target * 0.25)
        else:
            success_prob = max(0.1, 0.7 - (months_needed - months_until_target) / months_needed * 0.6)
    else:
        success_prob = 0.75  # Default probability
    
    recommended_saving = remaining_amount / max(1, months_needed)
    
    return {
        "predicted_completion_date": predicted_date.date(),
        "success_probability": success_prob,
        "recommended_monthly_saving": recommended_saving,
        "warning": None if success_prob > 0.5 else "Goal may not be achievable by target date"
    }


# ============== SPEECH-TO-TEXT ==============

async def transcribe_audio(
    audio_bytes: bytes,
    audio_format: str
) -> Dict[str, Any]:
    """Transcribe audio bytes using the configured speech service."""
    if not settings.SPEECH_TO_TEXT_API_KEY:
        raise ValueError("Speech-to-Text API key not configured")
    
    service = settings.SPEECH_TO_TEXT_SERVICE.lower()
    
    if service == "google":
        return await transcribe_google(audio_bytes, audio_format)
    elif service == "azure":
        return await transcribe_azure(audio_bytes, audio_format)
    elif service == "aws":
        return await transcribe_aws(audio_bytes, audio_format)
    else:
        raise ValueError(f"Unsupported speech service: {service}")


async def transcribe_google(audio_bytes: bytes, audio_format: str) -> Dict[str, Any]:
    """Google Cloud Speech-to-Text"""
    # In production:
    # from google.cloud import speech
    # client = speech.SpeechClient()
    # ...
    
    # Placeholder implementation
    return {
        "text": "Sample transcription: I spent 500 rupees on groceries",
        "confidence": 0.85,
        "service": "google"
    }


async def transcribe_azure(audio_bytes: bytes, audio_format: str) -> Dict[str, Any]:
    """Azure Speech Service"""
    # Placeholder
    return {
        "text": "Sample transcription",
        "confidence": 0.80,
        "service": "azure"
    }


async def transcribe_aws(audio_bytes: bytes, audio_format: str) -> Dict[str, Any]:
    """AWS Transcribe"""
    # Placeholder
    return {
        "text": "Sample transcription",
        "confidence": 0.82,
        "service": "aws"
    }


# ============== SPENDING INSIGHTS ==============

async def generate_spending_insights(
    user_id: int,
    db: Session
) -> List[Dict[str, Any]]:
    """Generate AI-powered spending insights for the user."""
    insights = []
    
    # Check for unusual spending (anomalies flagged this month)
    current_month_start = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0)
    
    anomalies = db.query(Transaction).filter(
        Transaction.owner_id == user_id,
        Transaction.is_anomaly == True,
        Transaction.date >= current_month_start
    ).all()
    
    if anomalies:
        insights.append({
            "type": "anomaly",
            "severity": "warning",
            "message": f"Detected {len(anomalies)} unusual transactions this month",
            "recommendation": "Review these transactions for accuracy"
        })
    
    # Check recurring expenses
    # Add more sophisticated insights...
    
    return insights
