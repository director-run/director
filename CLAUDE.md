# CLAUDE.md

## Product overview and Development Workflow

Director is an MCP gateway. It allows users to create and manage multiple playbooks. Each playbook aggregates MCP servers and prompts.

We've just migrated director from a single tenant, local first architecture to a multi tenant architecture.

We have a login system, powered by better-auth. In development, we have two components: apps/studio which is the frontend. And apps/gateway that's the backend.

You can start the frontend by running `bun run studio` from the root of the repo and you can start the backend by running `bun run serve` from the root of the repo. There’s a command called `bun run db:seed` that will seed the development database. It’ll make a test user with the email: [`user@director.run`](mailto:user@director.run) and the password `password`. These credentials are pre-filled on the app login screen.

When developing for the frontend, you should use the playwright MCP to interact with the frontend: in development, it’ll run on `http://localhost:3000`

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

### Library Documentation Lookup

**MANDATORY**: Before making changes that involve external libraries, you MUST:

1. Use the **Context7 MCP** to look up the current documentation for any libraries being used
2. Use `mcp__context7__resolve-library-id` to find the library ID, then `mcp__context7__get-library-docs` to fetch relevant documentation
3. This ensures you're using up-to-date APIs and best practices

**If Context7 MCP is not available**: STOP and ask the user if they want to proceed without documentation lookup. Do not assume or guess library APIs.

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

### Full-Stack Awareness

**IMPORTANT**: Always consider the full stack when making changes:

- **Gateway** (`apps/gateway/`) is the backend - API changes here affect all clients
- **Studio** (`apps/studio/`) is the web UI client
- **CLI** (`apps/cli/`) is the command-line client

When making changes:

1. **Backend changes**: Always check if Studio and/or CLI need updates to reflect the change
2. **API modifications**: Update all consuming clients (Studio, CLI) accordingly
3. **New backend features**: Consider whether they should be exposed in Studio, CLI, or both
4. **Data model changes**: Propagate through the entire stack (Gateway → Studio/CLI)

Do not leave clients out of sync with the backend.

### Frontend Component Architecture

When building frontend components (Studio, design system):

1. **Separate Business Logic from Presentation**:
   - Create "dumb" (presentational) components that only handle rendering
   - Dumb components receive all data via props and emit events for actions
   - Keep business logic, data fetching, and state management in container/page components
   - Dumb components should be reusable and testable in isolation

2. **Storybook Requirement**:
   - When creating a new dumb/presentational component, you MUST also create a Storybook story
   - Stories go in `packages/design/src/components/` alongside the component
   - Stories should demonstrate all component variants and states
   - Use the `*.stories.tsx` naming convention

3. **Component Location**:
   - Reusable presentational components: `packages/design/src/components/`
   - App-specific containers/pages: `apps/studio/src/pages/` or `apps/studio/src/components/`

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

### Core Components

**Gateway** (`apps/gateway/`)
- Implements proxy pattern aggregating MCP servers
- Serves unified interface to clients via standard MCP transports (HTTP Streamable, Stdio, SSE)
- Manages `ProxyServer` instances through `ProxyServerStore`
- Exposes HTTP API via TRPC for dynamic management

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

### Development Standards

- **Package Manager**: Bun (version ~1.2.5)
- **Node Version**: ~23.10.0
- **Monorepo**: Turborepo with workspaces
- **Linting**: Biome with strict rules (no default exports, no explicit any)
- **Testing**: Vitest with file parallelism disabled
- **TypeScript**: Strict configuration across all packages
