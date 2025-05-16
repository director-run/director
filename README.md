<h1 align="center">Director</h1>
<p align="center">Local first MCP proxy / gateway</p>

<p align="center"><code>npm i -g @working.dev/director</code></p>

---

[![license](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/theworkingcompany/director/blob/main/LICENSE)
[![ci](https://github.com/theworkingcompany/director/workflows/CI/badge.svg)](https://github.com/theworkingcompany/director/actions/workflows/ci.yml)
[![Release](https://github.com/theworkingcompany/director/workflows/Release/badge.svg)](https://github.com/theworkingcompany/director/actions/workflows/release.yml)
[![npm](https://img.shields.io/npm/v/@director.run/cli.svg)](https://www.npmjs.com/package/@director.run/cli)

Director is a Model Context Protocol (MCP) proxy server that simplifies the management of multiple MCP connections. Instead of manually configuring each client to connect to individual MCP servers, Director acts as a central hub that:

- 🔌 **Unified Connection Management**  
  Single endpoint for all clients with multiple backend MCP servers (`proxy:ls` to view) 

- 🚀 **Client Integration**  
  One-command installation to Claude/Cursor (`install <proxyId> -c [claude|cursor]`) 

- 🔍 **Registry Discovery**  
  Browse and install MCP servers from GitHub (`registry:ls` to discover, `registry:get` to inspect)

- 🛡️ **Proxy Isolation** 
  Independent contexts prevent cross-contamination between proxies 

- 📊 **Audit Trails**  
  Configurable logging with request tracking and error handling 

- 🔒 **Security**  
  Secure transports, error isolation, and configurable security settings 

## Quickstart

*Note: Director is new project under active development and is not yet stable. See CONTRIBUTING.md.*

```bash
# install director
$ npm install -g @working.dev/director

# start the service
$ director service start

# create a new proxy server
$ director create <proxyName>

# list available servers
$ director registry ls

# add a target from the registry 
$ director registry install <proxyId> <entryId>

# install the proxy server
$ director claude install <proxyId> 
$ director cursor install <proxyId> 

```

---

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

EXAMPLES
  $ director create my-proxy
  $ director registry install my-proxy iterm
  $ director claude install my-proxy

```

---

## Configuration

Director looks for config files in **`~/.director/`**. If you edit the files manually, you will need to restart director.

```yaml
# ~/.director/db.json
{
  proxies: [{
    ...
  }]
}
```

You can also set environment variables:

```yaml
# ~/.director/config.env
GATEWAY_PORT=3673,
GATEWAY_URL=http://localhost:3673,
REGISTRY_URL=http://localhost:3080,
DB_FILE_PATH=~/.director/db.json
```
