import asyncio
import sys
import os
from datetime import datetime, timezone
from bson import ObjectId

# Ensure the backend directory is in the path so app.* imports resolve 
# even if run directly as python scripts/seed_leaderboard.py
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db import db, ensure_indexes

async def main():
    print("Ensuring database indexes...")
    await ensure_indexes()

    print("Cleaning up previously seeded data...")
    await db.runs.delete_many({"seed": True})
    await db.scores.delete_many({"seed": True})

    now = datetime.now(timezone.utc)
    fake_user_1 = ObjectId("507f1f77bcf86cd799439011")
    fake_user_2 = ObjectId("507f191e810c19729de860ea")
    fake_user_3 = ObjectId("507f191e810c19729de860eb")

    runs = [
        {
            "user_id": fake_user_1,
            "username": "tux",
            "difficulty": "easy",
            "status": "completed",
            "started_at": now,
            "completed_at": now,
            "elapsed_sec": 35.1,
            "seed": True
        },
        {
            "user_id": fake_user_1,
            "username": "tux",
            "difficulty": "medium",
            "status": "completed",
            "started_at": now,
            "completed_at": now,
            "elapsed_sec": 105.0,
            "seed": True
        },
        {
            "user_id": fake_user_2,
            "username": "neo",
            "difficulty": "easy",
            "status": "completed",
            "started_at": now,
            "completed_at": now,
            "elapsed_sec": 40.2,
            "seed": True
        },
        {
            "user_id": fake_user_2,
            "username": "neo",
            "difficulty": "hard",
            "status": "completed",
            "started_at": now,
            "completed_at": now,
            "elapsed_sec": 115.8,
            "seed": True
        },
        {
            "user_id": fake_user_3,
            "username": "root",
            "difficulty": "medium",
            "status": "completed",
            "started_at": now,
            "completed_at": now,
            "elapsed_sec": 125.0,
            "seed": True
        },
        {
            "user_id": fake_user_3,
            "username": "root",
            "difficulty": "hard",
            "status": "completed",
            "started_at": now,
            "completed_at": now,
            "elapsed_sec": 89.4,
            "seed": True
        }
    ]

    print("Inserting fake completed runs...")
    result = await db.runs.insert_many(runs)

    print("\n----------------------------------------------------")
    print("Inserted Run IDs (POST these to /game/score):")
    for rid in result.inserted_ids:
        print(f"  {rid}")
    print("----------------------------------------------------\n")

    print("Inserting ready-made scores for other users...")
    scores = [
        {
            "run_id": str(ObjectId()),
            "user_id": ObjectId(),
            "username": "alice",
            "difficulty": "easy",
            "score": 855,
            "elapsed_sec": 35.0,
            "created_at": now,
            "seed": True
        },
        {
            "run_id": str(ObjectId()),
            "user_id": ObjectId(),
            "username": "bob",
            "difficulty": "medium",
            "score": 380,
            "elapsed_sec": 94.7,
            "created_at": now,
            "seed": True
        },
        {
            "run_id": str(ObjectId()),
            "user_id": ObjectId(),
            "username": "charlie",
            "difficulty": "hard",
            "score": 600,
            "elapsed_sec": 80.0,
            "created_at": now,
            "seed": True
        }
    ]
    await db.scores.insert_many(scores)

    print("Seeding complete!")

if __name__ == "__main__":
    asyncio.run(main())
