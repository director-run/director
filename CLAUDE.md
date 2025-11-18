# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quality Standards and Workflow

**CRITICAL: All changes must meet these standards before being marked as complete.**

### Engineering Excellence

Every code change must demonstrate:

- **Simplicity**: Prefer straightforward solutions over clever ones. Avoid premature optimization.
- **Elegance**: Write clean, readable code that follows existing patterns and conventions.
- **Product Engineering**: Think holistically about user experience, maintainability, and system design.
- **Type Safety**: Leverage TypeScript's type system fully. No `any` types (enforced by Biome).
- **Error Handling**: Use structured error handling via `@director.run/utilities/error`.
- **Consistency**: Match the existing codebase style and architectural patterns.

### Definition of Done

**MANDATORY**: Before marking any task or change as complete, you MUST:

1. Run the full quality assurance suite:
   ```bash
   bun run lint && bun run typecheck && bun run test && bun run build
   ```

2. Verify that ALL checks pass:
   - **Lint**: No Biome violations (formatting, imports, code quality)
   - **Typecheck**: No TypeScript errors across all packages
   - **Test**: All Vitest tests pass
   - **Build**: All packages and apps build successfully

3. If ANY check fails:
   - DO NOT mark the task as complete
   - Fix the issues immediately
   - Re-run the full suite
   - Only proceed when everything passes

**Everything needs to work. No exceptions.**

### Code Change Guidelines

When implementing changes:

- **Read Before Writing**: Always read existing code to understand patterns before making changes
- **Small Commits**: Make focused, atomic changes that are easy to review
- **No Default Exports**: Enforced by Biome (except in config files, stories, and .d.ts files)
- **Import Organization**: Imports are auto-organized by Biome
- **Line Length**: Maximum 80 characters (enforced by Biome formatter)
- **Quote Style**: Use double quotes for JavaScript/TypeScript
- **Error Messages**: Provide clear, actionable error messages with context
- **Logging**: Use structured logging via `@director.run/utilities/logger`

### Testing Requirements

- Write tests for new functionality
- Update tests when modifying existing code
- Tests must be deterministic and fast
- Use descriptive test names that explain the behavior being tested
- Remember: tests run with `--fileParallelism=false` due to shared resources

### Common Pitfalls to Avoid

- ❌ Using `any` type (Biome will error)
- ❌ Default exports (Biome will error, except in allowed files)
- ❌ Non-null assertions `!` (Biome will error)
- ❌ Unused imports or variables (Biome will error)
- ❌ Missing await on async functions (Biome will error)
- ❌ Skipping the verification suite before marking tasks complete
- ❌ Breaking existing functionality without updating tests
- ❌ Ignoring TypeScript errors or using `@ts-ignore`

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

### Release Management
- `bun run changeset` - Create a new changeset to declare package changes
- `bun run version-packages` - Version packages and update changelogs based on changesets
- `bun run release-packages` - Build and publish packages to registries

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

### Release Process

Director uses [Changesets](https://github.com/changesets/changesets) for automated release management with the following workflow:

#### Creating Releases

1. **Add Changeset**: Run `bun run changeset` to declare package changes and version bumps
2. **Version Packages**: Changesets automatically creates versioning PRs when changes are merged to main
3. **Automated Publishing**: 
   - **npm**: `@director.run/cli` and `@director.run/sdk` are published to npm with public access
   - **Docker**: `@director.run/docker` is published to Docker Hub as `barnaby/director`

#### GitHub Configuration Required

The following secrets must be configured in GitHub repository settings:

- `NPM_TOKEN`: npm authentication token with publish access to `@director.run` org
- `DOCKER_USERNAME`: Docker Hub username (`barnaby`)
- `DOCKER_PASSWORD`: Docker Hub access token or password

#### Package Release Targets

- `@director.run/cli`: Published to npm as public package
- `@director.run/sdk`: Published to npm as public package (bundles gateway and registry internally)
- `@director.run/docker`: Published to Docker Hub as `barnaby/director` with version tags
- Private packages (`@director.run/gateway`, `@director.run/registry`): Versioned but not published (bundled into SDK)
- Ignored packages (`@director.run/studio`, `@director.run/sandbox`): Not versioned or published

#### Changelog Format

A single changelog is generated at the root of the repository using:
- GitHub integration for PR and user attribution links
- Commit hash references
- Consolidated release notes for all packages in each version
- Fixed versioning ensures all public packages are released together

### Key Patterns

- No default exports (enforced by Biome)
- Consistent error handling via `@director.run/utilities/error`
- Structured logging via `@director.run/utilities/logger`
- TRPC for type-safe APIs
- Proxy pattern for MCP server aggregation