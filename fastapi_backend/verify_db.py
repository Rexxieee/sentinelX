import asyncio
from sqlalchemy import select, func
from database import AsyncSessionLocal
from models import NetworkEvent

async def check_count():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(func.count(NetworkEvent.id)))
        count = result.scalar()
        print(f"Network events count: {count}")

if __name__ == "__main__":
    asyncio.run(check_count())
