<h1 align="center">Director</h1>
<p align="center">The easiest way to use MCP</p>

<p align="center"><code>curl -fsSL https://director.run/install | bash</code></p>

---

<div align="center">

[![license](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/director-run/director/blob/main/LICENSE)
[![ci](https://github.com/director-run/director/workflows/CI/badge.svg)](https://github.com/director-run/director/actions/workflows/ci.yml)
[![Release](https://github.com/director-run/director/workflows/Release/badge.svg)](https://github.com/director-run/director/actions/workflows/release.yml)
[![npm](https://img.shields.io/npm/v/@director.run/cli.svg)](https://www.npmjs.com/package/@director.run/cli)

</div>

[Director](https://director.run) is open source MCP middleware that acts as a proxy between models/agents and MCP servers. Supporting all MCP transports natively, it aggregates tools, prompts, and resources server-side while providing a unified client-side integration point. This abstraction eliminates MCP server management overhead, enabling developers to focus on prompt engineering and domain logic rather than infrastructure complexity.

> **Note:** This project is under active development and is not yet stable & may contain bugs. Please see our [contributing](https://docs.director.run/project/contributing) if you'd like to help.

## Quickstart

Get started with Director immediately using the command below. For more detailed information, please [read the docs](https://docs.director.run).

```bash
curl -fsSL https://director.run/install | bash
director quickstart
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