#!/bin/bash

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

PROJECT={{name}}
SERVER={{server}}
SERVER_DIR={{serverDir}}
DOMAIN={{domain}}

# Use different project name if PORT is set to allow multiple instances
if [ -n "$PORT" ]; then
    PROJECT="${PROJECT}-${PORT}"
fi

sync_files() {
    echo "Building for production..."
    npm install
    node infra/build.js

    echo "Syncing files..."
    rsync -avz \
      --include="dist/***" \
      --include="infra/***" \
      --include="run.sh" \
      --include=".env" \
      --include="package-lock.json" \
      --include="package.json" \
      --exclude="*" \
      --delete \
      ./ $SERVER:$SERVER_DIR/$DOMAIN/
}

pushd "$SCRIPT_DIR" > /dev/null

case "$1" in
dev)
    # Ensure .env exists to prevent docker-compose errors
    touch .env
    ./run.sh stop
    echo "Starting development server..."
    npm install
    node infra/build.js
    node infra/build.js --watch &
    WATCH_PID=$!

    # Function to cleanup background processes
    cleanup() {
        echo -e "\nCleaning up..."
        # Kill the watch process
        if [ ! -z "$WATCH_PID" ]; then
            kill $WATCH_PID 2>/dev/null
            echo "Stopped watch process"
        fi
        # Also cleanup any node processes running build.js
        pkill -f "node infra/build.js" 2>/dev/null
        exit 0
    }

    # Set trap for cleanup
    trap cleanup INT TERM

    docker compose -p $PROJECT -f infra/docker-compose.yml -f infra/docker-compose.dev.yml up --build --menu=false

    # Cleanup after docker-compose exits
    cleanup
    ;;
prod)
    echo "Starting production server..."
    docker compose -p $PROJECT -f infra/docker-compose.yml -f infra/docker-compose.prod.yml up -d --build
    ;;
stop)
    echo "Stopping services..."
    docker compose -p $PROJECT -f infra/docker-compose.yml -f infra/docker-compose.dev.yml down 2>/dev/null || \
    docker compose -p $PROJECT -f infra/docker-compose.yml -f infra/docker-compose.prod.yml down
    ;;
logs)
    docker compose -p $PROJECT -f infra/docker-compose.yml -f infra/docker-compose.dev.yml logs -f 2>/dev/null || \
    docker compose -p $PROJECT -f infra/docker-compose.yml -f infra/docker-compose.prod.yml logs -f
    ;;
logs-remote)
    echo "Streaming logs from $DOMAIN..."
    ssh -t $SERVER "cd $SERVER_DIR/$DOMAIN && ./run.sh logs"
    ;;
deploy)
    echo "Deploying $PROJECT to $DOMAIN..."
    npm install
    node infra/build.js
    sync_files

    echo "Restarting services..."
    ssh $SERVER "cd $SERVER_DIR/$DOMAIN && ./run.sh stop && ./run.sh prod"

    echo "✅ Deployed to https://$DOMAIN"
    ;;
sync)
    echo "Syncing $PROJECT to $DOMAIN..."
    sync_files
    echo "✅ Synced to $DOMAIN"
    ;;
*)
    echo "Usage: $0 {dev|prod|stop|logs|logs-remote|deploy|sync}"
    echo ""
    echo "  dev         - Start development server (foreground)"
    echo "  prod        - Start production server (background)"
    echo "  stop        - Stop all services"
    echo "  logs        - Show local logs"
    echo "  logs-remote - Show logs from remote server"
    echo "  deploy      - Deploy and restart services"
    echo "  sync        - Sync files only, no restart"
    exit 1
    ;;
esac

popd > /dev/null
