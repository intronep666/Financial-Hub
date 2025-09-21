# --- backend/main.py ---

import uvicorn
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Float, ForeignKey, Date, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date
from passlib.context import CryptContext
from jose import JWTError, jwt
import os

# --- Configuration ---
DATABASE_URL = "sqlite:///./finance.db"
SECRET_KEY = os.urandom(32).hex() # In production, use a fixed secret key from env variables
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # Token valid for 1 day

# --- Database Setup (SQLAlchemy) ---
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- Database Models ---
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    transactions = relationship("Transaction", back_populates="owner")
    categories = relationship("Category", back_populates="owner")
    loans = relationship("Loan", back_populates="owner")
    goals = relationship("Goal", back_populates="owner")

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    description = Column(String)
    amount = Column(Float)
    type = Column(String) # 'income' or 'expense'
    date = Column(DateTime, default=datetime.utcnow)
    category_id = Column(Integer, ForeignKey("categories.id"))
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="transactions")
    category = relationship("Category", back_populates="transactions")

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="categories")
    transactions = relationship("Transaction", back_populates="category")
    budget = relationship("Budget", uselist=False, back_populates="category")

class Budget(Base):
    __tablename__ = "budgets"
    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float)
    month = Column(Integer) # 1-12
    year = Column(Integer)
    category_id = Column(Integer, ForeignKey("categories.id"), unique=True)
    category = relationship("Category", back_populates="budget")

class Loan(Base):
    __tablename__ = "loans"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    amount = Column(Float)
    paid = Column(Float, default=0)
    type = Column(String) # 'borrowed' or 'lent'
    date_taken = Column(Date)
    source = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="loans")

class Goal(Base):
    __tablename__ = "goals"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    target_amount = Column(Float)
    current_amount = Column(Float, default=0)
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="goals")

Base.metadata.create_all(bind=engine)

# --- Pydantic Schemas (for API request/response validation) ---
class UserCreate(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TransactionCreate(BaseModel):
    description: str
    amount: float
    type: str
    category_id: int

class CategoryOut(BaseModel):
    id: int
    name: str
    class Config:
        orm_mode = True

class TransactionOut(BaseModel):
    id: int
    description: str
    amount: float
    type: str
    date: datetime
    category: CategoryOut
    class Config:
        orm_mode = True

class LoanCreate(BaseModel):
    name: str
    amount: float
    paid: float
    type: str
    date_taken: date
    source: str

class LoanOut(BaseModel):
    id: int
    name: str
    amount: float
    paid: float
    remaining: float
    type: str
    date_taken: date
    source: str
    class Config:
        orm_mode = True

class GoalCreate(BaseModel):
    name: str
    target_amount: float
    current_amount: float = 0

class GoalOut(BaseModel):
    id: int
    name: str
    target_amount: float
    current_amount: float
    class Config:
        orm_mode = True


# --- FastAPI App Instance ---
app = FastAPI()

# CORS Middleware to allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Adjust for your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Dependency ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Security & Authentication Functions ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    # In a real app, you would add an expiration time `expire`
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

# --- API Endpoints ---

# User Authentication
@app.post("/register", response_model=UserOut)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(user.password)
    new_user = User(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    # Create default categories for new user
    default_categories = ["Food", "Transport", "Shopping", "Bills", "Salary", "Other"]
    for cat_name in default_categories:
        db.add(Category(name=cat_name, owner_id=new_user.id))
    db.commit()
    return new_user

@app.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# Dashboard Summary
@app.get("/summary")
def get_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    income = db.query(Transaction).filter(Transaction.owner_id == current_user.id, Transaction.type == 'income').all()
    expense = db.query(Transaction).filter(Transaction.owner_id == current_user.id, Transaction.type == 'expense').all()
    total_income = sum(t.amount for t in income)
    total_expense = sum(t.amount for t in expense)
    balance = total_income - total_expense

    loans_taken = db.query(Loan).filter(Loan.owner_id == current_user.id, Loan.type == 'borrowed').all()
    loans_lent = db.query(Loan).filter(Loan.owner_id == current_user.id, Loan.type == 'lent').all()
    total_debt = sum(l.amount - l.paid for l in loans_taken)
    total_lent_outstanding = sum(l.amount - l.paid for l in loans_lent)

    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": balance,
        "total_debt": total_debt,
        "total_lent_outstanding": total_lent_outstanding
    }

# Transactions
@app.post("/transactions", response_model=TransactionOut)
def create_transaction(transaction: TransactionCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_transaction = Transaction(**transaction.dict(), owner_id=current_user.id)
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@app.get("/transactions", response_model=List[TransactionOut])
def read_transactions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    transactions = db.query(Transaction).filter(Transaction.owner_id == current_user.id).order_by(Transaction.date.desc()).offset(skip).limit(limit).all()
    return transactions

# Categories
@app.get("/categories", response_model=List[CategoryOut])
def read_categories(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Category).filter(Category.owner_id == current_user.id).all()

# Loans (covers both borrowed and lent)
@app.post("/loans", response_model=LoanOut)
def create_loan(loan: LoanCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_loan = Loan(**loan.dict(), owner_id=current_user.id)
    db.add(db_loan)
    db.commit()
    db.refresh(db_loan)
    # Manually calculate remaining for the response model
    db_loan.remaining = db_loan.amount - db_loan.paid
    return db_loan

@app.get("/loans", response_model=List[LoanOut])
def read_loans(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    loans = db.query(Loan).filter(Loan.owner_id == current_user.id).all()
    for loan in loans:
        loan.remaining = loan.amount - loan.paid
    return loans

# Savings Goals
@app.post("/goals", response_model=GoalOut)
def create_goal(goal: GoalCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_goal = Goal(**goal.dict(), owner_id=current_user.id)
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

@app.get("/goals", response_model=List[GoalOut])
def read_goals(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Goal).filter(Goal.owner_id == current_user.id).all()

# Chart Data Endpoints
@app.get("/charts/expense-by-category")
def get_expense_by_category(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    categories = db.query(Category).filter(Category.owner_id == current_user.id).all()
    data = []
    for category in categories:
        total = sum(t.amount for t in category.transactions if t.type == 'expense')
        if total > 0:
            data.append({"category": category.name, "total": total})
    return data


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)