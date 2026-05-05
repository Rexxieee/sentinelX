from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


# Load from environment variables, fallback to local dev DB
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "sqlite+aiosqlite:///./fastapi_db.db"
)

# Async engine setup
engine = create_async_engine(
    DATABASE_URL,
    echo=False, # Set to True for SQL query logging
    future=True,
    connect_args={
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0
    }
)

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False,
    autoflush=False
)

# Base class for SQLAlchemy models
Base = declarative_base()

# Dependency for FastAPI
async def get_db():
    """Provides a database session for a request."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
