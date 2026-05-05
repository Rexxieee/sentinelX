import asyncio
from database import AsyncSessionLocal
from sqlalchemy import select
from models import User
from auth import get_password_hash

async def reset_password(username, new_password):
    async with AsyncSessionLocal() as session:
        query = select(User).where(User.username == username)
        result = await session.execute(query)
        user = result.scalar_one_or_none()
        
        if user:
            user.password_hash = get_password_hash(new_password)
            await session.commit()
            print(f"Password for {username} reset successfully to {new_password}")
        else:
            print(f"User {username} not found")

if __name__ == "__main__":
    asyncio.run(reset_password("admin", "admin123"))
