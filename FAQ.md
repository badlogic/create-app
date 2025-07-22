# Create App FAQ

### Static Template

#### Why not use Vite/Webpack/Parcel?

Those are great tools, but they come with complexity and magic. `scripts/build.js` is 70 lines of readable code that you can understand, modify, and debug. No black boxes, no plugin ecosystems, no configuration layers.

#### Why a custom build script instead of npm scripts?

- **Cross-platform**: Works on Windows, Mac, Linux without special syntax
- **Debuggable**: Add console.logs, set breakpoints, handle errors properly
- **Maintainable**: Complex npm scripts become unreadable quickly
- **Educational**: See exactly how the build process works

### Why IIFE instead of ES modules?

For static sites, IIFE (Immediately Invoked Function Expression) is simpler:
- **Works offline**: Can open index.html directly from filesystem (ES modules need a server)
- **Single output file**: Everything bundled together, easy to understand
- **No module complexity**: For adding some interactivity, module systems are overkill
- **Simpler deployment**: One script tag, one file, done

ES modules are the future, but for static sites with minimal JS, IIFE just works.

### Why no Hot Module Replacement (HMR)?

HMR adds complexity for minimal benefit on static sites:
- Full page reload is instant anyway
- No complex state to preserve
- True dev/prod parity (both use same files)
- One less thing to debug

### Why copy everything from src/ to dist/?

Simplicity. You organize `src/` however you want - images, fonts, whatever. Everything gets copied, no special asset handling, no surprises.

### Can I add more build tools?

Of course! The build script is yours to modify. Want Sass? Add it. Need image optimization? Add it. The point is you're in control.

### Is this production-ready?

Yes. This setup is:
- Fast (esbuild via tsup is lightning quick)
- Reliable (simple tools, few dependencies)
- Deployable (outputs standard HTML/CSS/JS files)

### When should I use something else?

If you need:
- A frontend framework (React, Vue, Svelte)
- Complex bundling (code splitting, dynamic imports)
- Advanced dev features (HMR, React Fast Refresh)

Go with Next.js/Vite/etc. in that case. Think if you really need to though.