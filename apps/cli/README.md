<h1 align="center">Director</h1>
<p align="center">The easiest way to connect to any MCP server.</p>

<p align="center"><code>npx @director.run/cli@latest quickstart</code></p>

---

[Director](https://director.run) is open source MCP middleware that acts as a proxy between models/agents and MCP servers. Supporting all MCP transports natively, it aggregates tools, prompts, and resources server-side while providing a unified client-side integration point. This abstraction eliminates MCP server management overhead, enabling developers to focus on prompt engineering and domain logic rather than infrastructure complexity. If you'd like to learn more about director, please read the [documentation](https://docs.director.run)

> **Note:** This project is under active development and is not yet stable & may contain bugs. Please see our [contributing](https://docs.director.run/project/contributing) if you'd like to help.

## Prerequisites

- Tested on MacOS (Sequoia 15.5) and Ubuntu (24.04.2 LTS)
- [Node.js](https://nodejs.org/en/download) (tested on v23.7.0) 
- [UV](https://docs.astral.sh/uv/getting-started/installation/) for many Stdio servers
- [Claude](https://claude.ai/download), [Cursor](https://www.cursor.com/downloads) or [VSCode](https://code.visualstudio.com/download) installed. (if you'd like director to configure them automatically).


## Quickstart

The fastest way to try out director is by running the quickstart directly using npx. This will start the director gateway and open the UI.

```bash
npx @director.run/cli quickstart
```

#### Installing Locally

If you'd like to install director locally, you can do so via `npm`.

```bash
npm install -g @director.run/cli
director serve # start the gateway
director studio # open the studio in your browser
```

#### Docker (Experimental)

If you'd like to run director (and all the MCP servers) inside a docker container, you can use the following command. Please note that this functionality is experimental

```bash
# Start the gateway container, listening on port 8080
# Mount the data directory to persist the gateway's state (config files, etc)
docker run \
        -d -p 8080:8080 \
        -v ./data:/root/.director \
        --name director \
        barnaby/director:latest

# Tail the logs
docker logs -f director

# Interact with the gateway using the CLI, on the host machine
npm install -g @director.run/cli
GATEWAY_URL=http://localhost:8080 director create my-proxy
GATEWAY_URL=http://localhost:8080 director add my-proxy --entry fetch
```

## CLI Examples



## Start the gateway

```bash
$ director serve

         _ _               _
        | (_)             | |
      __| |_ _ __ ___  ___| |_ ___  _ __
     / _' | | '__/ _ \/ __| __/ _ \| '__|
    | (_| | | | |  __/ (__| || (_) | |
     \__,_|_|_|  \___|\___|\__\___/|_|


[18:16:21] INFO (Gateway): starting director gateway
[18:16:21] INFO (Gateway): director gateway running on port 3673
```

## Create a proxy
```bash
$ director create my-first-proxy 
proxy my-first-proxy created
```

## Add a server to the proxy
```bash
$ director add my-first-proxy --entry hackernews
adding hackernews to my-first-proxy
✔ Entry fetched.
✔ Registry entry hackernews added to my-first-proxy
```

## Connect the proxy to a client
```bash
# connect the proxy to Claude automatically
$ director connect my-first-proxy -t claude 
[18:19:06] INFO (client-configurator/claude): reading config from /Users/barnaby/Library/Application Support/Claude/claude_desktop_config.json
[18:19:06] INFO (client-configurator/claude): installing my-first-proxy
[18:19:06] INFO (client-configurator/claude): writing config to /Users/barnaby/Library/Application Support/Claude/claude_desktop_config.json
[18:19:06] INFO (client-configurator/claude): restarting claude
[18:19:06] INFO (restartApp): restarting Claude...
[18:19:08] INFO (restartApp): Claude has been restarted
undefined

# print the manual connection details
$ director connect my-first-proxy 

--------------------------------
Connection Details for 'my-first-proxy'
--------------------------------

Note: if you'd like to connect to a client automatically, run:
director connect my-first-proxy --target <target>

HTTP Streamable: http://localhost:3673/my-first-proxy/mcp
HTTP SSE: http://localhost:3673/my-first-proxy/sse
Stdio: {
  "command": "npx",
  "args": [
    "-y",
    "@director.run/cli",
    "http2stdio",
    "http://localhost:3673/my-first-proxy/mcp"
  ],
  "env": {
    "LOG_LEVEL": "silent"
  }
}
```

## Get the details of a proxy
```bash
# list all the proxies
$ director ls
┌────────────────┬────────────────┬──────────────────────────────────────────┐
│ id             │ name           │ path                                     │
│ my-first-proxy │ my-first-proxy │ http://localhost:3673/my-first-proxy/mcp │
└────────────────┴────────────────┴──────────────────────────────────────────┘

# get the details of a single proxy
$ director get my-first-proxy 
id=my-first-proxy
name=my-first-proxy
┌───────┬───────────┬──────────────────────┐
│ name  │ transport │ url/command          │
│ fetch │ stdio     │ uvx mcp-server-fetch │
└───────┴───────────┴──────────────────────┘
```