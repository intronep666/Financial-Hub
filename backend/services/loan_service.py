from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from config.database import get_db
from services.auth_service import get_current_user_from_cookie
from models.database_models import Loan, User
from models.schemas import LoanCreate, LoanOut

router = APIRouter(prefix="/loans", tags=["Loans"])


@router.get("/", response_model=List[LoanOut])
def get_loans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_cookie)
):
    """Get all loans for the current user."""
    loans = db.query(Loan).filter(Loan.owner_id == current_user.id).all()
    return loans


@router.post("/", response_model=LoanOut, status_code=status.HTTP_201_CREATED)
def create_loan(
    loan: LoanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_cookie)
):
    """Create a new loan."""
    db_loan = Loan(
        owner_id=current_user.id,
        name=loan.name,
        amount=loan.amount,
        paid=loan.paid if loan.paid is not None else 0.0,
        type=loan.type,
        date_taken=loan.date_taken,
        source=loan.source,
        annual_interest_rate=loan.annual_interest_rate,
        term_years=loan.term_years,
        periods_per_year=loan.periods_per_year if loan.periods_per_year else 12
    )
    
    db.add(db_loan)
    db.commit()
    db.refresh(db_loan)
    return db_loan


@router.get("/{loan_id}", response_model=LoanOut)
def get_loan(
    loan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_cookie)
):
    """Get a specific loan by ID."""
    loan = db.query(Loan).filter(
        Loan.id == loan_id,
        Loan.owner_id == current_user.id
    ).first()
    
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan not found"
        )
    
    return loan


@router.put("/{loan_id}", response_model=LoanOut)
def update_loan(
    loan_id: int,
    loan_update: LoanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_cookie)
):
    """Update a loan."""
    db_loan = db.query(Loan).filter(
        Loan.id == loan_id,
        Loan.owner_id == current_user.id
    ).first()
    
    if not db_loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan not found"
        )
    
    # Update fields
    db_loan.name = loan_update.name
    db_loan.amount = loan_update.amount
    db_loan.paid = loan_update.paid if loan_update.paid is not None else db_loan.paid
    db_loan.type = loan_update.type
    db_loan.date_taken = loan_update.date_taken
    db_loan.source = loan_update.source
    db_loan.annual_interest_rate = loan_update.annual_interest_rate
    db_loan.term_years = loan_update.term_years
    db_loan.periods_per_year = loan_update.periods_per_year if loan_update.periods_per_year else 12
    
    db.commit()
    db.refresh(db_loan)
    return db_loan


@router.delete("/{loan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_loan(
    loan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_cookie)
):
    """Delete a loan."""
    db_loan = db.query(Loan).filter(
        Loan.id == loan_id,
        Loan.owner_id == current_user.id
    ).first()
    
    if not db_loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan not found"
        )
    
    db.delete(db_loan)
    db.commit()
    return None
