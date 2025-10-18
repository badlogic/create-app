# {{name}}

Single Page Application with API backend, built with Lit, mini-lit components, Vaadin Router, and Express.

## Features

- **Type-safe API** - Shared types between frontend and backend with auto-generated routes and client
- **Vaadin Router** - Client-side routing for SPAs
- **Storage** - FileStore and DirectoryStore for easy data persistence
- **Lit** - Lightweight reactive templating and Web Components
- **mini-lit** - Pre-built UI components with shadcn theming
- **Express** - Simple, flexible Node.js API
- **Vite** - Fast development and optimized production builds
- **Tailwind CSS v4** - Modern utility-first styling
- **TypeScript** - Full type safety across the stack
- **Docker** - Production deployment with Caddy reverse proxy

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development servers (frontend + backend with hot reload)
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
│   │   ├── index.html        # HTML entry point
│   │   ├── main.ts           # Router setup
│   │   ├── api-client.ts     # Auto-generated API client
│   │   ├── pages/            # Page components
│   │   │   └── home.ts       # Example home page
│   │   ├── styles.css        # Tailwind CSS configuration
│   │   └── public/           # Static assets
│   ├── backend/
│   │   ├── server.ts         # Express server with API handlers
│   │   ├── api-server.ts     # Auto-generated Express routes
│   │   └── storage.ts        # FileStore and DirectoryStore
│   └── shared/
│       ├── api.ts            # API interface and route definitions
│       └── types.ts          # Shared TypeScript types
├── infra/
│   ├── vite.config.ts        # Vite configuration
│   ├── docker-compose.yml    # Docker services
│   └── Caddyfile             # Caddy reverse proxy config
├── data/                     # Persistent data (git ignored)
├── dist/                     # Build output
│   ├── frontend/             # Built frontend assets
│   ├── backend/              # Compiled backend code
│   └── shared/               # Compiled shared code
├── run.sh                    # Development and deployment scripts
└── package.json
```

## Available Commands

- `./run.sh dev` - Start development servers with hot reload
- `./run.sh build` - Build for production (local)
- `./run.sh deploy` - Build and deploy to production server
- `./run.sh prod` - Start production Docker containers
- `./run.sh stop` - Stop Docker containers
- `./run.sh logs` - View Docker logs
- `./run.sh logs-remote` - Stream logs from production server
- `./run.sh sync` - Sync files to server without restart

## Development

### Type-Safe API Development

The project uses a shared API contract defined in `src/shared/api.ts`. This ensures type safety across frontend and backend:

1. **Define your API in `src/shared/api.ts`**:

```typescript
// Add types to src/shared/types.ts
export interface User {
  id: string;
  name: string;
}

// Add to API interface and routes in src/shared/api.ts
export interface Api {
  // ... existing methods
  getUser(id: string): Promise<User | null>;
}

export const apiRoutes: Record<keyof Api, RouteDefinition> = {
  // ... existing routes
  getUser: { method: "GET", path: "/users/:id" },
};
```

2. **Implement handler in `src/backend/server.ts`**:

```typescript
const handlers: Api = {
  // ... existing handlers
  getUser: async (id: string): Promise<User | null> => {
    // Your implementation
    return { id, name: "John Doe" };
  }
};
```

3. **Use on frontend**:

```typescript
import { createApiClient } from "../api-client.js";
import type { User } from "../../shared/types.js";

const api = createApiClient();

// Fully typed API call
const user: User | null = await api.getUser("123");
```

The Express routes and fetch client are **automatically generated** from your API definition!

### Adding Pages

Create new page components in `src/frontend/pages/`:

```typescript
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("page-about")
export class PageAbout extends LitElement {
  createRenderRoot() {
    return this; // Use Tailwind classes
  }

  render() {
    return html`
      <div class="p-8">
        <h1 class="text-2xl">About</h1>
      </div>
    `;
  }
}
```

Then register the route in `src/frontend/main.ts`:

```typescript
import "./pages/about.js";

const routes: Route[] = [
  // ... existing routes
  {
    path: "/about",
    component: "page-about",
  },
];
```

### Data Persistence

Use the built-in storage utilities:

```typescript
import { FileStore, DirectoryStore } from "./storage.js";

// Single JSON file storage
const settings = new FileStore<Settings>("./data/settings.json");
settings.setItem("theme", { mode: "dark" });
const theme = settings.getItem("theme");

// Directory-based storage (one file per item)
const users = new DirectoryStore<User>("./data/users");
users.setItem("user-123", { id: "123", name: "Alice" });
const user = users.getItem("user-123");
```

Data is automatically saved to the `data/` directory and persisted in Docker via volume mount.

### UI Components

Import mini-lit components for optimal tree-shaking:

```typescript
import { Button } from "@mariozechner/mini-lit/dist/Button.js";
import { Card, CardHeader } from "@mariozechner/mini-lit/dist/Card.js";
import { html } from "lit";

const MyComponent = () => html`
  ${Card(html`
    ${CardHeader(html`<h2>My Card</h2>`)}
    <div class="p-4">
      ${Button({
        children: html`Click me`,
        onClick: () => console.log("Clicked!")
      })}
    </div>
  `)}
`;
```

**Important**: Always import from `/dist/*.js` for tree-shaking, not from the root index!

### Styling

Tailwind CSS v4 with shadcn theming is configured in `src/frontend/styles.css`. You can:

- Use Tailwind utility classes directly in your components
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

Your app will be available at: https://{{domain}}

## Environment Variables

Copy `env.vars` to `.env` and configure:

```bash
PORT=3000
NODE_ENV=production
DATA_DIR=/data
# Add your variables here
```

## Learn More

- [Vite Documentation](https://vitejs.dev/)
- [Lit Documentation](https://lit.dev/)
- [Vaadin Router Documentation](https://vaadin.com/router)
- [mini-lit Documentation](https://minilit.mariozechner.at/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Express Documentation](https://expressjs.com/)
