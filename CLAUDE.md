# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Nx monorepo** using **Module Federation** to create a micro-frontend architecture with React 19 and Rspack. The workspace contains two federated React applications:
- **myhost** (port 4200): The host application that consumes remote modules
- **mymemory** (port 4201): A remote application that exposes modules to the host

## Architecture

### Module Federation Setup

The project uses Webpack Module Federation (via @nx/module-federation and @module-federation/enhanced) to enable runtime code sharing between applications:

- **Host Application (myhost)**:
  - Configured in `apps/myhost/module-federation.config.ts`
  - Consumes the `mymemory` remote
  - Lazy loads remote modules using `React.lazy(() => import('mymemory/Module'))`
  - Uses React Router for navigation between local and remote routes

- **Remote Application (mymemory)**:
  - Configured in `apps/mymemory/module-federation.config.ts`
  - Exposes `./Module` pointing to `./src/remote-entry.ts`
  - The remote-entry exports the default App component
  - Must be running for the host to load its modules

### Build System

- **Bundler**: Rspack (Webpack-compatible Rust-based bundler)
- **Plugin System**: Nx plugins infer build targets from configuration files
- **TypeScript**: Strict mode enabled with composite project references
- **Styling**: Tailwind CSS with PostCSS

### Entry Point Pattern

The host application uses a bootstrap pattern for Module Federation:
1. `main.ts` → dynamically imports `bootstrap.tsx`
2. `bootstrap.tsx` → renders the React app
3. This async boundary allows Module Federation to initialize before the app loads

## Common Commands

### Development

```bash
# Start the host application (automatically starts mymemory as well due to dependsOn)
npx nx serve myhost

# Start individual apps
npx nx serve myhost
npx nx serve mymemory

# Run in dev mode with specific remotes
NX_MF_DEV_REMOTES=mymemory npx nx serve myhost
```

### Building

```bash
# Build all apps
npx nx build myhost
npx nx build mymemory

# Build with dependencies
npx nx build myhost --with-deps
```

### Testing

```bash
# Run unit tests
npx nx test myhost
npx nx test mymemory

# Run e2e tests
npx nx e2e myhost-e2e
npx nx e2e mymemory-e2e
```

### Linting & Type Checking

```bash
# Lint
npx nx lint myhost
npx nx lint mymemory

# Type check (runs automatically before build/serve)
npx nx typecheck myhost
npx nx typecheck mymemory
```

### Workspace Operations

```bash
# Visualize project graph (useful for understanding module federation dependencies)
npx nx graph

# Sync TypeScript project references (run if dependencies change)
npx nx sync

# Check if project references are synced (useful in CI)
npx nx sync:check
```

## Key Configuration Files

- `nx.json`: Workspace-level Nx configuration with plugins and target defaults
- `tsconfig.base.json`: TypeScript path mappings for module federation (e.g., `mymemory/Module`)
- `apps/*/module-federation.config.ts`: Module Federation configuration for each app
- `apps/*/rspack.config.ts`: Rspack bundler configuration
- `apps/*/project.json`: Project-specific build targets and dependencies

## Important Development Notes

### Module Federation Development

1. **Remote must be running**: When developing the host, ensure remote apps are running or built. The host's `serve` target has `dependsOn: ["myhost:serve"]` configured.

2. **TypeScript paths**: Remote modules are typed via path mappings in `tsconfig.base.json`. When adding new exposed modules, update this file.

3. **Port conflicts**: Host runs on 4200, remote on 4201. These are configured in each app's `project.json`.

4. **Build dependencies**: Both apps specify `dependsOn: ["^build", "typecheck"]` to ensure type safety and proper build order.

### Nx Task Dependencies

- The `test` target depends on `^build` (building dependencies first)
- The `serve` target for mymemory depends on `myhost:serve` (host must be available)
- Both `build` and `serve` depend on `typecheck` (type safety enforced)

### Adding New Remote Applications

1. Generate a new React app with the Rspack bundler
2. Configure module federation in its `module-federation.config.ts`
3. Add it to the host's `remotes` array in `apps/myhost/module-federation.config.ts`
4. Add TypeScript path mapping in `tsconfig.base.json`
5. Update host's `project.json` if serve dependencies are needed

### Monorepo Structure

- `apps/`: Applications (host, remotes, and their e2e test projects)
- `packages/`: Shared libraries (currently empty but available for shared code)
- Workspaces are defined in root `package.json` as `apps/*` and `packages/*`
