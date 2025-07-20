# {{name}}

Static site with Tailwind 4, live reload, and Docker deployment.

## Development

```bash
./run.sh dev    # Start dev server at localhost:8080
```

Edit files in `public/` - auto-reload enabled.

## Deployment

```bash
./run.sh deploy # Deploy to {{domain}}
./run.sh sync   # Sync files only
```

Deploys to `{{serverDir}}/{{domain}}/` on `{{server}}`. Caddy automatically routes `{{domain}}` traffic to this container with SSL.

## Tech

- **Tailwind 4** with automatic compilation
- **Nginx** static file server
- **Live reload** in development
- **Docker** for dev/prod parity
- **Caddy** reverse proxy with automatic SSL