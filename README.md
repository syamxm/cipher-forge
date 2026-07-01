# Cipher Forge

An interactive, Linux-terminal-themed game that teaches the RSA algorithm:
prime selection, key generation, encryption, and decryption. Players solve each
stage manually with hints about which operation to use.

Course project — CSC669 Cryptography Algorithm, UiTM.

## Stack

- Backend: FastAPI (Python), Motor (async MongoDB)
- Frontend: React + Vite
- Database: MongoDB
- Auth: email/password + Google Sign-In (JWT sessions)
- Deploy: Docker Compose, served via Nginx, exposed through Cloudflare Tunnel
- Theme: Tokyo Night Storm, Tux mascot

## Layout

```
backend/    FastAPI app (auth done, game routes are stubs)
frontend/   React app (auth gate done, game UI stubs)
deploy/     Host Nginx + Cloudflare Tunnel notes
docker-compose.yml
```

## Run with Docker (production-like)

```bash
cp backend/.env.example backend/.env      # set JWT_SECRET and GOOGLE_CLIENT_ID
cp .env.example .env                       # set VITE_GOOGLE_CLIENT_ID (optional)
docker compose up --build
```

App: http://localhost:8080  ·  API docs: proxied under `/api` (see backend).

## Run locally for development

Backend:
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env                       # point MONGO_URI at your local mongo
uvicorn app.main:app --reload
```

Frontend:
```bash
cd frontend
cp .env.example .env                       # optional: VITE_GOOGLE_CLIENT_ID
npm install
npm run dev                                 # http://localhost:5173, proxies /api -> :8000
```

## Auth flow

1. Register (email + password) or Sign in with Google.
2. First-time users pick a username (3–20 chars, `[a-zA-Z0-9_]`).
3. Authenticated users reach the game. Unauthenticated users are redirected to
   login. Users without a username are redirected to set one.

## API (implemented)

| Method | Path                     | Auth | Purpose                     |
|--------|--------------------------|------|-----------------------------|
| POST   | /api/auth/register       | no   | Email/password sign-up      |
| POST   | /api/auth/login          | no   | Email/password login        |
| POST   | /api/auth/google         | no   | Google ID token login       |
| GET    | /api/auth/me             | yes  | Current user                |
| PATCH  | /api/auth/me/username    | yes  | Set username                |
| GET    | /api/game/ping           | yes  | Stub — game routes go here  |

Game and leaderboard endpoints are stubbed in `backend/app/routers/game.py`.

## Google Sign-In setup

1. Create an OAuth 2.0 Web client in Google Cloud Console.
2. Add authorized origins: `http://localhost:5173`, `http://localhost:8080`,
   `https://cipher-forge.syamxm.com`.
3. Put the client id in `backend/.env` (`GOOGLE_CLIENT_ID`) and in the
   frontend env (`VITE_GOOGLE_CLIENT_ID`) — both must match.
