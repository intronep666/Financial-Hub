"""
Database configuration and session management
Supports PostgreSQL (production) and SQLite (development)
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config.settings import settings

# Create engine with appropriate configuration
if settings.USE_SQLITE:
    # SQLite configuration (development)
    engine = create_engine(
        settings.db_url,
        connect_args={"check_same_thread": False},
        echo=settings.DEBUG
    )
else:
    # PostgreSQL configuration (production)
    engine = create_engine(
        settings.db_url,
        pool_size=10,  # Connection pool for concurrent requests
        max_overflow=20,  # Maximum overflow connections
        pool_pre_ping=True,  # Verify connections before using
        pool_recycle=3600,  # Recycle connections after 1 hour
        echo=settings.DEBUG
    )

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Dependency for FastAPI routes
def get_db():
    """Database session dependency"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
