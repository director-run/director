<h1 align="center">Director</h1>
<p align="center">The simplest way to use MCP</p>

<p align="center"><code>curl -LsSf https://director.run/install.sh | sh</code></p>

---

<div align="center">

[![license](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/director-run/director/blob/main/LICENSE)
[![ci](https://github.com/director-run/director/workflows/CI/badge.svg)](https://github.com/director-run/director/actions/workflows/ci.yml)
[![Release](https://github.com/director-run/director/workflows/Release/badge.svg)](https://github.com/director-run/director/actions/workflows/release.yml)
[![npm](https://img.shields.io/npm/v/@director.run/cli.svg)](https://www.npmjs.com/package/@director.run/cli)

</div>

<img src="https://github.com/director-run/director/blob/main/apps/docs/images/demo.gif" width="100%" alt="animated hello">

[Director](https://director.run) allows you to connect any MCP server to any LLM in seconds. It's local first, and 100% open source. 

More specifically, it's a gateway that proxies requests between MCP clients and servers. It supports all MCP transports natively and aggregates tools, prompts, and resources server-side while providing a unified client-side integration point. This abstraction eliminates MCP server management overhead, enabling you to focus on the work you want to do with your LLM rather than worrying about how MCP works or the best way to manage it.

> **Note:** This project is under active development and is not yet stable & may contain bugs. Please see our [contributing](https://docs.director.run/project/contributing) if you'd like to help.


# Installation

The easiest way to install Director is using the quickstart commad. However you can learn about alternative installation methods (including running it in Docker) by reading [our documentation](https://docs.director.run).

```bash
$ curl -LsSf https://director.run/install.sh | sh
$ director quickstart
```

# Getting in Touch
If you're using director, have any ideas, or just want to chat about MCP, we'd love to chat:
- Join our [Discord](https://discord.gg/kWZGvWks)
- Send us an [Email](mailto:hello@director.run)

# Project Structure

### External Apps

- [`apps/cli`](./apps/cli/README.md) - The Director command-line interface, the primary way to interact with Director. Distributed through [npm](https://www.npmjs.com/package/@director.run/cli).
- [`apps/docs`](./apps/docs/README.md) - Project documentation hosted at [https://docs.director.run](https://docs.director.run)
- [`apps/registry`](./apps/registry/README.md) - Backend for the Director registry hosted at [https://registry.director.run](https://registry.director.run)
- [`apps/sandbox`](./apps/sandbox/README.md) - A tool for running Director (and all MCP servers) securely inside a VM. Apple Silicon only.

### Internal Packages

- [`packages/client-configurator`](./packages/client-configurator/README.md) - Library for managing MCP client configuration files
- [`packages/gateway`](./packages/gateway/README.md) - Core gateway and proxy logic
- [`packages/mcp`](./packages/mcp/README.md) - Extensions to MCP SDK that add middleware functionality
- [`packages/utilities`](./packages/utilities/README.md) - Shared utilities used across all packages and apps
- [`packages/design`](./packages/design/README.md) - Design system: reusable UI components, hooks, and styles for all Director apps
- [`packages/typescript-config`](./packages/typescript-config/README.md) - Shared TypeScript configuration for all packages and apps

*This is a monorepo managed by [Turborepo](https://turbo.build/).*
