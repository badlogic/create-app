# Create App

CLI for creating deployable web applications with Docker, Caddy, and modern tooling.

## Why This Exists

Self-hosting web applications shouldn't require complex infrastructure. This CLI creates apps that deploy to a single server with automatic SSL and dev/prod parity - simple, reliable hosting on your own or rented hardware.

Perfect for:
- **Personal projects** - blogs, portfolios, side projects
- **Small businesses** - company websites, internal tools
- **Prototypes** - MVPs that need real deployment
- **Learning** - understanding modern deployment without platform lock-in

Not suitable for:
- **High-scale applications** (use Kubernetes/cloud platforms)
- **Multi-region deployments** (single server architecture)
- **Complex microservices** (better served by orchestration platforms)

## Quick Start

### Interactive Setup
```bash
# Create a new app (prompts for template and configuration)
npx @mariozechner/create-app my-app
cd my-app

# Start development server
./run.sh dev

# Deploy to your server
./run.sh deploy
```

### CLI Arguments (No Prompts)
```bash
# Create with all options specified
npx @mariozechner/create-app my-app \
  --template frontend-api \
  --domain myapp.com \
  --server myserver.hetzner.de \
  --serverDir /home/username

# Quick static site
npx @mariozechner/create-app my-blog --template static --domain blog.example.com

# See all options
npx @mariozechner/create-app --help
```

## Templates

- **Static** - Static files with Tailwind 4 and live reload
- **Frontend + API** - SPA with backend API
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

### CLI Options

| Option | Short | Description | Example |
|--------|-------|-------------|---------|
| `--template` | `-t` | Template to use | `--template frontend-api` |
| `--domain` | | Domain for the app | `--domain myapp.com` |
| `--server` | | Production server hostname | `--server myserver.com` |
| `--serverDir` | | Server directory path | `--serverDir /home/username` |
| `--frontendPort` | | Frontend development port | `--frontendPort 3000` |
| `--apiPort` | | API development port | `--apiPort 8000` |
| `--help` | `-h` | Show help message | `--help` |

**Available templates:** `static`, `frontend-api`, `fullstack`

### Template-Specific Instructions

After creating a project, check the generated `README.md` for detailed instructions specific to your template.

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