# Create App

CLI for creating deployable web applications with Docker, Caddy, and modern tooling.

## Why This Exists

Self-hosting web applications shouldn't require complex infrastructure. This CLI creates apps that deploy to a single server with automatic SSL and true dev/prod parity - simple, reliable hosting on your own or rented hardware.

Perfect for:
- **Personal projects** - blogs, portfolios, side projects
- **Small businesses** - company websites, internal tools
- **Prototypes** - MVPs that need real deployment
- **Learning** - understanding modern deployment without platform lock-in

Not suitable for:
- **High-scale applications** (use Kubernetes/cloud platforms)
- **Multi-region deployments** (single server architecture)
- **Complex microservices** (better served by orchestration platforms)

## Features

- **True dev/prod parity** - Identical Docker containers for development and production
- **Automatic SSL** - Caddy handles Let's Encrypt certificates automatically
- **Live reload** - Instant feedback during development with file watching
- **Zero-config deployment** - Single command deploys via rsync to your server
- **Modern CSS** - Tailwind 4 with automatic compilation and optimization
- **Docker networking** - Automatic service discovery and routing
- **Production ready** - Complete server configuration guide

## Quick Start

```bash
# Create a new app
npx @mariozechner/create-app my-app
cd my-app

# Start development server
./run.sh dev

# Build for production
./run.sh build

# Deploy to your server
./run.sh deploy
```

## Templates

- **Static** - Static files with Tailwind 4 and live reload
- **Frontend + API** - SPA with backend API (coming soon)
- **Fullstack** - Complete web application (coming soon)

## Prerequisites

### Server Setup

Your production server needs Docker, Caddy, and proper configuration. See [SERVER.md](SERVER.md) for complete setup instructions.

### DNS Configuration

Point your domain to the server:

```
A    yourdomain.com    -> server-ip
A    *.yourdomain.com  -> server-ip  (for subdomains)
```

## Usage

Workflows are template-specific. After creating a project, check the generated `README.md` for detailed instructions.

**Example:** [Static template workflow](templates/static/README.md)

```bash
npx @mariozechner/create-app my-blog
cd my-blog
cat README.md  # Template-specific instructions
```

## Common Issues

**Server setup required:**
Before deploying, your server needs Docker and Caddy configured. See [SERVER.md](SERVER.md) for complete setup instructions.

**Template-specific issues:**
Check the `README.md` in your generated project for troubleshooting specific to your template type.

## Development

To work on this CLI tool itself:

```bash
git clone <repository>
cd create-app
npm install
npm run build
npx tsx src/cli.ts test-app
```