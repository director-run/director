<h1 align="center">Director</h1>
<p align="center">Local first MCP proxy / gateway</p>

<p align="center"><code>npm i -g @working.dev/director</code>


</p>

---
[![CI](https://github.com/theworkingcompany/director/actions/workflows/ci.yml/badge.svg)](https://github.com/theworkingcompany/director/actions/workflows/ci.yml)
[![Release](https://github.com/theworkingcompany/director/actions/workflows/release.yml/badge.svg)](https://github.com/theworkingcompany/director/actions/workflows/release.yml)

## Why Director?

Director is a MCP Proxy. Instead of connecting your clients manually to many MCP servers (by edinting the config), you can use the director CLI to connect a single server and then add a bunch of proxies to it. In addition, it provies the following benefits:

- Discovery
- Environment
- Audits
- Security
- Config & Secret management


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
