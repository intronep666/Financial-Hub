from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, and_
from typing import List, Optional
from datetime import datetime, timedelta, date

from config.database import get_db
from models.database_models import User, Notification, Transaction, Budget, Loan
from models.schemas import NotificationOut, SpendingInsight, BudgetAlert
from services.auth_service import get_current_user_from_cookie
from services.streaming_service import publish_notification_event
from services.ai_service import generate_spending_insights, predict_monthly_spending

router = APIRouter(prefix="/notifications", tags=["Notifications"])


# ============== NOTIFICATION CREATION ==============

def create_notification(
    user_id: int,
    type: str,
    title: str,
    message: str,
    severity: str = "info",
    action_required: bool = False,
    db: Session = None
):
    """Create a notification record and publish it."""
    notification = Notification(
        owner_id=user_id,
        type=type,
        title=title,
        message=message,
        severity=severity,
        action_required=action_required
    )
    
    db.add(notification)
    db.commit()
    db.refresh(notification)
    
    # Publish to real-time stream for instant delivery
    publish_notification_event(
        event_type=f"notification.{type}",
        user_id=user_id,
        notification_data={
            "id": notification.id,
            "title": title,
            "message": message,
            "severity": severity
        }
    )
    
    return notification


# ============== API ENDPOINTS ==============

@router.get("/", response_model=List[NotificationOut])
def get_notifications(
    skip: int = 0,
    limit: int = 50,
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_cookie)
):
    """Get all notifications for current user"""
    query = db.query(Notification).filter(Notification.owner_id == current_user.id)
    
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    notifications = query.order_by(
        Notification.created_at.desc()
    ).offset(skip).limit(limit).all()
    
    return notifications


@router.post("/{notification_id}/read")
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_cookie)
):
    """Mark notification as read"""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.owner_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    notification.is_read = True
    db.commit()
    
    return {"message": "Notification marked as read"}


@router.post("/read-all")
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_cookie)
):
    """Mark all notifications as read"""
    db.query(Notification).filter(
        Notification.owner_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    
    db.commit()
    
    return {"message": "All notifications marked as read"}


# ============== AI-POWERED INSIGHTS ==============

@router.get("/insights", response_model=List[SpendingInsight])
async def get_spending_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_cookie)
):
    """Return AI-generated spending insights for the user."""
    insights = await generate_spending_insights(
        user_id=current_user.id,
        db=db
    )
    
    return [SpendingInsight(**insight) for insight in insights]


@router.get("/budget-alerts", response_model=List[BudgetAlert])
async def get_budget_alerts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_cookie)
):
    """Return predictive budget alerts for the current month."""
    from models.database_models import Category
    
    current_month = datetime.utcnow().month
    current_year = datetime.utcnow().year
    
    # Get all budgets for current month
    budgets = db.query(Budget).join(Category).filter(
        Category.owner_id == current_user.id,
        Budget.month == current_month,
        Budget.year == current_year
    ).all()
    
    alerts = []
    
    for budget in budgets:
        # Get current spending in this category
        current_spending = db.query(func.sum(Transaction.amount)).filter(
            Transaction.owner_id == current_user.id,
            Transaction.category_id == budget.category_id,
            Transaction.type == 'expense',
            extract('month', Transaction.date) == current_month,
            extract('year', Transaction.date) == current_year
        ).scalar() or 0.0
        
        percentage_used = (current_spending / budget.amount) * 100 if budget.amount > 0 else 0
        
        # Get AI prediction for end-of-month spending
        prediction = await predict_monthly_spending(
            user_id=current_user.id,
            category_id=budget.category_id,
            db=db
        )
        
        predicted_amount = prediction.get("predicted_amount", current_spending)
        predicted_overspend = predicted_amount > budget.amount
        
        # Calculate days remaining in month
        today = datetime.utcnow().date()
        last_day = date(today.year, today.month + 1, 1) - timedelta(days=1) if today.month < 12 else date(today.year, 12, 31)
        days_remaining = (last_day - today).days + 1
        
        # Calculate recommended daily limit
        remaining_budget = budget.amount - current_spending
        recommended_daily = remaining_budget / max(1, days_remaining) if remaining_budget > 0 else 0
        
        # Create alert if threshold exceeded
        if percentage_used >= budget.alert_threshold * 100:
            alert = BudgetAlert(
                category=budget.category.name,
                budget_amount=budget.amount,
                current_spending=current_spending,
                percentage_used=percentage_used,
                predicted_overspend=predicted_overspend,
                days_remaining=days_remaining,
                recommended_daily_limit=recommended_daily
            )
            
            alerts.append(alert)
            
            # Create notification if not already sent today
            today_start = datetime.utcnow().replace(hour=0, minute=0, second=0)
            existing = db.query(Notification).filter(
                Notification.owner_id == current_user.id,
                Notification.type == 'budget_alert',
                Notification.created_at >= today_start,
                Notification.message.contains(budget.category.name)
            ).first()
            
            if not existing:
                severity = 'critical' if predicted_overspend else 'warning'
                create_notification(
                    user_id=current_user.id,
                    type='budget_alert',
                    title=f"⚠️ Budget Alert: {budget.category.name}",
                    message=f"You've used {percentage_used:.1f}% of your {budget.category.name} budget. " +
                            (f"Predicted to overspend by ₹{predicted_amount - budget.amount:.2f}" if predicted_overspend 
                             else f"Stay under ₹{recommended_daily:.2f}/day to stay on budget"),
                    severity=severity,
                    action_required=predicted_overspend,
                    db=db
                )
    
    return alerts


