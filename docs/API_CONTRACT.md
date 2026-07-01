# Cipher Forge — Shared API Contract

Read this first. Acap and Hateem both build against it so the two halves
(RSA engine + leaderboard) fit together without merge pain.

Base path: `/api/game` (all endpoints require a valid JWT — reuse
`get_current_user` from `app/deps.py`, same as the existing `/game/ping`).

Auth, user accounts, infra, deploy: **done** (syamim). Do not touch
`app/routers/auth.py`, `app/security.py`, `app/deps.py`, `app/config.py`,
`docker-compose.yml`, `nginx.conf`, or the deploy files.

---

## Difficulty table

| Level  | Prime range      | Time limit | Notes                         |
|--------|------------------|-----------|-------------------------------|
| easy   | 17–50            | 300 s     | small, forgiving              |
| medium | 50–150           | 180 s     | bigger primes                 |
| hard   | 150–255          | 120 s     | biggest; still per-char ASCII |

Rule that must hold for every level: `n = p*q > 255` so any ASCII byte
(0–255) satisfies `m < n` and RSA per-character works. Easy min (17×17=289)
already clears this.

---

## `runs` collection (Acap owns the schema, Hateem reads it)

One document per game attempt.

```
{
  _id:          ObjectId,
  user_id:      ObjectId,      # owner (from JWT)
  username:     string,        # denormalised for the leaderboard
  difficulty:   "easy"|"medium"|"hard",
  status:       "active"|"completed"|"failed",
  p, q:         int,           # filled after stage 1
  n, phi, e, d: int,           # filled after stage 2
  candidates:   [int],         # the number pool shown in stage 1
  e_options:    [int],         # valid e choices shown in stage 2
  message:      string,        # plaintext from stage 3
  ciphertext:   [int],         # per-char cipher from stage 3
  started_at:   datetime,      # UTC, set on /start
  completed_at: datetime|null, # UTC, set when status becomes completed
  elapsed_sec:  float|null     # completed_at - started_at, authoritative
}
```

`elapsed_sec` is written by the backend only. The leaderboard trusts this
field and nothing from the client.

---

## Endpoints — RSA engine (Acap)

All take/return JSON. On a time-limit breach return
`{ "expired": true }` with HTTP 200 and set the run `status="failed"`.

1. `POST /game/start` → `{difficulty}`
   → `{run_id, difficulty, candidates:[int], time_limit_sec}`
   Creates a run, generates the candidate pool (mix of primes + non-primes).

2. `POST /game/stage1` → `{run_id, p, q}`
   Validate: p and q are in `candidates`, both prime, and distinct.
   → `{ok:true, n, phi, e_options:[int]}` or `{ok:false, reason}`

3. `POST /game/stage2` → `{run_id, e, d}`
   Validate: `e` in `e_options` (i.e. `1<e<phi`, `gcd(e,phi)==1`) and
   `d` is the modular inverse (`(e*d) % phi == 1`).
   → `{ok:true}` or `{ok:false, reason}`

4. `POST /game/stage3` → `{run_id, message}`
   Server encrypts each char: `c_i = ord(ch)^e mod n`.
   → `{ok:true, ciphertext:[int]}`

5. `POST /game/stage4` → `{run_id, d}`
   Server decrypts `ciphertext` with the player's `d`, checks it equals
   `message`. On match: set `status="completed"`, `completed_at`, `elapsed_sec`.
   → `{ok:true, plaintext, elapsed_sec, difficulty}` or `{ok:false, reason}`

## Endpoints — Leaderboard (Hateem)

6. `POST /game/score` → `{run_id}`
   Look up the run. Reject unless it belongs to the caller and
   `status=="completed"`. Compute score from the run's stored
   `elapsed_sec` + `difficulty` (never from the request body).
   → `{rank, score, elapsed_sec, difficulty}`

7. `GET /game/leaderboard?difficulty=easy|medium|hard|all` (default `all`)
   → `{entries:[{rank, username, score, elapsed_sec, difficulty}]}`
   Top N (e.g. 20), fastest first.

---

## Frontend split (avoid merge conflicts)

- `frontend/src/api.js`: Acap adds an `engine` object, Hateem adds a
  `leaderboard` object — separate keys, no shared lines.
- `App.jsx`: Acap owns the `/` (Game) route. Hateem adds a `/leaderboard`
  route + a link from the Game screen's end state.
- Acap owns `Game.jsx` + stage components. Hateem owns `Leaderboard.jsx`.
- Reuse the existing `Terminal` component and `index.css` classes for a
  consistent Tokyo-Night terminal look.

---

## Scoring formula (Hateem decides final numbers; suggested)

`score = round(base[difficulty] * (time_limit_sec / max(elapsed_sec, 1)))`
with `base = {easy:100, medium:200, hard:400}`. Faster + harder = higher.
Document whatever you pick in the report.
