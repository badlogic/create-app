# {{name}}

Static site with Tailwind 4, live reload, and Docker deployment.

## Workflow

### 1. Development

```bash
# Start dev environment (Docker + live reload)
./run.sh dev

# Your app is now running at http://localhost:8080
# Edit files in public/ and see changes instantly
```

### 2. Production Deployment

```bash
# Build production assets
./run.sh build

# Deploy to your server
./run.sh deploy
```

The deploy command:
1. Builds production Docker image
2. Syncs files to your server via rsync
3. Starts services with Docker Compose
4. Caddy automatically handles SSL and routing

## Project Structure

```
{{name}}/
├── public/           # Your website files
│   ├── index.html
│   ├── styles.css
│   └── ...
├── docker/
│   ├── docker-compose.yml      # Base configuration
│   ├── docker-compose.dev.yml  # Development overrides
│   └── docker-compose.prod.yml # Production overrides
├── run.sh           # Development commands
├── deploy.sh        # Deployment script
└── package.json     # Dependencies (Tailwind, etc.)
```

## Troubleshooting

### Development Issues

**Port already in use:**
```bash
./run.sh stop
./run.sh dev
```

**Live reload not working:**
- Check that you're editing files in `public/`
- Ensure port 35729 isn't blocked
- Try refreshing the browser

### Deployment Issues

**SSH connection failed:**
- Verify SSH key authentication is set up
- Check that your user has Docker group permissions
- Ensure the server is reachable

**Domain not accessible:**
- Verify DNS points to your server IP
- Check that Caddy is running: `docker ps | grep caddy`
- Wait 30 seconds for SSL certificate generation

**Permission denied:**
- Ensure your user is in the Docker group
- Log out and back in after adding to Docker group
- Check file permissions on the server

## Commands

```bash
./run.sh dev      # Start dev server at localhost:8080
./run.sh build    # Build production assets
./run.sh deploy   # Deploy to {{domain}}
./run.sh sync     # Sync files only
./run.sh stop     # Stop containers
```

Deploys to `{{serverDir}}/{{domain}}/` on `{{server}}`. Caddy automatically routes `{{domain}}` traffic to this container with SSL.

## Tech Stack

- **Tailwind 4** with automatic compilation
- **Nginx** static file server
- **Live reload** in development
- **Docker** for dev/prod parity
- **Caddy** reverse proxy with automatic SSL