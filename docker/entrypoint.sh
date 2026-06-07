#!/bin/sh

# set environment variables for UID and GID
PUID=${UID:-99}
PGID=${GID:-100}

# Explicit path to venv Python — avoids relying on PATH resolution so the
# correct interpreter is used even if the shell finds system Python first.
PYTHON=/app/.venv/bin/python

# create a user and group with specified UID and GID
addgroup -g $PGID appgroup
adduser -D -u $PUID -G appgroup appuser

mkdir -p $APP_HOME
find $APP_HOME -not -path '*/.git/*' -not -path '*/.git' \
    -exec chown appuser:appgroup {} + 2>/dev/null || true

echo "Starting with UID: $PUID, GID: $PGID"

# Fix permissions
chown -R "$PUID":"$PGID" /config /input /output

until cd /home/app/web
do
    echo "Waiting for server volume..."
    sleep 1
done

until $PYTHON manage.py migrate
do
    echo "Waiting for db to be ready..."
    sleep 2
done

$PYTHON manage.py collectstatic --noinput

MODE=${1:-prod}

if [ "${RUN_WORKER:-false}" = "true" ] && [ "$MODE" != "worker" ]; then
    echo "Starting task queue worker in background..."
    su-exec "$PUID":"$PGID" $PYTHON manage.py db_worker &
fi

case "$MODE" in
    prod)
        echo "Starting production server..."
        exec su-exec "$PUID":"$PGID" /app/.venv/bin/gunicorn bragibooks_proj.wsgi \
            --bind 0.0.0.0:8000 \
            --timeout 1200 \
            --worker-tmp-dir /dev/shm \
            --workers 2 \
            --threads 4 \
            --worker-class gthread \
            --enable-stdio-inheritance
        ;;
    worker)
        echo "Starting task queue worker..."
        exec su-exec "$PUID":"$PGID" $PYTHON manage.py db_worker
        ;;
    dev)
        echo "Starting development server..."
        exec $PYTHON manage.py runserver 0.0.0.0:8000
        ;;
    *)
        echo "Unknown mode '$MODE'. Valid modes: prod, worker, dev"
        exit 1
        ;;
esac
