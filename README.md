# @mariozechner/create-app

A CLI tool for creating deployable apps with Caddy + Docker, designed for self-hosted environments.

## Features

- 🚀 **3 App Types**: Static, Frontend+API, Fullstack
- 🐳 **Docker-based**: Simple container orchestration
- 🔒 **Caddy Integration**: Automatic SSL with caddy-docker-proxy
- 🔧 **Local Development**: Port exposure and debugging support
- 📦 **One Command Deploy**: Simple rsync + restart deployment

## Usage

```bash
npx @mariozechner/create-app my-awesome-app
```

Follow the interactive prompts to configure your app.

## App Types

### Static Files Only
- Simple nginx container serving static files
- Perfect for documentation sites, landing pages
- Local dev: serves on configurable port

### Frontend + API
- Frontend: nginx serving static files
- Backend: Node.js/TypeScript API server
- nginx proxies `/api/*` to backend
- Local dev: both services exposed with debugging

### Fullstack
- Everything from Frontend + API
- PostgreSQL database with health checks
- Database connection ready in backend
- Local dev: database port exposed for direct connection

## Generated Structure

```
my-app/
├── docker-compose.yml    # Caddy labels for automatic SSL
├── run.sh               # dev/prod/stop/logs/deploy commands
├── frontend/            # (if applicable)
├── backend/             # (if applicable)
└── public/              # (static only)
```

## Local Development

```bash
cd my-app
./run.sh dev             # Start all services in Docker
```

**True Dev/Prod Parity:**
- Same Docker containers, nginx, and build process in dev and prod
- File watchers rebuild frontend/backend on changes
- Frontend available at `http://localhost:8080`
- API available at `http://localhost:3333` 
- Database available at `localhost:5432` (fullstack)
- Node.js debugging on port `9230`

## Production Deployment

```bash
./run.sh deploy          # Deploy to your server
```

Automatically:
1. Builds frontend and backend in Docker
2. Syncs built files to server via rsync
3. Restarts services on server
4. SSL certificates managed by Caddy

## Requirements

- Docker & Docker Compose
- Server with caddy-docker-proxy running
- SSH access to deployment server

## Template System

Easy to extend with new app types. Each template defines:
- Interactive prompts
- File structure
- Docker configuration
- Build/deploy scripts