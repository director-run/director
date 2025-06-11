<h1 align="center">Director</h1>
<p align="center">The easiest way to manage and deploy MCP servers, locally or in the cloud</p>

<p align="center"><code>npx @director.run/cli quickstart</code></p>

---

<div align="center">

[![license](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/theworkingcompany/director/blob/main/LICENSE)
[![ci](https://github.com/theworkingcompany/director/workflows/CI/badge.svg)](https://github.com/theworkingcompany/director/actions/workflows/ci.yml)
[![Release](https://github.com/theworkingcompany/director/workflows/Release/badge.svg)](https://github.com/theworkingcompany/director/actions/workflows/release.yml)
[![npm](https://img.shields.io/npm/v/@director.run/cli.svg)](https://www.npmjs.com/package/@director.run/cli)

</div>

[Director](https://director.run) is a fully open-source MCP middleware that simplifies MCP server integration and deployment. It connects MCP clients and servers by implementing a proxy pattern to aggregate all MCP servers behind a single MCP transport (Streamable, SSE, or Stdio).

> **Note:** This project is under active development and is not yet stable.

## Quickstart

Get started with Director immediately using the command below. For more detailed information, please [read the docs](https://docs.director.run).

```bash
npx @director.run/cli quickstart
```

---

## Project Structure

### External Apps

- [`apps/cli`](./apps/cli/README.md) - The Director command-line interface, the primary way to interact with Director. Distributed through [npm](https://www.npmjs.com/package/@director.run/cli).
- [`apps/docs`](./apps/docs/README.md) - Project documentation hosted at [https://docs.director.run](https://docs.director.run)
- [`apps/registry`](./apps/registry/README.md) - Backend for the Director registry hosted at [https://registry.director.run](https://registry.director.run)
- [`apps/sandbox`](./apps/sandbox/README.md) - A tool for running Director (and all MCP servers) securely inside a VM. Apple Silicon only.
- [`apps/website`](./apps/website/README.md) - Marketing website hosted at [https://director.run](https://director.run)

### Internal Packages

- [`packages/client-configurator`](./packages/client-configurator/README.md) - Library for managing MCP client configuration files
- [`packages/gateway`](./packages/gateway/README.md) - Core gateway and proxy logic
- [`packages/mcp`](./packages/mcp/README.md) - Extensions to MCP SDK that add middleware functionality
- [`packages/utilities`](./packages/utilities/README.md) - Shared utilities used across all packages and apps

*This is a monorepo managed by [Turborepo](https://turbo.build/).*