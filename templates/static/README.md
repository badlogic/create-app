# {{name}}

Static site with TypeScript, Tailwind 4, live reload, and Docker deployment.

## Workflow

### 1. Development

```bash
# Start dev environment (Docker + live reload)
./run.sh dev

# Your app is now running at http://localhost:8080
# Edit files in src/ and see changes instantly

# Run on a different port
PORT=8081 ./run.sh dev

# For parallel development, use git worktrees
git worktree add ../{{name}}-feature feature-branch
cd ../{{name}}-feature
PORT=8081 ./run.sh dev  # Runs independently with its own dist/
```

### 2. Production Deployment

```bash
# Deploy to your server (builds automatically)
./run.sh deploy
```

The deploy command:
1. Builds TypeScript and CSS locally
2. Syncs files to your server via rsync
3. Restarts services with Docker Compose
4. Caddy automatically handles SSL and routing

## Project Structure

```
{{name}}/
├── src/             # Source files
│   ├── index.html   # Main HTML
│   ├── index.ts     # TypeScript (includes live reload)
│   └── styles.css   # Tailwind CSS
├── dist/            # Build output (git ignored)
├── infra/           # Infrastructure
│   ├── build.js     # Build script
│   ├── docker-compose.yml      # Base configuration
│   ├── docker-compose.dev.yml  # Development overrides
│   └── docker-compose.prod.yml # Production overrides
├── run.sh           # All-in-one CLI
└── package.json     # Dependencies
```

## Commands

```bash
./run.sh dev              # Start dev server at localhost:8080
PORT=8081 ./run.sh dev    # Start on custom port
./run.sh prod             # Run production locally
./run.sh deploy           # Deploy to {{domain}}
./run.sh sync             # Sync files (dist/, infra/) to {{domain}}
./run.sh stop             # Stop containers locally
./run.sh logs             # View container logs locally
```

Deploys to `{{serverDir}}/{{domain}}/` on `{{server}}`. Caddy automatically routes `{{domain}}` traffic to this container with SSL.

## Tech Stack

- **TypeScript** with tsup bundler
- **Tailwind 4** with automatic compilation
- **Nginx** static file server
- **Live reload** via WebSocket proxy (no separate port)
- **Docker** for dev/prod parity
- **Caddy** reverse proxy with automatic SSL

## Architecture Notes

- All traffic goes through nginx (port 80), including WebSocket connections
- Live reload WebSocket is proxied at `/livereload` endpoint
- Multiple instances can run simultaneously with different PORT values
- Each instance gets its own Docker containers (project-name includes port)
- Git worktrees recommended for parallel feature development