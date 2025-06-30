# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Setup and Installation
- `bun install` - Install dependencies for all packages
- `bun run setup-development.sh` - Setup development environment (located in scripts/)

### Build and Development
- `bun run dev` - Start development mode for all apps
- `bun run build` - Build all apps and packages
- `bun run start` - Start production mode for all apps
- `bun run dev:reset` - Clean and reinstall dependencies

### Quality Assurance
- `bun run lint` - Run linting across all packages
- `bun run format` - Format code using Biome
- `bun run format:fix-imports` - Fix import organization only
- `bun run typecheck` - Run TypeScript type checking
- `bun run test` - Run tests with Vitest (uses `--fileParallelism=false`)

### Local Development
- `bun run cli` - Run CLI in development mode
- `bun run cli:dev` - Run CLI with watch mode
- `bun run registry` - Run registry API in development mode  
- `bun run registry:dev` - Run registry API with watch mode

### Cleanup
- `bun run clean` - Clean build artifacts and node_modules

## Architecture Overview

Director is MCP (Model Context Protocol) middleware that acts as a proxy between AI models/agents and MCP servers. The architecture consists of:

### Core Components

**Gateway** (`packages/gateway/`)
- Implements proxy pattern aggregating MCP servers
- Serves unified interface to clients via standard MCP transports (HTTP Streamable, Stdio, SSE)
- Manages `ProxyServer` instances through `ProxyServerStore`
- Exposes HTTP API via TRPC for dynamic management

**MCP Extensions** (`packages/mcp/`)
- Extensions to the official TypeScript MCP SDK
- `ProxyServer` class extends MCP Server to aggregate multiple MCP servers
- Handles prompts, resources, and tools from multiple upstream servers
- `ProxyTarget` manages individual server connections

**Client Configurator** (`packages/client-configurator/`)
- Automates client connection setup (Claude, Cursor, VSCode)
- Manages MCP client configuration files without manual JSON editing

### Applications

**CLI** (`apps/cli/`)
- Primary interface for Director management
- Commands in `src/commands/core/`: add, connect, debug, env, quickstart, remove, serve, status, studio
- Distributed via npm as `@director.run/cli`

**Studio** (`apps/studio/`)
- Next.js web interface for visual Gateway management
- React components for proxy management in `src/components/proxies/`
- MCP server management in `src/components/mcp-servers/`

**Registry** (`apps/registry/`)
- Backend API for Director registry
- Database schema in `src/db/schema.ts`
- TRPC routers in `src/routers/trpc/`

**Sandbox** (`apps/sandbox/`)
- VM-based sandboxing for secure MCP server execution
- Ansible playbooks for provisioning in `ansible/`
- Apple Silicon only

### Development Standards

- **Package Manager**: Bun (version ~1.2.5)
- **Node Version**: ~23.10.0
- **Monorepo**: Turborepo with workspaces
- **Linting**: Biome with strict rules (no default exports, no explicit any)
- **Testing**: Vitest with file parallelism disabled
- **TypeScript**: Strict configuration across all packages

### Key Patterns

- No default exports (enforced by Biome)
- Consistent error handling via `@director.run/utilities/error`
- Structured logging via `@director.run/utilities/logger`
- TRPC for type-safe APIs
- Proxy pattern for MCP server aggregation