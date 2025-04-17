<h1 align="center">Director</h1>
<p align="center">Local first MCP proxy / gateway</p>

<p align="center"><code>npm i -g @working.dev/director</code></p>

---




## Why Director?

Director is a Model Context Protocol (MCP) proxy server that simplifies the management of multiple MCP connections. Instead of manually configuring each client to connect to individual MCP servers, Director acts as a central hub that:

- 🔌 **Unified Connection Management**  
  Single endpoint for all clients with multiple backend MCP servers (`proxy:ls` to view) 

- 🚀 **Client Integration**  
  One-command installation to Claude/Cursor (`install <proxyId> -c [claude|cursor]`) 

- 🔍 **Registry Discovery**  
  Browse and install MCP servers from GitHub (`registry:ls` to discover, `registry:get` to inspect)

- 📋 **Protocol Compliance**  
  Full MCP spec implementation with SSE and stdio transport support 

- 🛡️ **Proxy Isolation** 
  Independent contexts prevent cross-contamination between proxies 

- ⚡ **Simplified Setup**  
  One-command proxy creation and configuration (`proxy:create <name>`) 

- 📊 **Audit Trails**  
  Configurable logging with request tracking and error handling 

- 🔒 **Security**  
  Secure transports, error isolation, and configurable security settings 

## Quickstart

*Note: Director is new project under active development and is not yet stable. See CONTRIBUTING.md.*

```shell
# install director
$ npm install -g @working.dev/director

# start the server (-d deamonizes)
$ director start -d

# create a new proxy server
$ director create <PROXY_NAME>

# list available servers
$ director registry:ls

# add a target from the registry 
$ director target:add <PROXY_ID> <TARGET_NAME>

# install the proxy server
$ director install <PROXY_ID> claude
$ director install <PROXY_ID> cursor

```

---

## CLI Reference

```
Usage: director [options] [command]

Director CLI

Options:
  -V, --version                 output the version number
  -h, --help                    display help for command

Commands:
  ls                            List all proxies
  get <proxyId>                 Show proxy details
  create <name>                 Create a new proxy
  rm <proxyId>                  Delete a proxy
  sse2stdio <sse_url>           Proxy a SSE connection to a stdio stream
  install <proxyId> <client>    Install a proxy on a client app
  uninstall <proxyId> <client>  Uninstall an proxy from a client app
  registry:ls                   List all available servers in the registry
  registry:get <entryId>        get detailed information about a repository item
  start                         Start the director service
  config                        Print configuration variables
  debug:seed                    Seed the database with test data, for development
  debug:restart <client>        Restart client
  help [command]                display help for command
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
PORT=4052
```
