# MCP Core

Core gateway logic

## Configuration

Configuration is stored in `~/.mcp-cli/config.json`. On first run, a default configuration is created with example servers.

Example configuration:
```json
{
  "ssePort": 3006,
  "proxies": [
    {
      "name": "my-first-proxy",
      "servers": [
        {
          "name": "Hackernews",
          "transport": {
            "command": "uvx",
            "args": ["mcp-hn"]
          }
        },
        {
          "name": "Fetch",
          "transport": {
            "command": "uvx",
            "args": ["mcp-server-fetch"]
          }
        }
      ]
    }
  ]
}
```

## Development

```bash
# Run tests
bun test

# Run the MCP inspector (visualize the MCP server)
bun inspector

# Check code quality
bun lint

# Format code
bun format
```

## Prisma

```bash
bun run prisma migrate dev --name init
bun run prisma generate
bun run prisma db push
```


# MCP CLI

A powerful command-line tool for managing Model Context Protocol (MCP) servers. Seamlessly connect AI applications with specialized context providers.

## Requirements

- macOS (tested on latest versions)
- [Bun](https://bun.sh/) runtime installed globally (for STDIO Claude integration)

## Quick Start

```bash
# Install dependencies
bun install

# List configured proxies
bun cli list

# Start a proxy server (if you want to use SSE to connect to Cursor for example)
bun cli start my-first-proxy

# Install a proxy to Claude directly
bun cli install my-first-proxy -c claude
```

## Development

```bash
# Run tests
bun test

# Run the MCP inspector (visualize the MCP server)
bun inspector

# Check code quality
bun lint

# Format code
bun format
```


