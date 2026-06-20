# Stage 1: Build the React/TypeScript frontend
# Vite outputs to ../static/dist relative to the frontend dir,
# so with WORKDIR / the built assets land at /static/dist
FROM --platform=linux/amd64 node:20-alpine AS frontend-builder

WORKDIR /
COPY frontend/ ./frontend/
RUN cd frontend && npm ci && npm run build


# Pull amd64 uv binary explicitly so it downloads amd64 Python below
FROM --platform=linux/amd64 ghcr.io/astral-sh/uv:latest AS uv


# Base image — provides m4b-merge system tools (PHP, ffmpeg)
FROM --platform=linux/amd64 ghcr.io/djdembeck/m4b-merge:develop

# Pull in Alpine security patches for base-image packages
RUN apk upgrade --no-cache

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV APP_HOME=/home/app/web

# Copy amd64 uv binary (using the named stage above ensures correct architecture)
COPY --from=uv /uv /usr/local/bin/uv

# Venv lives outside APP_HOME so the docker-compose volume mount doesn't shadow it
ENV VIRTUAL_ENV="/app/.venv"
ENV PATH="/app/.venv/bin:$PATH"

# Install Python to /opt so all users can access it.
# /root/.local (the default) is only readable by root, which causes
# su-exec to fail when it switches to the app user.
ENV UV_PYTHON_INSTALL_DIR="/opt/uv-python"

WORKDIR /app
COPY pyproject.toml uv.lock .

# Download portable Python 3.12 and install packages, then make both the
# Python install and venv world-readable/executable for the app user.
RUN uv venv --python 3.12 $VIRTUAL_ENV && \
    uv sync --frozen --no-install-project && \
    uv pip install --upgrade pip setuptools && \
    chmod -R a+rX $UV_PYTHON_INSTALL_DIR $VIRTUAL_ENV

# Verify Python 3.12 + Django are working before the image is finalised
RUN /app/.venv/bin/python -c \
    "import sys; print('Python', sys.version); import django; print('Django', django.__version__)"

# Where your code lives
WORKDIR $APP_HOME

# Copy whole project to your docker home directory
COPY bragibooks_proj $APP_HOME/bragibooks_proj/
COPY importer $APP_HOME/importer/
COPY utils $APP_HOME/utils/
COPY manage.py $APP_HOME

# Copy built frontend assets from the node stage
COPY --from=frontend-builder /static/dist $APP_HOME/static/dist

# Copy entrypoint file
COPY docker/entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

# Port where the Django app runs
EXPOSE 8000

# Entrypoint for the container
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
