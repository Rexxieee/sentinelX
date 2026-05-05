import asyncio
from database import AsyncSessionLocal
from sqlalchemy import select
from models import User

async def list_users():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User))
        users = result.scalars().all()
        for u in users:
            print(f"User: {u.username}, Email: {u.email}, Role: {u.role}")

if __name__ == "__main__":
    asyncio.run(list_users())
