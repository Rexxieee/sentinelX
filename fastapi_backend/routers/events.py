from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from models import NetworkEvent
import logging

from auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/events", tags=["Network Events"])

@router.get("/recent")
async def get_recent_events(db: AsyncSession = Depends(get_db)):
    """Queries Postgres for the last 100 events, sorted by timestamp descending."""
    try:
        query = select(NetworkEvent).order_by(desc(NetworkEvent.timestamp)).limit(100)
        result = await db.execute(query)
        events = result.scalars().all()
        
        return {"count": len(events), "events": events}
        
    except Exception as e:
        logger.error(f"Unexpected error querying recent events: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while fetching events."
        )
