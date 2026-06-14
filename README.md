<p align="center">
  <a href="" rel="noopener">
  <img width=200px height=200px src="../assets/logos/logo.png?raw=true" alt="Project logo"></a>
</p>

<h3 align="center">Bragibooks</h3>

<div align="center">

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![GitHub Issues](https://img.shields.io/github/issues/AceTugboat/bragibooks.svg)](https://github.com/AceTugboat/bragibooks/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/AceTugboat/bragibooks.svg)](https://github.com/AceTugboat/bragibooks/pulls)
[![License](https://img.shields.io/github/license/AceTugboat/bragibooks)](https://github.com/AceTugboat/bragibooks/blob/main/LICENSE)
[![Docker](https://github.com/AceTugboat/bragibooks/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/AceTugboat/bragibooks/actions/workflows/docker-publish.yml)
[![Docker Pulls](https://img.shields.io/docker/pulls/acetugboat/bragibooks)](https://hub.docker.com/r/acetugboat/bragibooks)
[![Docker Image Size (latest by date)](https://img.shields.io/docker/image-size/acetugboat/bragibooks)](https://hub.docker.com/r/acetugboat/bragibooks)
[![Docker Image Version (latest by date)](https://img.shields.io/docker/v/acetugboat/bragibooks)](https://hub.docker.com/r/acetugboat/bragibooks)

</div>

---

<p align="center">An audiobook library management app with a React frontend, powered by <a href="https://github.com/djdembeck/m4b-merge">m4b-merge</a>.</p>

## Table of Contents

- [About & Usage](#about)
- [Getting Started](#getting_started)
- [Database](#database)
- [Passkeys](#passkeys)
- [Development](#development)

## About & Usage <a name = "about"></a>

**Bragi - (god of poetry in [Norse mythology](https://en.wikipedia.org/wiki/Bragi)):**

Bragibooks is a self-hosted audiobook management tool. It provides a React web interface for merging, converting, and tagging audiobook files using metadata from Audible. Since it runs in Docker, no local dependencies are required.

The workflow is a simple 3-step process:

1. **Select input** — browse your audio files and select what you want to process
2. **Match ASIN** — Bragibooks auto-searches Audible for metadata. If the match is wrong, use the custom search to find the correct title
3. **Process** — submit for processing and wait. This runs in the background and can take anywhere from seconds to hours depending on file size. Track progress on the Processing page

## Getting Started <a name = "getting_started"></a>

### Prerequisites

#### Docker
All prerequisites are included in the image.

#### Direct install
- Install m4b-tool and its dependencies from [the project's readme](https://github.com/sandreas/m4b-tool#installation)
- Install [uv](https://github.com/astral-sh/uv) and run `uv sync`
- Install [Node.js](https://nodejs.org/) 22.12+ or 20.19+ for the frontend

### Installing

#### Docker

The container entrypoint accepts a mode argument:

  | Mode | Description |
  | :----: | --- |
  | `prod` | Gunicorn production server (default) |
  | `worker` | Task queue worker — run in a separate container |
  | `dev` | Django development server |

  | Parameter | Function |
  | :----: | --- |
  | `-v /path/to/input:/downloads` | Input folder |
  | `-v /path/to/output:/audiobooks` | Output folder |
  | `-v /appdata/bragibooks/config:/config` | Persistent config storage |
  | `-p 8000:8000/tcp` | Port for your browser |
  | `-e LOG_LEVEL=WARNING` | Any [logging level](https://www.loggly.com/ultimate-guide/python-logging-basics/) |
  | `-e DEBUG=False` | Django debug mode (default False) |
  | `-e UID=99` | User ID to run the container as (default 99) |
  | `-e GID=100` | Group ID to run the container as (default 100) |
  | `-e RUN_WORKER=true` | Run the task queue worker inside this container (default false) |
  | `-e HOSTED_DOMAIN=bragibooks.mydomain.com` | Set for production deployments behind a reverse proxy. Also controls CORS and CSRF allowed origins. |
  | `-e PASSKEY_RP_ID=bragibooks.mydomain.com` | Relying Party ID for passkey auth (defaults to `HOSTED_DOMAIN`). Must be a registrable domain suffix of your origin. |
  | `-e PASSKEY_RP_NAME=Bragibooks` | Human-readable name shown during passkey registration (default: `Bragibooks`) |
  | `-e PASSKEY_ORIGIN=https://bragibooks.mydomain.com` | Exact origin the browser sends during WebAuthn. Must be `https://` in production. |

Single container (web + worker):

	docker run --rm -d --name bragibooks -v /path/to/input:/downloads -v /path/to/output:/audiobooks -v /appdata/bragibooks/config:/config -p 8000:8000/tcp -e RUN_WORKER=true acetugboat/bragibooks:main prod

Separate containers:

	docker run --rm -d --name bragibooks -v /path/to/input:/downloads -v /path/to/output:/audiobooks -v /appdata/bragibooks/config:/config -p 8000:8000/tcp acetugboat/bragibooks:main prod
	docker run --rm -d --name bragibooks-worker -v /path/to/input:/downloads -v /path/to/output:/audiobooks -v /appdata/bragibooks/config:/config acetugboat/bragibooks:main worker

#### Docker Compose

Single container (web + worker):
```yaml
services:
  bragi:
    image: acetugboat/bragibooks:main
    container_name: bragibooks
    command: prod
    environment:
      - HOSTED_DOMAIN=bragibooks.mydomain.com
      - LOG_LEVEL=INFO
      - UID=1000
      - GID=1000
      - RUN_WORKER=true
      # For PostgreSQL: - DATABASE_URL=postgres://user:pass@db:5432/bragibooks
      # Passkeys (optional):
      # - PASSKEY_RP_ID=bragibooks.mydomain.com
      # - PASSKEY_ORIGIN=https://bragibooks.mydomain.com
    volumes:
      - path/to/config:/config
      - path/to/input:/downloads
      - path/to/output:/audiobooks
    ports:
      - "8000:8000"
    restart: unless-stopped
```

Separate containers (web + worker):
```yaml
services:
  bragi:
    image: acetugboat/bragibooks:main
    container_name: bragibooks
    command: prod
    environment:
      - HOSTED_DOMAIN=bragibooks.mydomain.com
      - LOG_LEVEL=INFO
      - UID=1000
      - GID=1000
      # For PostgreSQL: - DATABASE_URL=postgres://user:pass@db:5432/bragibooks
      # Passkeys (optional):
      # - PASSKEY_RP_ID=bragibooks.mydomain.com
      # - PASSKEY_ORIGIN=https://bragibooks.mydomain.com
    volumes:
      - path/to/config:/config
      - path/to/input:/downloads
      - path/to/output:/audiobooks
    ports:
      - "8000:8000"
    restart: unless-stopped

  worker:
    image: acetugboat/bragibooks:main
    container_name: bragibooks-worker
    command: worker
    environment:
      - LOG_LEVEL=INFO
      - UID=1000
      - GID=1000
      # For PostgreSQL: - DATABASE_URL=postgres://user:pass@db:5432/bragibooks
    volumes:
      - path/to/config:/config
      - path/to/input:/downloads
      - path/to/output:/audiobooks
    restart: unless-stopped
```

#### Direct install (Gunicorn)
```bash
uv sync
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py db_worker &
gunicorn bragibooks_proj.wsgi \
  --bind 0.0.0.0:8000 \
  --timeout 1200 \
  --worker-tmp-dir /dev/shm \
  --workers=2 \
  --threads=4 \
  --worker-class=gthread \
  --enable-stdio-inheritance
```

## Database <a name = "database"></a>

**SQLite is the default — no database setup required.** The database file is created automatically at `/config/db.sqlite3` on first run. This is the same approach used by Sonarr, Radarr, and the rest of the *arr stack and works well for personal and household installs.

To use PostgreSQL, add `DATABASE_URL` to the environment section of your compose file:

```yaml
- DATABASE_URL=postgres://bragibooks:password@db:5432/bragibooks
```

The PostgreSQL adapter is bundled in the image — no extra steps required. If you need a local Postgres instance, add a `db` service:

```yaml
  db:
    image: postgres:18-alpine
    environment:
      - POSTGRES_DB=bragibooks
      - POSTGRES_USER=bragibooks
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

PostgreSQL is recommended for multi-user installs or NAS deployments where you already have a shared Postgres instance running.

## Passkeys <a name = "passkeys"></a>

Bragibooks supports passwordless login via passkeys — device biometrics (Touch ID, Face ID, Windows Hello) or hardware security keys (YubiKey, etc.). Passkeys are entirely optional: username/password login always works and requires no configuration changes.

### Setup

1. Log in with your username and password as usual
2. Go to **Settings > Security**
3. Click **Add a Passkey**, give it a name (e.g. "MacBook Touch ID"), and follow your device's prompt
4. On future logins, click **Sign in with passkey** on the login page

You can register multiple passkeys (one per device) and remove them at any time from the Security settings page.

### Production requirements

Passkeys use the WebAuthn standard, which browsers enforce over HTTPS only (or `http://localhost` for local development). Set these three environment variables on your production deployment:

| Variable | Description | Example |
|---|---|---|
| `PASSKEY_RP_ID` | Your domain, no scheme prefix | `bragibooks.mydomain.com` |
| `PASSKEY_RP_NAME` | Name shown during registration prompt | `Bragibooks` |
| `PASSKEY_ORIGIN` | Full origin including scheme | `https://bragibooks.mydomain.com` |

`PASSKEY_RP_ID` must be a registrable domain suffix of your origin — it cannot be an IP address. If you access Bragibooks at `https://bragibooks.mydomain.com`, the RP ID can be either `bragibooks.mydomain.com` or `mydomain.com`.

If these variables are not set, the passkey button will not appear on the login page and passkey registration will be unavailable — all other functionality continues to work normally.

## Development <a name = "development"></a>

Bragibooks has two parts: a Django backend (port 8000) and a React frontend. There are two development modes depending on whether you want to work inside Docker or run everything locally.

### Docker dev mode

Runs `manage.py runserver` inside the container with the pre-built frontend assets from `static/dist/`. The task worker runs in the same container (`RUN_WORKER=true` is set by default in the dev profile).

```bash
docker compose -f docker/docker-compose.yaml --profile development up --build
```

This mode serves the *built* frontend. After any frontend changes, rebuild with `npm run build` and restart the container.

Passkeys work in Docker dev mode — defaults are `PASSKEY_RP_ID=localhost` and `PASSKEY_ORIGIN=http://localhost:8000` when `HOSTED_DOMAIN` is not set.

### Local dev mode

Runs Django and the Vite dev server separately, giving you hot reload on both backend and frontend.

**Terminal 1 — Django backend:**
```bash
uv sync
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

**Terminal 2 — Frontend (Vite dev server):**

Requires Node.js 22.12+ or 20.19+.
```bash
cd frontend
npm install
npm run dev   # Vite dev server at http://localhost:5173
```

Vite proxies all `/api/*` requests to `http://localhost:8000`. Open **http://localhost:5173** in your browser, not port 8000.

For passkeys in local dev mode, set `PASSKEY_ORIGIN=http://localhost:5173` and `PASSKEY_RP_ID=localhost`.

**Terminal 3 — Task queue worker:**
```bash
python manage.py db_worker
```

### Seed test data
```bash
python manage.py populate_test_books   # fake books in the database
bash create-test-files.sh             # fake audio files in the input directory
```
