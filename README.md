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
- [Development](#development)

## About & Usage <a name = "about"></a>

**Bragi - (god of poetry in [Norse mythology](https://en.wikipedia.org/wiki/Bragi)):**

Bragibooks is a self-hosted audiobook management tool. It provides a React web interface for merging, converting, and tagging audiobook files using metadata from Audible. Since it runs in Docker, no local dependencies are required.

The workflow is a simple 3-step process:

1. **Select input** — browse your audio files and select what you want to process
2. **Match ASIN** — Bragibooks auto-searches Audible for metadata. If the match is wrong, use the custom search to find the correct title
3. **Process** — submit for processing and wait. This runs in the background and can take anywhere from seconds to hours depending on file size. Track progress on the Books page

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
  | `-e HOSTED_DOMAIN=bragibooks.mydomain.com` | Set for production deployments behind a reverse proxy |

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
    volumes:
      - path/to/config:/config
      - path/to/input:/downloads
      - path/to/output:/audiobooks
    ports:
      - 8000:8000
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
    volumes:
      - path/to/config:/config
      - path/to/input:/downloads
      - path/to/output:/audiobooks
    ports:
      - 8000:8000
    restart: unless-stopped

  worker:
    image: acetugboat/bragibooks:main
    container_name: bragibooks-worker
    command: worker
    environment:
      - LOG_LEVEL=INFO
      - UID=1000
      - GID=1000
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

## Development <a name = "development"></a>

Bragibooks has two parts: a Django backend (port 8000) and a React frontend (Vite dev server on port 5173). In production they run together in a single container — Django serves the pre-built frontend assets. In development you run them separately for hot-reload on both sides.

### Backend
```bash
uv sync
python manage.py migrate
python manage.py runserver 0.0.0.0:8000

# Separate terminal — task queue worker
python manage.py db_worker
```

Or via Docker:
```bash
docker compose -f docker/docker-compose.yaml --profile development up --build
```

### Frontend
Requires Node.js 22.12+ or 20.19+.
```bash
cd frontend
npm install
npm run dev   # Vite dev server at http://localhost:5173
```

Vite proxies all `/api/*` requests to `http://localhost:8000` — the Django backend must be running. Open **http://localhost:5173** during development, not port 8000.

### Seed test data
```bash
python manage.py populate_test_books   # fake books in the database
bash create-test-files.sh             # fake audio files in the input directory
```
