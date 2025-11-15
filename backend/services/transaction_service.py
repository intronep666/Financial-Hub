from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, extract
from typing import List, Optional
from datetime import datetime, date
import json
import base64

from config.database import get_db
from config.settings import settings
from models.database_models import User, Transaction, Category
from models.schemas import TransactionCreate, TransactionOut, VoiceTransactionCreate, VoiceTransactionResponse
from services.auth_service import get_current_user_from_cookie
from services.streaming_service import publish_transaction_event
from services.ai_service import categorize_transaction, detect_anomaly, transcribe_audio
from services.summary_refresh import refresh_financial_summary_view
from tasks.transaction_tasks import (
    publish_transaction_event_task,
    refresh_financial_summary_view_task,
)

router = APIRouter(prefix="/transactions", tags=["Transactions"])


# ============== HELPER FUNCTIONS ==============

def enrich_transaction_with_ai(
    transaction: Transaction,
    db: Session
) -> Transaction:
    """Enrich transaction with categorization and anomaly signals."""
    try:
        # Get AI categorization confidence
        ai_result = categorize_transaction(
            description=transaction.description,
            amount=transaction.amount,
            current_category_id=transaction.category_id
        )
        
        transaction.ai_category_confidence = ai_result.get("confidence", 0.0)
        
        # Check if transaction is anomalous
        is_anomaly = detect_anomaly(
            user_id=transaction.owner_id,
            amount=transaction.amount,
            category_id=transaction.category_id,
            db=db
        )
        
        transaction.is_anomaly = is_anomaly
        
    except Exception as e:
        # Log error but don't fail the transaction
        print(f"AI enrichment error: {e}")
        transaction.ai_category_confidence = 0.0
        transaction.is_anomaly = False
    
    return transaction


def enqueue_summary_refresh():
    """Schedule a summary refresh, falling back to synchronous execution if Celery is unavailable."""
    try:
        refresh_financial_summary_view_task.delay()
    except Exception as exc:  # pragma: no cover - only runs when broker is down
        print(f"Celery refresh dispatch failed, running synchronously: {exc}")
        refresh_financial_summary_view()


def dispatch_transaction_event(event_type: str, transaction_id: int, user_id: int, data: dict):
    """Send streaming events asynchronously with a synchronous fallback."""
    try:
        publish_transaction_event_task.delay(event_type, transaction_id, user_id, data)
    except Exception as exc:  # pragma: no cover - only runs when broker is down
        print(f"Celery event dispatch failed, sending inline: {exc}")
        publish_transaction_event(
            event_type=event_type,
            transaction_id=transaction_id,
            user_id=user_id,
            data=data,
        )


# ============== API ENDPOINTS ==============

@router.post("/", response_model=TransactionOut, status_code=status.HTTP_201_CREATED)
def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_cookie)
):
    """Create a transaction with AI enrichment and streaming events."""
    # Verify category belongs to user
    category = db.query(Category).filter(
        Category.id == transaction.category_id,
        Category.owner_id == current_user.id
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Create transaction
    db_transaction = Transaction(
        description=transaction.description,
        amount=transaction.amount,
        type=transaction.type,
        category_id=transaction.category_id,
        owner_id=current_user.id,
        tags=transaction.tags,  # TASK 3.3: Tags support
        date=transaction.date or datetime.utcnow()
    )
    
    # PHASE 2.3: AI enrichment
    db_transaction = enrich_transaction_with_ai(db_transaction, db)
    
    # Save to database
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    enqueue_summary_refresh()
    
    dispatch_transaction_event(
        event_type="transaction.created",
        transaction_id=db_transaction.id,
        user_id=current_user.id,
        data={
            "description": db_transaction.description,
            "amount": db_transaction.amount,
            "type": db_transaction.type,
            "category": category.name,
            "tags": db_transaction.tags,
            "is_anomaly": db_transaction.is_anomaly
        }
    )
    
    return db_transaction


@router.get("/", response_model=List[TransactionOut])
def get_transactions(
    skip: int = 0,
    limit: int = 100,
    type_filter: Optional[str] = None,
    category_id: Optional[int] = None,
    tag: Optional[str] = None,  # TASK 3.3: Filter by tag
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_cookie)
):
    """Return transactions for the user with optional filters."""
    query = db.query(Transaction).filter(Transaction.owner_id == current_user.id)
    
    # Apply filters
    if type_filter:
        query = query.filter(Transaction.type == type_filter)
    
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    
    if tag:
        # Filter by tag (PostgreSQL ARRAY or JSON)
        if not tag.startswith('#'):
            tag = f'#{tag}'
        query = query.filter(Transaction.tags.contains([tag]))
    
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    
    # Order by date descending
    transactions = query.order_by(Transaction.date.desc()).offset(skip).limit(limit).all()
    
    return transactions


