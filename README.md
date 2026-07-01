# Cipher Forge

An interactive, Linux-terminal-themed game that teaches the RSA algorithm:
prime selection, key generation, encryption, and decryption. Players solve each
stage manually with hints about which operation to use.

Course project — CSC669 Cryptography Algorithm, UiTM.

## Stack

- Backend: FastAPI (Python), Motor (async MongoDB)
- Frontend: React + Vite
- Database: MongoDB
- Auth: username/password (JWT sessions)
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
cp backend/.env.example backend/.env      # set JWT_SECRET
docker compose up --build
```

App: http://localhost:8888  ·  API docs: proxied under `/api` (see backend).

In production the frontend container joins the external `proxy-net` network and
is routed by the central Nginx proxy (`~/nginx`) as `cipher-forge.syamxm.com`,
which is exposed through Cloudflare Tunnel. The `8888` host port is for
direct/local access only.

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
npm install
npm run dev                                 # http://localhost:5173, proxies /api -> :8000
```

## Auth flow

1. Register with a username (3–20 chars, `[a-zA-Z0-9_]`) and password (min 8).
2. Log in with the same username and password.
3. Authenticated users reach the game. Unauthenticated users are redirected to
   login.

## API (implemented)

| Method | Path                     | Auth | Purpose                     |
|--------|--------------------------|------|-----------------------------|
| POST   | /api/auth/register       | no   | Username/password sign-up   |
| POST   | /api/auth/login          | no   | Username/password login     |
| GET    | /api/auth/me             | yes  | Current user                |
| GET    | /api/game/ping           | yes  | Stub — game routes go here  |

Game and leaderboard endpoints are stubbed in `backend/app/routers/game.py`.
