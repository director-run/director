<h1 align="center">Director</h1>
<p align="center">The easiest way to manage and deploy MCP servers, locally or in the cloud</p>

<p align="center"><code>npx @director.run/cli quickstart</code></p>

---

[![license](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/theworkingcompany/director/blob/main/LICENSE)
[![ci](https://github.com/theworkingcompany/director/workflows/CI/badge.svg)](https://github.com/theworkingcompany/director/actions/workflows/ci.yml)
[![Release](https://github.com/theworkingcompany/director/workflows/Release/badge.svg)](https://github.com/theworkingcompany/director/actions/workflows/release.yml)
[![npm](https://img.shields.io/npm/v/@director.run/cli.svg)](https://www.npmjs.com/package/@director.run/cli)

[Director](https://director.run) is a fully open source MCP middleware that simplifies MCP server integration and deployment. It connects MCP clients and servers by implementing a proxy pattern to aggragate all MCP servers behind a single MCP transport (Streamable, SSE or Stdio).

*Note: This is a new project under active development and is not yet stable.*

## Quickstart

You can use the command below to try out director immediately. If you'd learn more, please [read the docs](https://docs.director.run). 

```bash
$ npx @director.run/cli quickstart
```

---

## Project Structure

#### External Apps

- [`apps/cli`](./apps/cli/README.md) the director command line interface, which is the primary way to interact with director. It is distributed through [npm](https://www.npmjs.com/package/@director.run/cli).
- [`apps/docs`](./apps/docs/README.md) the project documentation that is hosted at [https://docs.director.run](https://docs.director.run)
- [`apps/registry`](./apps/registry/README.md) the backend to the director registry that is hosted at [https://registry.director.run](https://registry.director.run)
- [`apps/sandbox`](./apps/sandbox/README.md) a tool that makes it easy to run director (and all MCP servers) securly inside a VM. Apple Silicon only. 
- [`apps/website`](./apps/website/README.md) our marketing website that is hosted at [https://director.run](https://director.run).

#### Internal Packeges

- [`packages/client-configurator`](./packages/client-configurator/README.md) A library that helps manage MCP client configuration files.
- [`packages/gateway`](./packages/gateway/README.md) The core gateway and proxy logic.
- [`packages/mcp`](./packages/mcp/README.md) Extensions to MCP SDK  that add the functionality needed for the middleware.
- [`packages/utilities`](./packages/utilities/README.md) Shared helper library that is shared across all packages/apps. 

*Note: this is a monorepo managed by [turborepo](https://turbo.build/).*
