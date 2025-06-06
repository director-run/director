# Director Studio

A modern web interface for managing Model Context Protocol (MCP) servers through the Director proxy system.

## Overview

Director Studio is the web-based management interface for [Director](../../README.md) - a local-first MCP proxy/gateway. The studio provides an intuitive interface for:

- 🔧 **Proxy Management** - Create and configure MCP proxy servers
- 📦 **Server Discovery** - Browse and install MCP servers from the registry  
- 🔌 **Client Integration** - Easy setup for Claude, Cursor, and other MCP clients
- 🛠️ **Tool Inspection** - View and test available tools from connected MCP servers
- ⚡ **Real-time Monitoring** - Live connection status and health checks

## Getting Started

### Prerequisites

- [Director CLI](../../README.md) installed and running
- Node.js 18+ and Bun (recommended) or npm

### Development

1. **Start Director Service**
   ```bash
   # Make sure Director is running
   director serve
   ```

2. **Install Dependencies**
   ```bash
   bun install
   ```

3. **Start Development Server**
   ```bash
   bun dev
   ```

4. **Open in Browser**
   
   Navigate to [http://localhost:3001](http://localhost:3001) to access the Studio interface.

### Production

```bash
# Build the application
bun run build

# Start the production server
bun start
```

## Features

### 🚀 Get Started Wizard
- Step-by-step proxy creation
- MCP server installation from registry
- Client connection setup

### 📚 MCP Registry Browser
- Discover available MCP servers
- View server details and documentation
- One-click installation to proxies

### 🔧 Proxy Management
- Create and configure proxy servers
- View connected MCP servers
- Monitor server status and health

### 🛠️ Tool Explorer
- Browse available tools from MCP servers
- View tool schemas and documentation
- Test tool functionality

### ⚙️ Client Integration
- Generate connection endpoints (HTTP, SSE, STDIO)
- Copy-to-clipboard for easy setup
- Support for Claude, Cursor, and manual configurations

## Architecture

Built with modern web technologies:

- **Framework**: Next.js 15 with App Router
- **Styling**: TailwindCSS with custom design system
- **Components**: Radix UI primitives with shadcn/ui
- **Data Fetching**: tRPC with TanStack Query
- **Forms**: React Hook Form with Zod validation

## API Integration

Studio communicates with Director through:

- **Gateway API** (`@director.run/gateway`) - Proxy and server management
- **Registry API** (`@director.run/registry`) - MCP server discovery
- **Real-time Updates** - WebSocket connections for live status

## Development Scripts

```bash
# Development
bun dev                    # Start dev server with Turbopack
bun typecheck             # Type checking
bun lint                  # Code linting with Biome
bun format                # Code formatting

# Production
bun build                 # Build for production
bun start                 # Start production server

# Utilities
bun clean                 # Clean build artifacts
bun tools:shadcn          # Add shadcn/ui components
```

## Environment Configuration

The studio connects to Director services running on default ports:

- **Director Gateway**: `http://localhost:3673`
- **Studio Dev Server**: `http://localhost:3001`

These can be configured through environment variables or Director's configuration system.

## Contributing

This is part of the larger Director project. See the main [CONTRIBUTING.md](../../CONTRIBUTING.md) for development guidelines.

## Learn More

- [Director Documentation](https://docs.director.run)
- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io)
- [Next.js Documentation](https://nextjs.org/docs)
