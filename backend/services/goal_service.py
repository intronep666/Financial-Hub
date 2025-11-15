from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Optional
from datetime import datetime, date

from config.database import get_db
from models.database_models import User, Goal, Budget, Transaction, Category
from models.schemas import GoalCreate, GoalOut
from services.auth_service import get_current_user_from_cookie
from services.ai_service import predict_goal_completion
from services.financial_formulas import required_contribution, fv_periodic, periodic_rate, total_periods

router = APIRouter(prefix="/goals", tags=["Goals & Budgets"])


# ============== GOALS ENDPOINTS ==============

@router.post("/", response_model=GoalOut, status_code=status.HTTP_201_CREATED)
async def create_goal(
    goal: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_cookie)
):
    """Create a savings goal and apply AI predictions."""
    # Create goal
    db_goal = Goal(
        name=goal.name,
        target_amount=goal.target_amount,
        current_amount=goal.current_amount,
        target_date=goal.target_date,  # TASK 3.5
        owner_id=current_user.id
    )
    
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    
    # Enhanced prediction logic: attempt deterministic savings recommendation first
    if goal.target_date:
        try:
            # Assume configurable annual nominal rate for savings growth (fallback 0%)
            annual_rate = 0.0  # Could later come from user profile / settings
            periods_per_year = 12
            rate_per_period = periodic_rate(annual_rate, periods_per_year)
            # Compute remaining periods until target date
            days_until_target = (goal.target_date - datetime.utcnow().date()).days
            months_until_target = max(1, int(days_until_target / 30))
            periods = months_until_target
            remaining_amount = max(0, goal.target_amount - goal.current_amount)
            # Required monthly contribution ignoring investment growth (rate may be zero)
            recommended = required_contribution(remaining_amount, rate_per_period, periods)
            db_goal.ai_recommended_monthly_saving = float(recommended)
        except Exception:
            db_goal.ai_recommended_monthly_saving = None
        # Fallback to existing heuristic for completion date and probability
        prediction = await predict_goal_completion(
            goal_id=db_goal.id,
            current_amount=db_goal.current_amount,
            target_amount=db_goal.target_amount,
            target_date=goal.target_date,
            user_id=current_user.id,
            db=db
        )
        db_goal.ai_predicted_completion = prediction.get("predicted_completion_date")
        db_goal.ai_success_probability = prediction.get("success_probability")
        db.commit()
        db.refresh(db_goal)
    
    return db_goal


@router.get("/", response_model=List[GoalOut])
async def get_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_cookie)
):
    """Return all goals for the user with AI predictions."""
    goals = db.query(Goal).filter(Goal.owner_id == current_user.id).all()
    
    # Refresh AI predictions & deterministic recommendation
    for goal in goals:
        if goal.target_date:
            try:
                annual_rate = 0.0
                periods_per_year = 12
                rate_per_period = periodic_rate(annual_rate, periods_per_year)
                days_until_target = (goal.target_date - datetime.utcnow().date()).days
                months_until_target = max(1, int(days_until_target / 30))
                remaining_amount = max(0, goal.target_amount - goal.current_amount)
                goal.ai_recommended_monthly_saving = float(required_contribution(remaining_amount, rate_per_period, months_until_target))
            except Exception:
                goal.ai_recommended_monthly_saving = None
            prediction = await predict_goal_completion(
                goal_id=goal.id,
                current_amount=goal.current_amount,
                target_amount=goal.target_amount,
                target_date=goal.target_date,
                user_id=current_user.id,
                db=db
            )
            goal.ai_predicted_completion = prediction.get("predicted_completion_date")
            goal.ai_success_probability = prediction.get("success_probability")
    
    db.commit()
    
    return goals


@router.get("/{goal_id}", response_model=GoalOut)
async def get_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_cookie)
):
    """Get a specific goal with AI predictions"""
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.owner_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    # Get latest AI prediction
    if goal.target_date:
        prediction = await predict_goal_completion(
            goal_id=goal.id,
            current_amount=goal.current_amount,
            target_amount=goal.target_amount,
            target_date=goal.target_date,
            user_id=current_user.id,
            db=db
        )
        
        goal.ai_predicted_completion = prediction.get("predicted_completion_date")
        goal.ai_success_probability = prediction.get("success_probability")
        goal.ai_recommended_monthly_saving = prediction.get("recommended_monthly_saving")
        
        db.commit()
    
    return goal


