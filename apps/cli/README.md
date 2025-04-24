# Director CLI

Director is a Model Context Protocol (MCP) proxy server that simplifies the management of multiple MCP connections. Instead of manually configuring each client to connect to individual MCP servers, Director acts as a central hub that:

## CLI Reference

```
Usage: director [options] [command]

Director CLI

Options:
  -V, --version                         output the version number
  -h, --help                            display help for command

Commands:
  ls                                    List all proxies
  get <proxyId>                         Show proxy details
  create <name>                         Create a new proxy
  rm <proxyId>                          Delete a proxy
  server:add <proxyId> <entryId>        Add a server from the registry to a proxy.
  server:remove <proxyId> <serverName>  Remove a server from a proxy
  sse2stdio <sse_url>                   Proxy a SSE connection to a stdio stream
  install <proxyId> <client>            Install a proxy on a client app
  uninstall <proxyId> <client>          Uninstall an proxy from a client app
  registry:ls                           List all available servers in the registry
  registry:get <entryId>                get detailed information about a repository item
  start                                 Start the director service
  config                                Print configuration variables
  debug:seed                            Seed the database with test data, for
                                        development
  debug:restart <client>                Restart client
  help [command]                        display help for command


Examples:
  $ director create my-proxy
  $ director server:add my-proxy fetch
  $ director install my-proxy claude
```