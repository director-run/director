<h1 align="center">Director</h1>
<p align="center">Provide context to your agents through MCP</p>

<p align="center"><code>curl -LsSf https://director.run/install.sh | sh</code></p>

---

<div align="center">

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![ci](https://github.com/director-run/director/workflows/CI/badge.svg)](https://github.com/director-run/director/actions/workflows/ci.yml)
[![Release](https://github.com/director-run/director/workflows/Release/badge.svg)](https://github.com/director-run/director/actions/workflows/release.yml)
[![npm](https://img.shields.io/npm/v/@director.run/cli.svg)](https://www.npmjs.com/package/@director.run/cli)

</div>

# Overview

Director is local-first MCP middleware that packages prompts, tools, and their configuration into reusable playbooks - accessible through a single endpoint.

Configure it your way: CLI, YAML, UI, or SDK. Share playbooks across agents and teams. Switch contexts for different tasks or environments. Audit every tool call. Sandbox untrusted servers. All running on your machine, not ours.

<img src="https://github.com/director-run/director/blob/main/apps/docs/images/demo.gif" width="100%" alt="animated hello">

# Benefits

- 📚 **Playbooks**: Package prompts, tools & configuration together into re-usable playbooks that you can execute from any MCP client.
- 🚀 **Portability**: Share MCP config across agents and between team members through a single YAML file.
- 🎯 **Tool Filtering**: Increase accuracy by only adding relevant tools to your context.
- 🔐 **Security**: Easily run untrusted MCP servers in an isolated Docker container or VM.
- 📊 **Observability**: Comprehensive JSON logging for all MCP method calls that you can drain to your existing logging infrastructure.
- 🔧 **Flexibility**: Layered architecture allows you to configure director via declarative config, Typescript SDK, API, CLI or UI. 
- 🏠 **Local-First**: Privacy focused design that doesn't require API keys, accounts or signups.
- 🔌 **MCP Native**: Compatible with all MCP clients and servers. We support all MCP transports as well as oAuth.

# Installation

The easiest way to install Director is using the quickstart commad. However you can learn about alternative installation methods (including running it in Docker) by reading [our documentation](https://docs.director.run).

```bash
$ curl -LsSf https://director.run/install.sh | sh
$ director quickstart
```

# Project Structure

### External Apps

- [`apps/cli`](./apps/cli/README.md) - The command-line interface, the primary way to interact with Director. Available on [npm](https://www.npmjs.com/package/@director.run/cli).
- [`apps/sdk`](./apps/sdk/README.md) - The Typescript SDK, available on [npm](https://www.npmjs.com/package/@director.run/sdk).
- [`apps/docker`](./apps/docker/README.md) - The Director docker image, which allows you to run Director (and all MCP servers) securly inside a container. Available on [Docker Hub](https://hub.docker.com/r/barnaby/director).
- [`apps/docs`](./apps/docs/README.md) - Project documentation hosted at [https://docs.director.run](https://docs.director.run)
- [`apps/registry`](./apps/registry/README.md) - Backend for the registry hosted at [https://registry.director.run](https://registry.director.run)
- [`apps/sandbox`](./apps/sandbox/README.md) - A tool for running Director (and all MCP servers) securely inside a VM. Apple Silicon only.

### Internal Packages

- [`packages/client-configurator`](./packages/client-configurator/README.md) - Library for managing MCP client configuration files
- [`packages/gateway`](./packages/gateway/README.md) - Core gateway and proxy logic
- [`packages/mcp`](./packages/mcp/README.md) - Extensions to MCP SDK that add middleware functionality
- [`packages/utilities`](./packages/utilities/README.md) - Shared utilities used across all packages and apps
- [`packages/design`](./packages/design/README.md) - Design system: reusable UI components, hooks, and styles for all Director apps
- [`packages/typescript-config`](./packages/typescript-config/README.md) - Shared TypeScript configuration for all packages and apps

*This is a monorepo managed by [Turborepo](https://turbo.build/).*

# Community
If you're using director, have any ideas, or just want to chat about MCP, we'd love to chat:
- Join our [Discord](https://discord.gg/kWZGvWks)
- Send us an [Email](mailto:hello@director.run)
