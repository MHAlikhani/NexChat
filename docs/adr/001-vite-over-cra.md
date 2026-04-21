# ADR 001: Vite over Create React App

## Status

Accepted

## Context

When starting NexChat, we needed a build tool for our React + TypeScript application. The default choice for years has been Create React App (CRA), but CRA had become increasingly outdated and slow compared to modern alternatives.

Key requirements:

- Fast development server with HMR
- Modern build performance
- Native ESM support
- Good TypeScript support
- Active maintenance

## Decision

We chose **Vite** as our build tool.

## Consequences

### Positive

- ⚡ **Lightning-fast dev server**: Vite leverages native ES modules, resulting in sub-second cold starts regardless of app size
- 🔥 **Instant HMR**: Hot Module Replacement is nearly instantaneous because Vite only updates changed modules
- 📦 **Optimized builds**: Uses Rollup for production builds with excellent tree-shaking
- 🛠️ **Flexible configuration**: Easy to customize via `vite.config.ts`
- 📱 **Modern features**: First-class support for CSS modules, JSON imports, WASM, etc.
- 🔄 **Active development**: Regular updates and modern plugin ecosystem

### Negative

- ⚠️ **Migration cost**: Existing CRA projects require migration effort
- 📚 **Documentation learning curve**: Slightly less beginner-friendly than CRA's "zero-config" approach
- 🧪 **Testing setup**: Requires additional configuration for Jest/Vitest

## Alternatives Considered

### Create React App (CRA)

- **Rejected**: No longer actively maintained, slow build times, Webpack 5 with suboptimal defaults
- **When it made sense**: Pre-2022 projects needing zero configuration

### Webpack 5 (manual configuration)

- **Rejected**: Too much configuration overhead, slower than Vite
- **When it makes sense**: Enterprise projects with complex build requirements

### Parcel

- **Rejected**: Less mature plugin ecosystem, slower than Vite in benchmarks
- **When it makes sense**: Prototyping, smaller projects

### esbuild (standalone)

- **Rejected**: Too low-level, lacks dev server, requires manual configuration
- **When it makes sense**: Library authors, custom build pipelines

## Migration Notes

If migrating from CRA:

1. Remove `react-scripts` dependency
2. Install `vite`, `@vitejs/plugin-react`
3. Create `vite.config.ts`
4. Update scripts in `package.json`:
   ```json
   "dev": "vite",
   "build": "tsc && vite build",
   "preview": "vite preview"
   ```
5. Move `index.html` to project root (Vite requires it there)
6. Update environment variables from `REACT_APP_` to `VITE_`
7. Update ESLint configuration
