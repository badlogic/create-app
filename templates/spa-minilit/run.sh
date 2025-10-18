#!/bin/bash

sync_files() {
    echo "Syncing files to $SERVER..."
    rsync -avz \
      --include="dist/***" \
      --include="infra/***" \
      --include="run.sh" \
      --include=".env" \
      --include="package-lock.json" \
      --include="package.json" \
      --exclude="*" \
      --delete \
      ./ $SERVER:$SERVER_DIR/
}

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

SERVER={{server}}
SERVER_DIR={{serverDir}}/{{domain}}

case "$1" in
dev)
    echo "Starting development environment..."
    echo "Frontend: http://localhost:8080"
    echo "Backend API: http://localhost:3000"
    echo ""

    # Create data directory if it doesn't exist
    mkdir -p data

    # Start backend in background
    npx tsx watch src/backend/server.ts &
    BACKEND_PID=$!

    # Start frontend dev server
    npx vite --config infra/vite.config.ts --port 8080 --clearScreen false &
    VITE_PID=$!

    # Cleanup function
    cleanup() {
        echo -e "\nStopping development servers..."
        kill $BACKEND_PID 2>/dev/null || true
        kill $VITE_PID 2>/dev/null || true
        exit 0
    }

    trap cleanup INT TERM

    # Wait for either process (compatible with macOS bash)
    wait
    ;;

build)
    echo "Building for production..."

    # Build frontend
    echo "Building frontend with Vite..."
    npx vite build --config infra/vite.config.ts

    # Build backend
    echo "Building backend with TypeScript..."
    npx tsc --project tsconfig.backend.json

    echo "✅ Build complete!"
    ;;

deploy)
    echo "Building for production..."

    # Install dependencies
    npm install

    # Build frontend
    echo "Building frontend with Vite..."
    npx vite build --config infra/vite.config.ts

    # Build backend
    echo "Building backend with TypeScript..."
    npx tsc --project tsconfig.backend.json

    sync_files

    echo "Restarting services on remote server..."
    ssh $SERVER "cd $SERVER_DIR && ./run.sh stop && ./run.sh prod"

    echo "✅ Deployed successfully!"
    ;;

prod)
    echo "Starting production server..."
    docker compose -f infra/docker-compose.yml up -d --build
    ;;

stop)
    echo "Stopping services..."
    docker compose -f infra/docker-compose.yml down
    ;;

logs)
    docker compose -f infra/docker-compose.yml logs -f
    ;;

logs-remote)
    echo "Streaming logs from {{domain}}..."
    ssh -t $SERVER "cd $SERVER_DIR && ./run.sh logs"
    ;;

sync)
    echo "Syncing to {{domain}}..."
    sync_files
    echo "✅ Synced to {{domain}}"
    ;;

*)
    echo "Usage: $0 {dev|build|deploy|prod|stop|logs|logs-remote|sync}"
    echo ""
    echo "  dev          - Start local development (backend + frontend with hot reload)"
    echo "  build        - Build frontend and backend for production (locally)"
    echo "  deploy       - Build and deploy to production server"
    echo "  prod         - Start production Docker containers (on server)"
    echo "  stop         - Stop Docker containers"
    echo "  logs         - Show Docker logs"
    echo "  logs-remote  - Stream logs from production server"
    echo "  sync         - Sync files to server without restarting"
    exit 1
    ;;
esac
