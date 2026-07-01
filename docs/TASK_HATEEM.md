# Task — Hateem: Leaderboard + Report Assembly

You build the scoreboard that ranks players by speed, and you own pulling the
final report together. Read `API_CONTRACT.md` first — you depend on the `runs`
collection that Acap fills in.

Covers rubric: Leaderboard feature + Report (documentation, run steps,
screenshots, reflection).

---

## Backend — `backend/app/`

### 1. Scoring — new file `app/scoring.py`
Pure function, unit-testable:
```
BASE = {"easy": 100, "medium": 200, "hard": 400}
def compute_score(elapsed_sec: float, difficulty: str, time_limit_sec: int) -> int:
    ...  # faster + harder => higher. Suggested in the contract; tune + document.
```

### 2. Endpoints — add to `app/routers/game.py`
Add `/score` and `/leaderboard` from `API_CONTRACT.md`. Keep Acap's stage
endpoints intact — you are adding functions to the same router, not rewriting.

- `POST /game/score {run_id}`:
  - Load the run. Reject (404/403) if it is missing, not the caller's, or not
    `status=="completed"`.
  - **Compute score from the run's stored `elapsed_sec` + `difficulty`** — never
    from anything in the request body (anti-cheat).
  - Save into a `scores` collection (or write `score` back onto the run —
    pick one, document it). Store `username`, `difficulty`, `score`,
    `elapsed_sec`, `created_at`.
  - Idempotent: submitting the same `run_id` twice must not create duplicates.
  - Return `{rank, score, elapsed_sec, difficulty}`.
- `GET /game/leaderboard?difficulty=easy|medium|hard|all` (default `all`):
  - Return top 20, highest score first. Shape in the contract.

### 3. Index
Add to `app/db.py` `ensure_indexes()`:
`await db.scores.create_index([("difficulty", 1), ("score", -1)])`
and a unique index on `run_id` to enforce idempotency.

---

## Frontend — `frontend/src/`

### 4. `api.js` — add a `leaderboard` object (do not touch existing keys)
```
export const leaderboard = {
  submit: (run_id) => request("/game/score", {method:"POST",
    body: JSON.stringify({run_id})}),
  top: (difficulty="all") => request(`/game/leaderboard?difficulty=${difficulty}`),
};
```

### 5. `pages/Leaderboard.jsx`
Terminal-styled table (reuse `<Terminal>` + `index.css`): rank, username,
score, time, difficulty. Difficulty filter tabs (all/easy/medium/hard).
Highlight the current user's row.

### 6. Wiring
- `App.jsx`: add a `/leaderboard` route (Protected).
- On Acap's game success state: call `leaderboard.submit(run_id)`, then show
  the returned rank + a "view leaderboard" link. Coordinate with Acap on the
  success component he exposes (`run_id`, `elapsed_sec`, `difficulty`).

---

## Definition of done
- [ ] `/score` computes from server-stored run data only; ignores body values.
- [ ] Duplicate `run_id` submit does not double-count.
- [ ] `/leaderboard` returns correct order per difficulty and for `all`.
- [ ] Leaderboard page renders on the live site; current user highlighted.
- [ ] Finishing a game shows your rank and links to the board.

## Report (you are the assembler)
This is your responsibility for the team submission:
1. Collect Acap's stage write-ups + screenshots and your leaderboard section.
2. Compile the full report: how the game works, **steps to run** (from the
   README — `docker compose up`, the live URL), screenshots of every stage +
   leaderboard, and the 1-page reflection.
3. Confirm all three members are set for the demo on **11 July 2026** (demo
   attendance is mandatory for everyone).

## Git
Branch `feature/leaderboard`. Do not commit/push — hand to syamim to review,
commit, PR to `main`. Coordinate with Acap on `App.jsx` + `api.js`.
