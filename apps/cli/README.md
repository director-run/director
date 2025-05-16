# Director CLI

Director is a Model Context Protocol (MCP) proxy server that simplifies the management of multiple MCP connections. Instead of manually configuring each client to connect to individual MCP servers, Director acts as a central hub that:

## CLI Reference

```bash
Manage MCP servers seamlessly from the command line.

USAGE
  director <command> [subcommand] [flags]

CORE COMMANDS
  ls                                           List all proxies
  get <proxyId>                                Show proxy details
  create <name>                                Create a new proxy
  rm <proxyId>                                 Delete a proxy
  sse2stdio <sse_url>                          Proxy a SSE connection to a stdio stream
  config                                       Print configuration variables

CLAUDE
  claude ls                                    List claude MCP servers
  claude install <proxyId>                     Install a proxy on a client app
  claude uninstall <proxyId>                   Uninstall an proxy from a client app
  claude restart                               Restart the claude MCP server
  claude purge                                 Purge all claude MCP servers

CURSOR
  cursor ls                                    List cursor MCP servers
  cursor install <proxyId>                     Install a proxy to cursor
  cursor uninstall <proxyId>                   Uninstall a proxy from cursor
  cursor purge                                 Purge all cursor MCP servers

REGISTRY
  registry ls                                  List all available servers in the registry
  registry get <entryName>                     get detailed information about a repository item
  registry install <proxyId> <entryName>       Add a server from the registry to a proxy.
  registry uninstall <proxyId> <serverName>    Remove a server from a proxy

SERVICE
  service start                                Start the director service

DEBUG
  debug seed                                   Seed the database with test data, for development

FLAGS
  --help      Show help for command
  --version   Show director version
```