@router.get("/{transaction_id}", response_model=TransactionOut)
def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_cookie)
):
    """Get a specific transaction"""
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.owner_id == current_user.id
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    return transaction


@router.put("/{transaction_id}", response_model=TransactionOut)
def update_transaction(
    transaction_id: int,
    transaction_update: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_cookie)
):
    """Update a transaction"""
    db_transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.owner_id == current_user.id
    ).first()
    
    if not db_transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # Update fields
    db_transaction.description = transaction_update.description
    db_transaction.amount = transaction_update.amount
    db_transaction.type = transaction_update.type
    db_transaction.category_id = transaction_update.category_id
    db_transaction.tags = transaction_update.tags
    
    if transaction_update.date:
        db_transaction.date = transaction_update.date
    
    # Re-run AI enrichment
    db_transaction = enrich_transaction_with_ai(db_transaction, db)
    
    db.commit()
    db.refresh(db_transaction)
    enqueue_summary_refresh()
    
    dispatch_transaction_event(
        event_type="transaction.updated",
        transaction_id=db_transaction.id,
        user_id=current_user.id,
        data={"description": db_transaction.description}
    )
    
    return db_transaction


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_cookie)
):
    """Delete a transaction"""
    db_transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.owner_id == current_user.id
    ).first()
    
    if not db_transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    db.delete(db_transaction)
    db.commit()
    enqueue_summary_refresh()
    
    dispatch_transaction_event(
        event_type="transaction.deleted",
        transaction_id=transaction_id,
        user_id=current_user.id,
        data={}
    )
    
    return None


@router.post("/voice", response_model=VoiceTransactionResponse)
async def create_transaction_from_voice(
    voice_data: VoiceTransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_cookie)
):
    """Create a transaction draft from voice input."""
    try:
        # Decode audio data
        audio_bytes = base64.b64decode(voice_data.audio_data)
        
        # Transcribe audio to text
        transcription_result = await transcribe_audio(
            audio_bytes=audio_bytes,
            audio_format=voice_data.audio_format
        )
        
        transcribed_text = transcription_result.get("text", "")
        confidence = transcription_result.get("confidence", 0.0)
        
        # Use AI to parse transaction from text
        # Example: "I spent 500 rupees on groceries"
        suggested_transaction = await parse_transaction_from_text(
            text=transcribed_text,
            user_id=current_user.id,
            db=db
        )
        
        return VoiceTransactionResponse(
            transcribed_text=transcribed_text,
            suggested_transaction=suggested_transaction,
            confidence=confidence
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Voice processing error: {str(e)}"
        )


@router.get("/tags/popular", response_model=List[str])
def get_popular_tags(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_cookie)
):
    """Return the user's most frequently used tags."""
    # Get all user transactions with tags
    transactions = db.query(Transaction).filter(
        Transaction.owner_id == current_user.id,
        Transaction.tags != None
    ).all()
    
    # Count tag frequency
    tag_frequency = {}
    for transaction in transactions:
        for tag in transaction.tags:
            tag_frequency[tag] = tag_frequency.get(tag, 0) + 1
    
    # Sort by frequency and return top tags
    popular_tags = sorted(tag_frequency.items(), key=lambda x: x[1], reverse=True)
    return [tag for tag, count in popular_tags[:limit]]


async def parse_transaction_from_text(text: str, user_id: int, db: Session) -> Optional[TransactionCreate]:
    """Parse natural language into a proposed transaction."""
    # This would call your AI service
    # For now, return None as placeholder
    return None
