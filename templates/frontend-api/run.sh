#!/bin/bash

set -e

PROJECT={{name}}
SERVER={{server}}
SERVER_DIR={{serverDir}}
DOMAIN={{domain}}

case "$1" in
dev)
    echo "Starting development servers..."
    echo "Building frontend and backend initially..."
    docker compose run --rm frontend-builder npm run build
    docker compose run --rm backend-builder npm run build
    echo "Starting services with file watchers..."
    docker compose --profile dev up --build
    ;;
prod)
    echo "Building frontend and backend..."
    docker compose run --rm frontend-builder npm run build
    docker compose run --rm backend-builder npm run build
    echo "Starting production servers..."
    docker compose up -d --build frontend backend
    ;;
stop)
    echo "Stopping services..."
    docker compose --profile dev down
    ;;
logs)
    docker compose --profile dev logs -f
    ;;
shell-frontend)
    docker compose exec frontend sh
    ;;
shell-backend)
    docker compose exec backend sh
    ;;
deploy)
    echo "Deploying $PROJECT to $DOMAIN..."
    
    # Build everything locally first
    echo "Building frontend and backend..."
    docker compose run --rm frontend-builder npm run build
    docker compose run --rm backend-builder npm run build
    
    # Sync files to server
    echo "Syncing files..."
    rsync -avz --delete \
      --exclude node_modules \
      --exclude .git \
      --exclude .DS_Store \
      --exclude frontend/src \
      --exclude backend/src \
      ./ $SERVER:$SERVER_DIR/$PROJECT/
    
    # Install dependencies and restart services on server
    echo "Installing dependencies and restarting services..."
    ssh $SERVER "cd $SERVER_DIR/$PROJECT && ./run.sh stop && ./run.sh prod"
    
    echo "✅ Deployed to https://$DOMAIN"
    ;;
*)
    echo "Usage: $0 {dev|prod|stop|logs|shell-frontend|shell-backend|deploy}"
    echo ""
    echo "  dev             - Start development servers (foreground)"
    echo "  prod            - Start production servers (background)"
    echo "  stop            - Stop all services"
    echo "  logs            - Show logs"
    echo "  shell-frontend  - Open shell in frontend container"
    echo "  shell-backend   - Open shell in backend container"
    echo "  deploy          - Deploy to production server"
    exit 1
    ;;
esac