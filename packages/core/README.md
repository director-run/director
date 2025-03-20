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
