# {{name}}

Single Page Application with API backend, built with Vite, Lit, mini-lit components, and Express.

## Features

- **Vite** - Fast development and optimized production builds
- **Lit** - Lightweight reactive templating
- **mini-lit** - Pre-built UI components with shadcn theming
- **Express** - Simple, flexible Node.js API
- **Tailwind CSS v4** - Modern utility-first styling
- **TypeScript** - Full type safety
- **Docker** - Production deployment with Caddy reverse proxy

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development servers (frontend + backend)
./run.sh dev
```

- Frontend: http://localhost:8080
- Backend API: http://localhost:3000

### Production Build

```bash
# Build both frontend and backend
./run.sh build

# Or deploy to server
./run.sh deploy
```

## Project Structure

```
{{name}}/
├── src/
│   ├── frontend/
│   │   ├── index.html      # HTML entry point
│   │   ├── index.ts        # Frontend entry point (Lit + mini-lit)
│   │   ├── styles.css      # Tailwind CSS configuration
│   │   └── public/         # Static assets
│   └── backend/
│       └── server.ts       # Express API server
├── infra/
│   ├── vite.config.ts      # Vite configuration
│   ├── docker-compose.yml  # Docker services
│   └── Caddyfile           # Caddy reverse proxy config
├── dist/                   # Build output
├── run.sh                  # Development and deployment scripts
└── package.json
```

## Available Commands

- `./run.sh dev` - Start development servers with hot reload
- `./run.sh build` - Build for production (local)
- `./run.sh deploy` - Build and deploy to production server
- `./run.sh prod` - Start production Docker containers
- `./run.sh stop` - Stop Docker containers
- `./run.sh logs` - View Docker logs
- `./run.sh sync` - Sync files to server without restart

## Development

### Adding API Endpoints

Edit `src/backend/server.ts`:

```typescript
app.get('/api/myendpoint', (req, res) => {
  res.json({ data: 'your data' });
});
```

### Adding UI Components

Import mini-lit components directly for optimal tree-shaking:

```typescript
import { Button } from "@mariozechner/mini-lit/dist/Button.js";
import { Card } from "@mariozechner/mini-lit/dist/Card.js";
import { html } from "lit";

const MyComponent = () => html`
  ${Card(html`
    <h2>My Card</h2>
    ${Button({
      children: "Click me",
      onClick: () => console.log("Clicked!")
    })}
  `)}
`;
```

**Important**: Always import from `/dist/*.js` for tree-shaking, not from the root index!

### Styling

Tailwind CSS v4 with shadcn theming is configured in `src/frontend/styles.css`. You can:

- Use Tailwind utility classes directly
- Switch themes by importing different CSS files from `@mariozechner/mini-lit/styles/themes/`
- Add custom CSS as needed

## Deployment

### Prerequisites

- Server with Docker and Caddy configured
- DNS pointing to your server
- SSH access to the server

### Deploy

```bash
./run.sh deploy
```

This will:
1. Install dependencies
2. Build frontend with Vite
3. Build backend with TypeScript
4. Sync files to server
5. Restart Docker containers

## Environment Variables

Copy `env.vars` to `.env` and configure:

```bash
PORT=3000
NODE_ENV=production
# Add your variables here
```

## Learn More

- [Vite Documentation](https://vitejs.dev/)
- [Lit Documentation](https://lit.dev/)
- [mini-lit Documentation](https://minilit.mariozechner.at/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Express Documentation](https://expressjs.com/)
