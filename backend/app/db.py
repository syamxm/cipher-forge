from motor.motor_asyncio import AsyncIOMotorClient

from .config import settings

client = AsyncIOMotorClient(settings.mongo_uri)
db = client[settings.mongo_db]


async def ensure_indexes() -> None:
    await db.users.create_index("username", unique=True)

    # ---- leaderboard indexes (hateem) ----
    await db.scores.create_index([("difficulty", 1), ("score", -1)])
    await db.scores.create_index("run_id", unique=True)
    # ---- end leaderboard indexes ----
