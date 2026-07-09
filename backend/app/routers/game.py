from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from ..db import db
from ..deps import get_current_user
from ..scoring import compute_score

router = APIRouter(prefix="/game", tags=["game"])

# Placeholder routes. The RSA challenge logic lives here.
#
# TODO(acap): Stage 1-4 challenge endpoints + validation
#   - POST /game/start        -> generate p, q candidates for a difficulty
#   - POST /game/check-prime  -> validate the player's prime choice
#   - POST /game/keygen       -> validate n, phi(n), e, and d answers
#   - POST /game/encrypt      -> validate the player's ciphertext
#   - POST /game/decrypt      -> validate the player's plaintext
#   - Time Attack + Difficulty (Easy/Medium/Hard) handled here.
#
# TODO(hateem): Leaderboard endpoints
#   - POST /game/score        -> submit a completed run (time, difficulty)
#   - GET  /game/leaderboard  -> fastest players


@router.get("/ping")
async def ping(user: dict = Depends(get_current_user)):
    return {"status": "ok", "player": user.get("username")}


# ---- leaderboard (hateem) ----

class ScoreRequest(BaseModel):
    run_id: str

@router.post("/score")
async def submit_score(body: ScoreRequest, user: dict = Depends(get_current_user)):
    # load the run
    try:
        oid = ObjectId(body.run_id)
    except InvalidId:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Run not found")
    run = await db.runs.find_one({"_id": oid})
    if run is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Run not found")
    if run["user_id"] != user["_id"]:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not your run")
    if run.get("status") != "completed":
        raise HTTPException(status.HTTP_409_CONFLICT, "Run is not completed")

    # anti-cheat: score comes only from stored run data
    difficulty = run["difficulty"]
    elapsed_sec = run["elapsed_sec"]
    score = compute_score(elapsed_sec, difficulty)

    # idempotent upsert keyed by run_id (unique index enforces no dupes)
    now = datetime.now(timezone.utc)
    await db.scores.update_one(
        {"run_id": body.run_id},
        {
            "$set": {
                "run_id": body.run_id,
                "user_id": user["_id"],
                "username": run["username"],
                "difficulty": difficulty,
                "score": score,
                "elapsed_sec": elapsed_sec,
            },
            "$setOnInsert": {"created_at": now},
        },
        upsert=True,
    )

    # rank within the same difficulty; tie-break: faster time ranks higher
    better = await db.scores.count_documents({
        "difficulty": difficulty,
        "$or": [
            {"score": {"$gt": score}},
            {"score": score, "elapsed_sec": {"$lt": elapsed_sec}},
        ],
    })
    rank = better + 1
    return {"rank": rank, "score": score, "elapsed_sec": elapsed_sec,
            "difficulty": difficulty}

@router.get("/leaderboard")
async def leaderboard(difficulty: str = Query("all")):
    if difficulty not in ("all", "easy", "medium", "hard"):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid difficulty")
    query = {} if difficulty == "all" else {"difficulty": difficulty}
    cursor = db.scores.find(query).sort(
        [("score", -1), ("elapsed_sec", 1)]
    ).limit(20)
    entries = []
    rank = 1
    async for doc in cursor:
        entries.append({
            "rank": rank,
            "username": doc["username"],
            "score": doc["score"],
            "elapsed_sec": doc["elapsed_sec"],
            "difficulty": doc["difficulty"],
        })
        rank += 1
    return {"entries": entries}

# ---- end leaderboard ----
