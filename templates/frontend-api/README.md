# {{name}} - Frontend + API

SPA frontend built with Vite/TypeScript and Node.js Express API backend.

## Architecture

- **Frontend**: Vite + TypeScript SPA served by Nginx
- **Backend**: Express.js API with TypeScript  
- **Deployment**: Docker containers with Caddy reverse proxy

## Development

```bash
# Start development servers (with file watching)
./run.sh dev

# View logs
./run.sh logs

# Stop services
./run.sh stop
```

**Development URLs:**
- Frontend: http://localhost:{{frontendPort}}
- API: http://localhost:{{apiPort}}
- API Health: http://localhost:{{apiPort}}/api/health

## Production

```bash
# Build and start production servers
./run.sh prod

# Deploy to server
./run.sh deploy
```

## API Endpoints

The backend provides these example endpoints:

- `GET /api/health` - Health check
- `GET /api/hello` - Example endpoint

## Adding Features

### Frontend
- Edit files in `frontend/src/`
- Main entry: `frontend/src/main.ts`
- Styles: `frontend/src/style.css`

### Backend  
- Edit `backend/server.ts`
- Add new routes and middleware as needed

### Environment
- Development ports configurable in `docker-compose.yml`
- Production domain configured during deployment

## File Structure

```
{{name}}/
├── frontend/          # Vite SPA
│   ├── src/
│   │   ├── main.ts   # App entry point
│   │   └── style.css # Styles
│   ├── index.html
│   └── package.json
├── backend/           # Express API
│   ├── server.ts     # API server
│   └── package.json
├── docker-compose.yml # Container orchestration
├── nginx.conf        # Frontend + API routing
└── run.sh           # Development/deployment scripts
```

The frontend makes API calls to `/api/*` routes, which Nginx proxies to the backend container.