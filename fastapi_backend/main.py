from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import asyncio
from contextlib import asynccontextmanager

from fastapi.middleware.cors import CORSMiddleware
from database import get_db, engine, Base
from routers import users, alert_rules, incidents, events, auth
from background_tasks import mock_network_log_generator, honeypot_listener
from fastapi import WebSocket, WebSocketDisconnect
from ws_manager import manager
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("server.log")
    ]
)
logger = logging.getLogger("main")

from auth import get_current_user

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables for SQLite if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    # Startup: Start background tasks
    tasks = [
        asyncio.create_task(honeypot_listener())
    ]
    
    yield
    
    # Shutdown: Cancel background tasks
    for task in tasks:
        task.cancel()
    await asyncio.gather(*tasks, return_exceptions=True)

app = FastAPI(
    title="FastAPI Backend Core",
    description="Backend service with Async PostgreSQL.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(alert_rules.router)
app.include_router(incidents.router)
app.include_router(events.router)
app.include_router(auth.router)

@app.get("/health", tags=["Health"])
async def health_check(current_user = Depends(get_current_user)):
    """Basic service health check."""
    return {"status": "healthy"}

@app.websocket("/ws/alerts")
async def websocket_alerts(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/health/db", tags=["Health"])
async def db_health_check(db: AsyncSession = Depends(get_db), current_user = Depends(get_current_user)):
    """Validates the PostgreSQL database connection."""
    try:
        # Simple test query to verify async DB connection
        result = await db.execute(text("SELECT 1"))
        if result.scalar() == 1:
            return {"status": "healthy", "database": "connected"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Database connection failed: {str(e)}"
        )
