#!/bin/bash

set -e

PROJECT={{name}}
SERVER={{server}}
SERVER_DIR={{serverDir}}
DOMAIN={{domain}}

case "$1" in
dev)
    echo "Starting development server..."
    npm install
    npm run build
    npm run dev &
    docker compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up --build --menu=false
    ;;
prod)
    echo "Starting production server..."
    docker compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml up -d --build
    ;;
stop)
    echo "Stopping services..."
    docker compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml down 2>/dev/null || \
    docker compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml down
    ;;
logs)
    docker compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml logs -f 2>/dev/null || \
    docker compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml logs -f
    ;;
deploy)
    echo "Deploying $PROJECT to $DOMAIN..."

    echo "Building for production..."
    npm install
    npm run build

    echo "Syncing files..."
    rsync -avz --delete \
      --exclude node_modules \
      --exclude .git \
      --exclude .DS_Store \
      ./ $SERVER:$SERVER_DIR/$DOMAIN/

    echo "Restarting services..."
    ssh $SERVER "cd $SERVER_DIR/$DOMAIN && ./run.sh stop && ./run.sh prod"

    echo "✅ Deployed to https://$DOMAIN"
    ;;
sync)
    echo "Syncing $PROJECT to $DOMAIN..."

    echo "Building for production..."
    npm install
    npm run build

    echo "Syncing files..."
    rsync -avz --delete \
      --exclude node_modules \
      --exclude .git \
      --exclude .DS_Store \
      ./ $SERVER:$SERVER_DIR/$DOMAIN/

    echo "✅ Synced to $DOMAIN"
    ;;
*)
    echo "Usage: $0 {dev|prod|stop|logs|deploy|sync}"
    echo ""
    echo "  dev     - Start development server (foreground)"
    echo "  prod    - Start production server (background)"
    echo "  stop    - Stop all services"
    echo "  logs    - Show logs"
    echo "  deploy  - Deploy and restart services"
    echo "  sync    - Sync files only, no restart"
    exit 1
    ;;
esac