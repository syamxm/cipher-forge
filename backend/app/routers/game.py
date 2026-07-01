from fastapi import APIRouter, Depends

from ..deps import get_current_user

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
