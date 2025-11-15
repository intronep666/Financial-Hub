"""
Configuration module for Kryptos Finance backend services.
Supports both PostgreSQL (production) and SQLite (development).
"""

import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # Application
    APP_NAME: str = "Kryptos Finance API"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", os.urandom(32).hex())
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Cookie Settings (for secure JWT storage)
    COOKIE_NAME: str = "kryptos_finance_token"
    COOKIE_SECURE: bool = os.getenv("COOKIE_SECURE", "false").lower() == "true"  # False for localhost dev, True for HTTPS production
    COOKIE_HTTPONLY: bool = True  # Prevent JavaScript access
    COOKIE_SAMESITE: str = "lax"  # CSRF protection
    COOKIE_MAX_AGE: int = 60 * 60 * 24  # 24 hours in seconds
    
    # Database - PostgreSQL (Production)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
    "postgresql://user:password@localhost:5432/financial_hub"
    )
    
    # Database - SQLite (Development fallback)
    USE_SQLITE: bool = os.getenv("USE_SQLITE", "false").lower() == "true"
    SQLITE_URL: str = "sqlite:///./finance.db"

    # Background jobs
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    CELERY_BROKER_URL: Optional[str] = os.getenv("CELERY_BROKER_URL")
    CELERY_RESULT_BACKEND: Optional[str] = os.getenv("CELERY_RESULT_BACKEND")

    # Observability
    SENTRY_DSN: Optional[str] = os.getenv("SENTRY_DSN")
    SENTRY_TRACES_SAMPLE_RATE: float = float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0.2"))
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://your-production-domain.com"
    ]
    
    # Real-time Streaming (Kafka/Kinesis)
    KAFKA_BOOTSTRAP_SERVERS: str = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
    KAFKA_TOPIC_TRANSACTIONS: str = "kryptos-finance-transactions"
    KAFKA_TOPIC_NOTIFICATIONS: str = "kryptos-finance-notifications"
    
    # AI/ML Service
    AI_SERVICE_URL: str = os.getenv("AI_SERVICE_URL", "http://localhost:8001")
    AI_MODEL_CATEGORIZATION: str = "expense-categorization-v1"
    AI_MODEL_PREDICTION: str = "spending-prediction-v1"
    
    # Speech-to-Text Service
    SPEECH_TO_TEXT_API_KEY: str = os.getenv("SPEECH_TO_TEXT_API_KEY", "")
    SPEECH_TO_TEXT_SERVICE: str = os.getenv("SPEECH_TO_TEXT_SERVICE", "google")  # google, azure, aws
    
    @property
    def db_url(self) -> str:
        """Return appropriate database URL based on environment"""
        return self.SQLITE_URL if self.USE_SQLITE else self.DATABASE_URL

    @property
    def celery_broker_url(self) -> str:
        return self.CELERY_BROKER_URL or self.REDIS_URL

    @property
    def celery_result_backend(self) -> str:
        return self.CELERY_RESULT_BACKEND or self.REDIS_URL

    @property
    def is_sentry_enabled(self) -> bool:
        return bool(self.SENTRY_DSN)
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