@router.post("/check-recurring-bills")
async def check_recurring_bills(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_cookie)
):
    """Create reminders for upcoming recurring bills."""
    # Get transactions marked as recurring
    recurring = db.query(Transaction).filter(
        Transaction.owner_id == current_user.id,
        Transaction.is_recurring == True
    ).all()
    
    # Group by description/amount to find patterns
    from collections import defaultdict
    patterns = defaultdict(list)
    
    for trans in recurring:
        key = (trans.description, trans.amount, trans.category_id)
        patterns[key].append(trans.date)
    
    reminders_created = 0
    
    for (desc, amount, cat_id), dates in patterns.items():
        if len(dates) >= 2:
            # Calculate average interval
            dates_sorted = sorted(dates)
            intervals = [(dates_sorted[i+1] - dates_sorted[i]).days 
                        for i in range(len(dates_sorted)-1)]
            
            avg_interval = sum(intervals) / len(intervals)
            
            # Predict next due date
            last_date = dates_sorted[-1]
            next_due = last_date + timedelta(days=avg_interval)
            
            # If due within next 3 days, create reminder
            days_until_due = (next_due - datetime.utcnow()).days
            
            if 0 <= days_until_due <= 3:
                # Check if reminder already exists
                existing = db.query(Notification).filter(
                    Notification.owner_id == current_user.id,
                    Notification.type == 'reminder',
                    Notification.message.contains(desc),
                    Notification.created_at >= datetime.utcnow() - timedelta(days=1)
                ).first()
                
                if not existing:
                    create_notification(
                        user_id=current_user.id,
                        type='reminder',
                        title=f"🔔 Bill Reminder: {desc}",
                        message=f"Your recurring payment of ₹{amount:.2f} is due in {days_until_due} days",
                        severity='info',
                        action_required=True,
                        db=db
                    )
                    reminders_created += 1
    
    return {
        "message": f"Created {reminders_created} bill reminders",
        "reminders_created": reminders_created
    }


@router.post("/check-loan-due-dates")
async def check_loan_due_dates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_cookie)
):
    """Create reminders for upcoming loan payments."""
    # Get loans with due dates
    upcoming_dues = db.query(Loan).filter(
        Loan.owner_id == current_user.id,
        Loan.due_date != None,
        Loan.due_date >= date.today(),
        Loan.due_date <= date.today() + timedelta(days=7),
        Loan.paid < Loan.amount  # Not fully paid
    ).all()
    
    reminders_created = 0
    
    for loan in upcoming_dues:
        days_until_due = (loan.due_date - date.today()).days
        
        # Check if reminder already exists
        existing = db.query(Notification).filter(
            Notification.owner_id == current_user.id,
            Notification.type == 'reminder',
            Notification.message.contains(loan.name),
            Notification.created_at >= datetime.utcnow() - timedelta(days=1)
        ).first()
        
        if not existing:
            severity = 'critical' if days_until_due <= 1 else 'warning'
            
            create_notification(
                user_id=current_user.id,
                type='reminder',
                title=f"💳 Loan Due: {loan.name}",
                message=f"Payment of ₹{loan.remaining:.2f} due in {days_until_due} days",
                severity=severity,
                action_required=True,
                db=db
            )
            reminders_created += 1
    
    return {
        "message": f"Created {reminders_created} loan reminders",
        "reminders_created": reminders_created
    }
