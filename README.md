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
  --template spa-api \
  --domain myapp.com \
  --server myserver.hetzner.de \
  --serverDir /home/username

# Quick static site
npx @mariozechner/create-app my-blog --template static --domain blog.example.com

# See all options
npx @mariozechner/create-app --help
```

## Templates

### Available Templates

#### Static
- **Description**: Static file server with modern frontend tooling
- **Features**: 
  - Tailwind CSS 4 with live reload
  - TypeScript support
  - Automated testing setup
  - Optimized production builds
- **Use for**: Landing pages, documentation sites, blogs, portfolios

#### SPA + API
- **Description**: Single Page Application with backend API
- **Inherits**: All features from the Static template
- **Additional Features**:
  - Express.js backend API
  - Frontend/backend code sharing
  - API proxy in development
  - Separate frontend/backend builds
- **Use for**: Web apps, internal tools, data-driven applications

### More templates coming soon!

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
| `--template` | `-t` | Template to use | `--template spa-api` |
| `--domain` | | Domain for the app | `--domain myapp.com` |
| `--server` | | Production server hostname | `--server myserver.com` |
| `--serverDir` | | Server directory path | `--serverDir /home/username` |
| `--frontendPort` | | Frontend development port | `--frontendPort 3000` |
| `--apiPort` | | API development port | `--apiPort 8000` |
| `--help` | `-h` | Show help message | `--help` |

**Available templates:** `static`, `spa-api`

### Template-Specific Instructions

After creating a project, check the generated `README.md` for detailed instructions specific to your template.

```bash
npx @mariozechner/create-app my-blog
cd my-blog
cat README.md  # Template-specific instructions
```

## Development

### Working on the CLI

To work on this CLI tool itself:

```bash
git clone https://github.com/badlogic/create-app
cd create-app
npm install
npx tsx src/cli.ts test-app
```

### Template System

The template system supports inheritance and file transformations, making it easy to create and maintain templates.

#### Template Structure

Each template is a directory in `templates/` containing:
- `template.json` - Template metadata and configuration
- Template files and directories
- Special filename prefixes for transformations:
  - `+filename` - File will be merged with inherited file (JSON/YAML only)
  - `-filename` - Marks a file/directory for deletion from inherited template
  - Regular files - Replace inherited files or create new ones

#### Creating a New Template

1. Create a new directory in `templates/`:
```bash
mkdir templates/my-template
```

2. Add `template.json`:
```json
{
  "name": "My Template",
  "description": "Description of what this template creates",
  "prompts": [
    {
      "name": "domain",
      "type": "text",
      "message": "Domain (e.g. myapp.com)"
    }
  ]
}
```

3. Add your template files with proper structure:
```
templates/my-template/
├── template.json
├── package.json
├── src/
│   └── index.ts
└── infra/
    ├── Caddyfile
    └── docker-compose.yml
```

#### Template Inheritance

Templates can inherit from other templates using the `inherits` field:

```json
{
  "name": "Extended Template",
  "description": "Builds on the static template",
  "inherits": ["static"],
  "prompts": [...]
}
```

**Inheritance rules:**
- Files from parent templates are copied first
- Child template files override parent files with the same path
- Files prefixed with `+` are merged with parent files (JSON/YAML only)
- Files prefixed with `-` delete the corresponding file from parent
- Multiple inheritance is processed in order

**Example:** The `spa-api` template inherits from `static` and:
- Keeps all static template files (frontend build, testing, etc.)
- Adds `+package.json` to merge additional dependencies
- Adds `+docker-compose.yml` to extend Docker services
- Adds new files like `src/backend/server.ts`
- Could use `-README.md` to remove the parent's README (if needed)

#### File Merging

Files prefixed with `+` are intelligently merged based on their type:

- **JSON files** (`+package.json`): Deep merged with parent
- **YAML files** (`+docker-compose.yml`): Deep merged with special handling for arrays
- **Other files**: Not supported for merging (warning shown)

Example `+package.json` in child template:
```json
{
  "scripts": {
    "build:backend": "tsup"
  },
  "dependencies": {
    "express": "^4.18.0"
  }
}
```

This will merge with the parent's package.json, adding new scripts and dependencies.

#### File Deletion

Files or directories prefixed with `-` mark items for deletion from the inherited template:

- `-README.md` - Removes README.md from parent template
- `-src/oldfeature/` - Removes entire directory from parent template

This is useful when inheriting from a template but needing to remove specific files.

#### Variable Substitution

Template files can use variables that get replaced during project creation:
- `{{projectName}}` - The project name
- `{{domain}}` - The domain from prompts
- `{{server}}` - The server hostname
- `{{serverDir}}` - The server directory
- Any other prompt values

### Best Practices

1. **Use inheritance** to avoid duplication - build on existing templates
2. **Keep templates focused** - each template should solve one use case well
3. **Document your template** - include a README.md in the template
4. **Test thoroughly** - ensure both dev and production modes work
5. **Follow conventions** - match the structure and patterns of existing templates

## Common Issues

**Server setup required:**
Before deploying, your server needs Docker and Caddy configured. See [SERVER.md](SERVER.md) for complete setup instructions.

**Template-specific issues:**
Check the `README.md` in your generated project for troubleshooting specific to your template type.

## Contributing

Contributions are welcome! When adding new templates:
1. Follow the template structure guidelines above
2. Include comprehensive documentation
3. Test both development and production workflows
4. Consider if inheritance from existing templates makes sense