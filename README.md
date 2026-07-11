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

## Local Development

Everything runs in Docker with one command, on Windows, Linux, or macOS. You do
not need Python, Node, or MongoDB installed — only Docker and Git.

Local runs never touch production. Production deploys automatically from `main`
via GitHub Actions; your local containers are completely separate.

### Prerequisites

**Linux**

- [Docker Engine](https://docs.docker.com/engine/install/) with the Docker
  Compose plugin (included in modern installs — check with `docker compose version`)
- Git

**Windows**

- [Docker Desktop](https://docs.docker.com/desktop/setup/install/windows-install/)
  — requires WSL 2 (the installer sets it up; if prompted, run `wsl --install`
  in PowerShell as Administrator and reboot first)
- [Git for Windows](https://git-scm.com/downloads/win)
- Make sure Docker Desktop is **running** (whale icon in the system tray)
  before using any `docker` command

### Setup (all operating systems)

Run these in a terminal (Linux: any shell; Windows: PowerShell or Git Bash).

1. Clone and enter the project:

   ```bash
   git clone https://github.com/syamxm/cipher-forge.git
   cd cipher-forge
   ```

2. Create the local Docker network (one time only — production uses this
   network for its reverse proxy, so locally we create an empty stand-in):

   ```bash
   docker network create proxy-net
   ```

3. Create your local backend config:

   ```bash
   cp backend/.env.example backend/.env
   ```

   On Windows PowerShell use `copy` instead of `cp`:

   ```powershell
   copy backend\.env.example backend\.env
   ```

   Then open `backend/.env` in any editor and change `JWT_SECRET` to any long
   random string. Never commit this file — it is git-ignored.

4. Build and start everything:

   ```bash
   docker compose up --build
   ```

   The first build takes a few minutes. Later runs are much faster.

### Verify it works

Open **http://localhost:8888** in your browser. You should see the Cipher
Forge login screen. Register a new account (username 3–20 characters, password
minimum 8), log in, and you should reach the game screen. If that works,
everything (frontend, backend, and MongoDB) is running correctly.

### Day-to-day commands

| Action | Command |
|--------|---------|
| Start (after first setup) | `docker compose up` |
| Start in the background | `docker compose up -d` |
| Rebuild after code changes | `docker compose up --build` |
| Stop | `Ctrl+C`, or `docker compose down` |
| View logs (background mode) | `docker compose logs -f` |
| **Reset the local database** (wipes all local users) | `docker compose down -v` |

### Windows gotchas

- **Docker Desktop must be running** before any `docker` command — otherwise
  you get `error during connect` / `cannot connect to the Docker daemon`.
- **WSL 2 is required.** If Docker Desktop complains about WSL, run
  `wsl --install` in an Administrator PowerShell and reboot.
- **Line endings:** the repo has a `.gitattributes` that keeps config files in
  LF, so the default Git for Windows settings are fine. Avoid editing
  `backend/.env` with an editor that forces CRLF (Notepad is safe on
  Windows 10 1809+; VS Code is safe).
- **Paths:** use backslashes in PowerShell (`backend\.env`) and forward
  slashes in Git Bash (`backend/.env`).

### Without Docker (optional, advanced)

Only needed if you want hot reload outside Docker. Requires Python 3.12+,
Node 22+, and a local MongoDB.

Backend:
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env                       # point MONGO_URI at your local mongo
uvicorn app.main:app --reload
```
Fake Data test:
```bash
cd backend
source .venv/bin/activate
python scripts/seed_leaderboard.py   #restart uvicorn may needed                      
```
Frontend:
```bash
cd frontend
npm install
npm run dev                                 # http://localhost:5173, proxies /api -> :8000
```

### Production (for reference — do not run locally)

In production the frontend container joins the external `proxy-net` network and
is routed by the central Nginx proxy (`~/nginx`) as `cipher-forge.syamxm.com`,
which is exposed through Cloudflare Tunnel. Deploys happen automatically via
GitHub Actions on every push to `main`. The `8888` host port is for
direct/local access only.

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