@router.put("/{goal_id}", response_model=GoalOut)
async def update_goal(
    goal_id: int,
    goal_update: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_cookie)
):
    """Update a goal and recalculate AI predictions"""
    db_goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.owner_id == current_user.id
    ).first()
    
    if not db_goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    # Update fields
    db_goal.name = goal_update.name
    db_goal.target_amount = goal_update.target_amount
    db_goal.current_amount = goal_update.current_amount
    db_goal.target_date = goal_update.target_date
    
    db.commit()
    db.refresh(db_goal)
    
    # Recalculate deterministic recommendation and AI predictions
    if db_goal.target_date:
        try:
            annual_rate = 0.0
            periods_per_year = 12
            rate_per_period = periodic_rate(annual_rate, periods_per_year)
            days_until_target = (db_goal.target_date - datetime.utcnow().date()).days
            months_until_target = max(1, int(days_until_target / 30))
            remaining_amount = max(0, db_goal.target_amount - db_goal.current_amount)
            db_goal.ai_recommended_monthly_saving = float(required_contribution(remaining_amount, rate_per_period, months_until_target))
        except Exception:
            db_goal.ai_recommended_monthly_saving = None
        prediction = await predict_goal_completion(
            goal_id=db_goal.id,
            current_amount=db_goal.current_amount,
            target_amount=db_goal.target_amount,
            target_date=db_goal.target_date,
            user_id=current_user.id,
            db=db
        )
        db_goal.ai_predicted_completion = prediction.get("predicted_completion_date")
        db_goal.ai_success_probability = prediction.get("success_probability")
        db.commit()
        db.refresh(db_goal)
    
    return db_goal


@router.post("/{goal_id}/contribute")
async def contribute_to_goal(
    goal_id: int,
    amount: float,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_cookie)
):
    """Add a contribution and update goal predictions."""
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.owner_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contribution must be positive"
        )
    
    # Add contribution
    goal.current_amount += amount
    
    # Don't exceed target
    if goal.current_amount > goal.target_amount:
        goal.current_amount = goal.target_amount
    
    # Recalculate predictions
    if goal.target_date:
        try:
            annual_rate = 0.0
            periods_per_year = 12
            rate_per_period = periodic_rate(annual_rate, periods_per_year)
            days_until_target = (goal.target_date - datetime.utcnow().date()).days
            months_until_target = max(1, int(days_until_target / 30))
            remaining_amount = max(0, goal.target_amount - goal.current_amount)
            goal.ai_recommended_monthly_saving = float(required_contribution(remaining_amount, rate_per_period, months_until_target))
        except Exception:
            goal.ai_recommended_monthly_saving = None
        prediction = await predict_goal_completion(
            goal_id=goal.id,
            current_amount=goal.current_amount,
            target_amount=goal.target_amount,
            target_date=goal.target_date,
            user_id=current_user.id,
            db=db
        )
        goal.ai_predicted_completion = prediction.get("predicted_completion_date")
        goal.ai_success_probability = prediction.get("success_probability")
    
    db.commit()
    db.refresh(goal)
    
    # Check if goal is achieved
    if goal.current_amount >= goal.target_amount:
        # Trigger notification
        from services.notification_service import create_notification
        create_notification(
            user_id=current_user.id,
            type="achievement",
            title="🎉 Goal Achieved!",
            message=f"Congratulations! You've reached your goal: {goal.name}",
            severity="info",
            db=db
        )
    
    return goal


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_cookie)
):
    """Delete a goal"""
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.owner_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    db.delete(goal)
    db.commit()
    
    return None


# ============== BUDGETS ENDPOINTS ==============

from models.schemas import BudgetCreate, BudgetOut

@router.post("/budgets", response_model=BudgetOut, status_code=status.HTTP_201_CREATED)
def create_budget(
    budget: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_cookie)
):
    """Create a budget for a category and month."""
    # Verify category belongs to user
    category = db.query(Category).filter(
        Category.id == budget.category_id,
        Category.owner_id == current_user.id
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Check if budget already exists for this category and month
    existing = db.query(Budget).filter(
        Budget.category_id == budget.category_id,
        Budget.owner_id == current_user.id,
        Budget.month == budget.month,
        Budget.year == budget.year
    ).first()
    
    if existing:
        # Update existing budget
        existing.amount = budget.amount
        db.commit()
        db.refresh(existing)
        return existing
    
    # Create new budget
    db_budget = Budget(
        category_id=budget.category_id,
        amount=budget.amount,
        month=budget.month,
        year=budget.year,
        owner_id=current_user.id
    )
    
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    
    return db_budget


@router.get("/budgets", response_model=List[BudgetOut])
def get_budgets(
    month: Optional[int] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_cookie)
):
    """Return budgets for the user, optionally filtered by month/year."""
    if month is None:
        month = datetime.now().month
    if year is None:
        year = datetime.now().year
    
    budgets = db.query(Budget).filter(
        Budget.owner_id == current_user.id,
        Budget.month == month,
        Budget.year == year
    ).all()
    
    return budgets


@router.get("/budgets/{budget_id}", response_model=BudgetOut)
def get_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_cookie)
):
    """Get a specific budget."""
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.owner_id == current_user.id
    ).first()
    
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    return budget


@router.delete("/budgets/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_cookie)
):
    """Delete a budget."""
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.owner_id == current_user.id
    ).first()
    
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    db.delete(budget)
    db.commit()
    
    return None