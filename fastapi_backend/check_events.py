import asyncio
from database import AsyncSessionLocal
from models import NetworkEvent
from sqlalchemy import select

async def check_events():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(NetworkEvent).order_by(NetworkEvent.timestamp.desc()).limit(5))
        events = result.scalars().all()
        for e in events:
            print(f"Time: {e.timestamp}, IP: {e.source_ip}, Port: {e.port}, Action: {e.event_action}")

if __name__ == "__main__":
    asyncio.run(check_events())
