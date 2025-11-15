from fastapi import APIRouter, Depends, HTTPException, status, Response, Cookie
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional

from config.database import get_db
from config.settings import settings
from models.database_models import User
from models.schemas import UserCreate, UserOut, Token

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Password hashing
# Using Argon2 for modern, secure password hashing without the 72-byte limit of bcrypt.
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# OAuth2 scheme (will read from cookie instead of Authorization header)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token", auto_error=False)


# ============== HELPER FUNCTIONS ==============

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash password using Argon2."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token with expiration."""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    return encoded_jwt


def get_current_user_from_cookie(
    token: Optional[str] = Cookie(None, alias=settings.COOKIE_NAME),
    db: Session = Depends(get_db)
) -> User:
    """Return the authenticated user from the secure cookie."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        raise credentials_exception
    
    try:
        # Decode JWT from cookie
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        
        if username is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    # Fetch user from database
    user = db.query(User).filter(User.username == username).first()
    
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    return user


# ============== API ENDPOINTS ==============

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """Register a user and seed default categories."""
    try:
        print(f"[DEBUG] Registration request for: {user.username}, {user.email}")
        
        # Check if username exists
        db_user = db.query(User).filter(User.username == user.username).first()
        if db_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        
        # Check if email exists (if provided)
        if user.email:
            db_email = db.query(User).filter(User.email == user.email).first()
            if db_email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
        
        print("[DEBUG] Creating user...")
        # Create new user
        hashed_password = get_password_hash(user.password)
        new_user = User(
            username=user.username,
            email=user.email,
            hashed_password=hashed_password
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        print(f"[DEBUG] User created with ID: {new_user.id}")
        
        # Create default categories
        from models.database_models import Category
        default_categories = [
            {"name": "Food", "icon": "🍔", "color": "#FF6384"},
        {"name": "Transport", "icon": "🚗", "color": "#36A2EB"},
        {"name": "Shopping", "icon": "🛍️", "color": "#FFCE56"},
        {"name": "Bills", "icon": "💡", "color": "#4BC0C0"},
        {"name": "Salary", "icon": "💰", "color": "#9966FF"},
        {"name": "Other", "icon": "📦", "color": "#FF9F40"}
    ]
    
        for cat_data in default_categories:
            db.add(Category(
                name=cat_data["name"],
                icon=cat_data["icon"],
                color=cat_data["color"],
                owner_id=new_user.id
            ))
        
        db.commit()
        
        print(f"[DEBUG] Created {len(default_categories)} categories")
        return new_user
        
    except Exception as e:
        print(f"[ERROR] Registration failed: {str(e)}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/token", response_model=Token)
def login_for_access_token(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Authenticate user and issue a secure session cookie."""
    # Authenticate user
    user = db.query(User).filter(User.username == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires
    )
    
    # CRITICAL: Set token as secure httpOnly cookie
    response.set_cookie(
        key=settings.COOKIE_NAME,
        value=access_token,
        httponly=settings.COOKIE_HTTPONLY,  # Prevents JavaScript access
        secure=settings.COOKIE_SECURE,  # HTTPS only (set False for localhost dev)
        samesite=settings.COOKIE_SAMESITE,  # CSRF protection
        max_age=settings.COOKIE_MAX_AGE,
        path="/"
    )
    
    # BUG FIX #1: Return proper Token response with success indicator
    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        username=user.username
    )


@router.post("/logout")
def logout(response: Response):
    """Clear the authentication cookie for logout."""
    response.delete_cookie(
        key=settings.COOKIE_NAME,
        path="/"
    )
    
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserOut)
def get_current_user_info(
    current_user: User = Depends(get_current_user_from_cookie)
):
    """Return details for the authenticated user."""
    return current_user


@router.post("/refresh")
def refresh_token(
    response: Response,
    current_user: User = Depends(get_current_user_from_cookie)
):
    """Refresh the session cookie with a new token."""
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": current_user.username},
        expires_delta=access_token_expires
    )
    
    response.set_cookie(
        key=settings.COOKIE_NAME,
        value=access_token,
        httponly=settings.COOKIE_HTTPONLY,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=settings.COOKIE_MAX_AGE,
        path="/"
    )
    
    return {"message": "Token refreshed successfully"}
