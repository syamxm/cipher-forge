from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from ..db import db
from ..deps import get_current_user
from ..rsa import (
    DIFFICULTY,
    decrypt,
    encrypt,
    gcd,
    is_prime,
    modinv,
    random_candidates,
    valid_e_options,
)
from ..schemas import (
    Stage1Request,
    Stage2Request,
    Stage3Request,
    Stage4Request,
    StartRequest,
)

router = APIRouter(prefix="/game", tags=["game"])

def _now() -> datetime:
    return datetime.now(timezone.utc)


async def _get_active_run(run_id: str, user: dict) -> dict:
    """
    Load a run document, verify ownership and active status.
    Raises HTTPException on any failure so endpoints stay clean.
    """
    try:
        oid = ObjectId(run_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid run_id.")

    run = await db.runs.find_one({"_id": oid})
    if not run:
        raise HTTPException(status_code=404, detail="Run not found.")
    if run["user_id"] != user["_id"]:
        raise HTTPException(status_code=403, detail="Not your run.")
    if run["status"] != "active":
        raise HTTPException(
            status_code=400,
            detail="Run is not active (already completed or failed).",
        )
    return run


def _check_time(run: dict) -> bool:
    """Return True if the run has exceeded its time limit."""
    cfg = DIFFICULTY[run["difficulty"]]
    elapsed = (_now().replace(tzinfo=None) - run["started_at"]).total_seconds()
    return elapsed > cfg["time_limit_sec"]


async def _expire_run(run_id_oid: ObjectId) -> None:
    """Mark a run as failed due to time expiry."""
    await db.runs.update_one(
        {"_id": run_id_oid},
        {"$set": {"status": "failed"}},
    )

@router.get("/ping")
async def ping(user: dict = Depends(get_current_user)):
    return {"status": "ok", "player": user.get("username")}

#/game/start
@router.post("/start")
async def start(body: StartRequest, user: dict = Depends(get_current_user)):
    """
    Create a new run for the given difficulty.
    Returns the candidate pool and the time limit so the frontend
    can start the countdown immediately.
    """
    if body.difficulty not in DIFFICULTY:
        raise HTTPException(status_code=400, detail="Invalid difficulty.")

    cfg = DIFFICULTY[body.difficulty]
    candidates = random_candidates(body.difficulty)

    run_doc = {
        "user_id":      user["_id"],
        "username":     user["username"],
        "difficulty":   body.difficulty,
        "status":       "active",
        "p":            None,
        "q":            None,
        "n":            None,
        "phi":          None,
        "e":            None,
        "d":            None,
        "candidates":   candidates,
        "e_options":    [],
        "message":      None,
        "ciphertext":   [],
        "started_at":   _now(),
        "completed_at": None,
        "elapsed_sec":  None,
    }

    result = await db.runs.insert_one(run_doc)

    return {
        "run_id":         str(result.inserted_id),
        "difficulty":     body.difficulty,
        "candidates":     candidates,
        "time_limit_sec": cfg["time_limit_sec"],
    }


#/game/stage1
@router.post("/stage1")
async def stage1(body: Stage1Request, user: dict = Depends(get_current_user)):
    """
    Player submits their chosen p and q from the candidate pool.
    Validates: both in candidates, both prime, distinct.
    Returns n, phi, and the list of valid e choices.
    """
    run = await _get_active_run(body.run_id, user)

    if _check_time(run):
        await _expire_run(run["_id"])
        return {"expired": True}

    candidates = run["candidates"]

    if body.p not in candidates or body.q not in candidates:
        return {"ok": False, "reason": "Both p and q must be chosen from the candidate pool."}

    if body.p == body.q:
        return {"ok": False, "reason": "p and q must be distinct numbers."}

    if not is_prime(body.p):
        return {"ok": False, "reason": f"{body.p} is not a prime number."}

    if not is_prime(body.q):
        return {"ok": False, "reason": f"{body.q} is not a prime number."}

    n   = body.p * body.q
    phi = (body.p - 1) * (body.q - 1)
    e_options = valid_e_options(phi)

    await db.runs.update_one(
        {"_id": run["_id"]},
        {"$set": {"p": body.p, "q": body.q, "n": n, "phi": phi, "e_options": e_options}},
    )

    return {"ok": True, "n": n, "phi": phi, "e_options": e_options}


# /game/stage2

@router.post("/stage2")
async def stage2(body: Stage2Request, user: dict = Depends(get_current_user)):
    """
    Player submits their chosen e and the d they noted down.
    Validates: e is in e_options, d is the correct modular inverse of e.
    """
    run = await _get_active_run(body.run_id, user)

    if _check_time(run):
        await _expire_run(run["_id"])
        return {"expired": True}

    if run.get("phi") is None:
        return {"ok": False, "reason": "Complete Stage 1 before Stage 2."}

    phi      = run["phi"]
    e_options = run["e_options"]

    if body.e not in e_options:
        return {"ok": False, "reason": f"{body.e} is not a valid choice for e."}
    
    correct_d = modinv(body.e, phi)
    if correct_d is None or (body.e * body.d) % phi != 1:
        return {"ok": False, "reason": "Your value of d is incorrect. Hint: d = modinv(e, φ(n))."}

    await db.runs.update_one(
        {"_id": run["_id"]},
        {"$set": {"e": body.e, "d": body.d}},
    )

    return {"ok": True}

#/game/stage3
@router.post("/stage3")
async def stage3(body: Stage3Request, user: dict = Depends(get_current_user)):
    """
    Player submits a plaintext message.
    Server encrypts it with (e, n) and returns the ciphertext array.
    """
    run = await _get_active_run(body.run_id, user)

    if _check_time(run):
        await _expire_run(run["_id"])
        return {"expired": True}
    
    if run.get("e") is None:
        return {"ok": False, "reason": "Complete Stage 2 before Stage 3."}

    n = run["n"]
    e = run["e"]
    ciphertext = encrypt(body.message, e, n)

    await db.runs.update_one(
        {"_id": run["_id"]},
        {"$set": {"message": body.message, "ciphertext": ciphertext}},
    )

    return {"ok": True, "ciphertext": ciphertext}


#/game/stage4
@router.post("/stage4")
async def stage4(body: Stage4Request, user: dict = Depends(get_current_user)):
    """
    Player submits their private key d.
    Server decrypts the stored ciphertext and checks it against the original
    message. On success, marks the run completed and locks in elapsed_sec.
    """
    run = await _get_active_run(body.run_id, user)

    if _check_time(run):
        await _expire_run(run["_id"])
        return {"expired": True}

    if not run.get("ciphertext"):
        return {"ok": False, "reason": "Complete Stage 3 before Stage 4."}

    n          = run["n"]
    ciphertext = run["ciphertext"]
    original   = run["message"]

    plaintext = decrypt(ciphertext, body.d, n)

    if plaintext != original:
        return {"ok": False, "reason": "Decryption failed. Check your value of d and try again."}

    completed_at = _now()
    elapsed_sec  = (completed_at.replace(tzinfo=None) - run["started_at"]).total_seconds()

    await db.runs.update_one(
        {"_id": run["_id"]},
        {
            "$set": {
                "status":       "completed",
                "completed_at": completed_at,
                "elapsed_sec":  elapsed_sec,
            }
        },
    )

    return {
        "ok":          True,
        "plaintext":   plaintext,
        "elapsed_sec": elapsed_sec,
        "difficulty":  run["difficulty"],
    }

# score + leaderboard below
