#!/bin/sh

# set environment variables for UID and GID
PUID=${UID:-99}
PGID=${GID:-100}

# create a user and group with specified UID and GID
GROUPNAME=$(getent group $PGID | cut -d: -f1)
if [ -z "$GROUPNAME" ]; then
  addgroup -g $PGID appgroup
  GROUPNAME=appgroup
fi

adduser -D -u $PUID -G $GROUPNAME -h $APP_HOME appuser

mkdir -p $APP_HOME/static
chown -R $PUID:$PGID $APP_HOME
export HOME=$APP_HOME

echo "Starting with UID: $PUID, GID: $PGID"

# Fix permissions
mkdir -p /config /input /output
chown -R "$PUID":"$PGID" /config /input /output

until cd /home/app/web
do
    echo "Waiting for server volume..."
    sleep 1
done

until gosu "$PUID":"$PGID" python manage.py migrate
do
    echo "Waiting for db to be ready..."
    sleep 2
done

gosu "$PUID":"$PGID" python manage.py collectstatic --noinput

# Start Celery Worker
gosu "$PUID":"$PGID" celery -A bragibooks_proj worker --loglevel=info --concurrency ${CELERY_WORKERS:-1} -E &

echo "Starting server... DEBUG: $DEBUG"
# Check if DEBUG is set to true for development mode with hot reload
if [ "$DEBUG" = "true" ]; then
    echo "Starting Django development server with hot reload..."
    gosu "$PUID":"$PGID" python manage.py runserver 0.0.0.0:8000
else
    echo "Starting Gunicorn production server..."
    # Start gunicorn server
    gosu "$PUID":"$PGID" gunicorn bragibooks_proj.wsgi \
        --bind 0.0.0.0:8000 \
        --timeout 1200 \
        --worker-tmp-dir /dev/shm \
        --workers 2 \
        --threads 4 \
        --worker-class gthread \
        --enable-stdio-inheritance
fi
