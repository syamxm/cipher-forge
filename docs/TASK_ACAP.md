# Task — Acap: RSA Game Engine (Stages 1–4 + Difficulty + Time Attack)

You build the actual game: the four RSA challenge stages, difficulty levels,
and the time-attack timer. Backend logic + the frontend flow that drives it.
Read `API_CONTRACT.md` first — it defines the run model and every endpoint you
must match.

Covers rubric: Stage 1–4 (all), Difficulty Levels, Time Attack Mode.

---

## Backend — `backend/app/`

### 1. RSA math helper — new file `app/rsa.py`
Pure functions, no DB, unit-testable:
- `is_prime(n) -> bool`
- `gcd(a, b) -> int`
- `modinv(e, phi) -> int | None`  (extended Euclid; None if no inverse)
- `valid_e_options(phi) -> list[int]`  (all `1<e<phi` with `gcd(e,phi)==1`;
  cap the list, e.g. first 10)
- `encrypt(message: str, e, n) -> list[int]`  (`ord(ch)**e % n` per char)
- `decrypt(cipher: list[int], d, n) -> str`
- `random_candidates(difficulty) -> list[int]`  (mix of real primes in the
  difficulty range + some composites, shuffled; guarantee ≥2 primes and that
  a valid p,q with `n>255` exists)

Use Python's built-in `pow(base, exp, mod)` for modular exponentiation.

### 2. Difficulty config — in `app/rsa.py` or a small `app/game_config.py`
```
DIFFICULTY = {
  "easy":   {"prime_min": 17,  "prime_max": 50,  "time_limit_sec": 300},
  "medium": {"prime_min": 50,  "prime_max": 150, "time_limit_sec": 180},
  "hard":   {"prime_min": 150, "prime_max": 255, "time_limit_sec": 120},
}
```

### 3. Endpoints — replace the stubs in `app/routers/game.py`
Implement `/start`, `/stage1`, `/stage2`, `/stage3`, `/stage4` exactly as in
`API_CONTRACT.md`. Keep the existing `/ping` if you like.

Rules:
- Persist a run doc on `/start` (see the `runs` schema in the contract). Store
  `started_at` as UTC (`datetime.now(timezone.utc)`).
- On every stage submit, reload the run, verify it belongs to the caller
  (`user_id == user["_id"]`) and `status=="active"`.
- **Time attack:** on each stage submit compute elapsed. If
  `elapsed > time_limit_sec`, set `status="failed"` and return
  `{expired:true}`. Do not accept further stages for a failed run.
- Stage order must be enforced (can't do stage3 before stage1/2 filled).
- On stage4 success: set `status="completed"`, `completed_at`,
  `elapsed_sec = (completed_at - started_at).total_seconds()`.
- Validate inputs with Pydantic request models in `app/schemas.py` (add
  `StartRequest`, `Stage1Request`, ... — keep the auth schemas untouched).
- Never trust client-sent n/phi/e/d as correct — recompute and compare.

### 4. Index
Add to `app/db.py` `ensure_indexes()`:
`await db.runs.create_index([("user_id", 1), ("status", 1)])`

---

## Frontend — `frontend/src/`

### 5. `api.js` — add an `engine` object (do not touch existing keys)
```
export const engine = {
  start: (difficulty) => request("/game/start", {method:"POST",
    body: JSON.stringify({difficulty})}),
  stage1: (run_id, p, q) => request("/game/stage1", {method:"POST",
    body: JSON.stringify({run_id, p, q})}),
  // stage2..stage4 same shape
};
```

### 6. Game flow — `pages/Game.jsx` + `components/` stage pieces
Replace the placeholder. Terminal-styled, one stage visible at a time, using
the existing `<Terminal>` and `index.css` classes.

- Difficulty picker → `engine.start` → show candidate pool + countdown timer.
- Stage 1: player picks p and q from the pool → `stage1` → show n, phi.
- Stage 2: show `e_options`; player picks e and types d → `stage2`.
- Stage 3: player types a message → `stage3` → show the ciphertext array.
- Stage 4: show ciphertext; player types d → `stage4` → success screen with
  `elapsed_sec`.
- Countdown timer visible throughout; on `{expired:true}` show a
  "time's up" fail state with a retry button.
- On success, leave a mount point / callback so Hateem's leaderboard submit +
  "view leaderboard" link can hook in (coordinate: expose `run_id`,
  `elapsed_sec`, `difficulty` to the success component).

---

## Definition of done
- [ ] `app/rsa.py` functions correct (quick manual check: keygen → encrypt →
      decrypt round-trips a string).
- [ ] All 5 engine endpoints match the contract; wrong answers rejected with a
      clear `reason`; correct answers advance.
- [ ] Time attack expires a run past its limit at every difficulty.
- [ ] Three difficulties produce different prime sizes, all with `n>255`.
- [ ] Frontend plays a full run end-to-end on the live site.
- [ ] Success state exposes `run_id`/`elapsed_sec`/`difficulty` for Hateem.

## Report (your part)
Write up: how stages 1–4 work (with the RSA math), how difficulty + time
attack are implemented, and grab screenshots of each stage. Hand these to
syamim for the combined report.

## Git
Branch `feature/rsa-engine`. Do not commit/push — hand to syamim to review,
commit, PR to `main`. Coordinate with Hateem on `App.jsx` + `api.js` so the
merge is clean.
