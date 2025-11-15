from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from config.database import get_db
from services.auth_service import get_current_user_from_cookie
from models.database_models import Category, User
from models.schemas import CategoryOut

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("/", response_model=List[CategoryOut])
def get_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_cookie)
):
    """Get all categories for the current user."""
    categories = db.query(Category).filter(Category.owner_id == current_user.id).all()
    return categories
