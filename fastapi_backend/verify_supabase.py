import asyncio
from sqlalchemy import text
from database import engine, Base
import sys

async def test_connection():
    print("Testing connection to Supabase...")
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            print(f"Connection successful! Result: {result.scalar()}")
            
            print("Dropping existing tables for a clean migration...")
            async with engine.begin() as begin_conn:
                await begin_conn.run_sync(Base.metadata.drop_all)
            
            print("Creating tables with new UUID types...")
            async with engine.begin() as begin_conn:
                await begin_conn.run_sync(Base.metadata.create_all)
            print("Tables created successfully.")
            
    except Exception as e:
        print(f"Error connecting to database: {e}")
        sys.exit(1)
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test_connection())
