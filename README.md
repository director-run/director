<h1 align="center">Director</h1>
<p align="center">Local first MCP proxy / gateway</p>

<p align="center"><code>npm i -g @working.dev/director</code>


<p align="center">
  <a href="https://github.com/theworkingcompany/director/actions/workflows/ci.yml">
    <img src="https://github.com/theworkingcompany/director/actions/workflows/ci.yml/badge.svg" alt="CI">
  </a>
  <a href="https://github.com/theworkingcompany/director/actions/workflows/release.yml">
    <img src="https://github.com/theworkingcompany/director/actions/workflows/release.yml/badge.svg" alt="Release">
  </a>
</p>

---

</p>


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


## Why Mutton?

- 💰 **No expensive hardware needed**  
  Run the latest open-source models at full speed using cloud GPU instances.  

- 🚀 **Deploy in minutes**  
  Spend more time building and less time wrestling with DevOps.  

- 🛡️ **Total control**  
  Keep your data where you want it and decide who can access it.  

- 🏗️ **Flexible & portable**  
  Avoid vendor lock-in and switch cloud providers easily.  

- ⚙️ **Hassle-free management**  
  A simple CLI for deploying, starting, stopping, and tearing down models.  

- 🔧 **Terraform under the hood**  
  Reliable infrastructure-as-code with minimal setup.


## Quickstart

*Note: Director is new project under active development and is not yet stable. See CONTRIBUTING.md.*

```shell
# install director
$ npm install -g @openai/codex

# start the server (-d deamonizes)
$ director start -d

# create a new proxy server
$ director proxy:create <PROXY_NAME>

# list available servers
$ director registry:ls

# add a target from the registry 
$ director proxy:target:create <PROXY_ID> <TARGET_NAME>

# install the proxy server to claude
$ director claude:install <PROXY_ID>
```

---

## CLI Reference

```
Usage: director [options] [command]

Director CLI

Options:
  -V, --version                  output the version number
  -h, --help                     display help for command

Commands:
  proxy:ls                       List all configured MCP proxies
  proxy:get <proxyId>            Get the info for a proxy
  start                          Start the proxy server for all proxies
  debug
  seed
  sse2stdio <sse_url>            Proxy a SSE connection to a stdio stream
  install [options] <proxyId>    Install an mcp server to a client app
  uninstall [options] <proxyId>  Uninstall an mcp server from a client app
  claude:restart                 Restart Claude
  registry:ls                    List all available registry items
  registry:get <entryId>         get detailed information about a
                                 repository item
  help [command]                 display help for command
```

---

## Configuration

Director looks for config files in **`~/.director/`**.

```yaml
# ~/.codex/config.yaml
model: o4-mini # Default model
fullAutoErrorMode: ask-user # or ignore-and-continue
```

You can also define custom instructions:

```yaml
# ~/.codex/instructions.md
- Always respond with emojis
- Only use git commands if I explicitly mention you should
```


---

## License

This repository is licensed under the [MIT](LICENSE) licence.
