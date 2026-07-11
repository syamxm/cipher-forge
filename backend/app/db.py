from motor.motor_asyncio import AsyncIOMotorClient

from .config import settings

client = AsyncIOMotorClient(settings.mongo_uri)
db = client[settings.mongo_db]


async def ensure_indexes() -> None:
    await db.users.create_index("username", unique=True)
    await db.runs.create_index([("user_id", 1), ("status", 1)])
