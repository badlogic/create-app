# {{packageName}}

{{description}}

## Development

```bash
# Install dependencies
npm install

# Development with watch mode
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Format and lint
npm run check
```

## Example

Open `example/index.html` in a browser after running `npm run build` to see the web component in action.

## Build Output

Running `npm run build` creates:
- `dist/index.js` - ES module
- `dist/index.d.ts` - TypeScript definitions
- `dist/index.js.map` - Source map for debugging

## Publishing

The `publish.sh` script handles versioning, tagging, and publishing:

```bash
# Patch release (1.0.0 -> 1.0.1)
./publish.sh

# Minor release (1.0.1 -> 1.1.0)
./publish.sh minor

# Major release (1.1.0 -> 2.0.0)
./publish.sh major
```

The script will:
1. Check for uncommitted changes
2. Run checks (format, lint, type-check)
3. Build the project
4. Bump version in package.json
5. Commit and tag the version
6. Push to GitHub with tags
7. Publish to npm