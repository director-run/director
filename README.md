<h1 align="center">Director</h1>
<p align="center">MCP Playbooks for AI agents</p>

<p align="center"><code>curl -LsSf https://director.run/install.sh | sh</code></p>

---

<div align="center">

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![ci](https://github.com/director-run/director/workflows/CI/badge.svg)](https://github.com/director-run/director/actions/workflows/ci.yml)
[![Release](https://github.com/director-run/director/workflows/Release/badge.svg)](https://github.com/director-run/director/actions/workflows/release.yml)
[![npm](https://img.shields.io/npm/v/@director.run/cli.svg)](https://www.npmjs.com/package/@director.run/cli)

</div>

# Overview

Director allows you to provide <ins>**playbooks**</ins> to AI Agents. A playbook is a set of <ins>**MCP tools**</ins>, <ins>**prompts**</ins> and <ins>**configuration**</ins>, that give agents new <ins>**skills**</ins>. You can connect Claude, Cursor and VSCode in 1-click, or integrate manually through a single MCP endpoint.

Playbooks are portable, declarative YAML files that can easily be shared (or committed to version control). Director is local-first - installation and client integration takes 30 seconds. In addition, Director provides all of the MCP management functionality that you'd expect: tool filtering, logging, strong isolation, and unified OAuth.

<br />



https://github.com/user-attachments/assets/cafc0902-a854-4ee8-ac89-b7535f10c93d




## Key Features

- 📚 **Playbooks** - Maintain sets of tools, prompts and config for different tasks or environments.
- 🚀 **1-Click Integration** - Switch playbooks with a single click. Currently supports Claude Code, Claude Desktop, Cursor, VSCode
- 🔗 **Shareable** - Playbooks are flat files which can be shared or committed to version control easily.
- 🏠 **Local-First** - Director is local-first, designed to easily run on your own machine or infrastructure.
- 🔑 **Unified OAuth** - Connect to OAuth MCPs centrally, and use them across all of your agents.
- 🎯 **Tool Filtering** - Select only the MCP tools that are required for the specific task, preserving context.  
- 📋 **Declarative** - Like terraform for AI agents, Director will enforce playbook to client mapping on startup.
- 🔧 **Flexibility** - You can configure director through the UI, by editing the config file, through the CLI or even using the Typescript SDK.  
- 📊 **Observability** - Centralised JSON logging, that allows you to understand exactly what your agent is doing.
- 🔌 **MCP Compliant** - Just works with any MCP server or client. Up to date with the latest MCP spec.

# Quickstart

```bash
# Install Director
$ curl -LsSf https://director.run/install.sh | sh

# Start the onboarding flow
$ director quickstart
```

# Core Concepts

## Playbooks

A playbook is a set of tools, prompts and configuration, used to provide specific capabilities to your agent. Under the hood, playbooks are built on top of the MCP tools & prompts primitives. 

The easiest way to author a playbook is via the UI (`director studio`). But you can also use the CLI or write the config manually (see below). You can have many playbooks, typically one per task or per environment. Connecting them is one click in the UI (or one CLI command / config entry), connections are enforced on startup. 

```yaml
#
# Client <> Playbook mappings (enforced on startup)
#
clients:
  claude-code: [ production-support ]
  cursor: [ production-support ]

#
# Playbooks
#
playbooks:
  - id: production-support
    name: Production Support
    description: Investigate and resolve production issues
    #
    # MCP Servers / Tools
    #
    servers:
      # Get alerts
      - name: sentry
        type: http
        url: https://mcp.sentry.dev/mcp
      
      # Read the logs
      - name: cloudwatch
        type: stdio
        command: uvx
        args: ["awslabs.cloudwatch-mcp-server@latest"]
        env:
          AWS_PROFILE: "[The AWS Profile Name to use for AWS access]",
        include: [search_logs, get_metrics] # No write access

      # Write back to the repository
      - name: github
        type: http
        url: https://api.githubcopilot.com/mcp/
        tools:
          include: [ create_pr, search_code ] 
    #
    # Prompts
    # 
    prompts:
      - name: investigate
        content: |
          Check recent alerts, correlate with deployment times,
          search logs for errors, identify root cause
```

## Architechture

At a high level, Director is a service that sits between your agents and MCP servers. It's transparent to clients, requiring no additional tokens. It models playbooks, which can be thought of as standalone, portable skills that enhance your AI agent with new capabilities.

<img src="https://github.com/director-run/director/blob/main/apps/docs/images/director-highlevel-overview.webp" width="100%" alt="director demo">

# Usage

## Installation
```bash
# Install the director CLI + dependencies (node, npm & uvx) via the 1-liner:
$ curl -LsSf https://director.run/install.sh | sh

# Alternatively, install through npm:
$ npm install -g @director.run/cli

# Start director & open the UI
$ director quickstart
```

## The Studio (Web UI)

The simplest way to interact with director is via the admin interface:

```bash
# Open studio in your browser
$ director studio
```

## CLI Reference

```bash
Playbooks for your AI agent

USAGE
  director <command> [subcommand] [flags]

CORE COMMANDS
   quickstart                                    Start the gateway and open the studio in your browser
   serve                                         Start the web service
   studio                                        Open the UI in your browser
   ls                                            List playbooks
   get <playbookId> [serverName]                 Show playbook details
   auth <playbookId> <server>                    Authenticate a server
   create <name>                                 Create a new playbook
   destroy <playbookId>                          Delete a playbook
   connect <playbookId> [options]                Connect a playbook to a MCP client
   disconnect <playbookId> [options]             Disconnect a playbook from an MCP client
   add <playbookId> [options]                    Add a server to a playbook.
   remove <playbookId> <serverName>              Remove a server from a playbook
   update <playbookId> [serverName] [options]    Update playbook attributes
   http2stdio <url>                              Proxy an HTTP connection (sse or streamable) to a stdio stream
   env [options]                                 Print environment variables
   status                                        Get the status of the director

REGISTRY
   registry ls                                   List all available servers in the registry
   registry get <entryName>                      Get detailed information about a registry item
   registry readme <entryName>                   Print the readme for a registry item

MCP
   mcp list-tools <playbookId>                   List tools on a playbook
   mcp get-tool <playbookId> <toolName>          Get the details of a tool
   mcp call-tool <playbookId> <toolName> [options]  Call a tool on a playbook

PROMPTS
   prompts ls <playbookId>                       List all prompts for a playbook
   prompts add <playbookId>                      Add a new prompt to a playbook
   prompts edit <playbookId> <promptName>        Edit an existing prompt
   prompts remove <playbookId> <promptName>      Remove a prompt from a playbook
   prompts get <playbookId> <promptName>         Show the details of a specific prompt

FLAGS
   -V, --version                                 output the version number

EXAMPLES
  $ director create my-playbook # Create a new playbook
  $ director add my-playbook --entry fetch # Add a server to a playbook
  $ director connect my-playbook --target claude # Connect my-playbook to claude

```

## Configuration File Reference

```yaml
#
# Server config
#
server:
  port: 1234

#
# Client Connections
# 
clients:
  claude-code: [ code_review ] # connect claude code to the code_review playbook

#
# Playbooks
# 
playbooks:
  - name: code_review
    description: Automates code reviews
    servers:
      - name: filesystem
        type: stdio
        command: npx
        args: [ "@modelcontextprotocol/server-filesystem", "./src" ]
      
      - name: github
        type: http
        url: https://api.githubcopilot.com/mcp/
        tools:
          # include only these tools
          include: [ create_issue, search_code ] 

    # invoke with slash commands
    prompts:
      - name: code_review
        content: "Review this code for security vulnerabilities and performance issues"
      
      - name: write_tests
        content: "Write comprehensive unit tests including edge cases"
```

### TypeScript SDK

Programmatic control for advanced use cases:

```typescript
import { Director } from '@director.run/sdk';

const director = new Director();

// Create playbook programmatically
const playbook = await director.playbooks.create({
  name: 'ci-environment',
  servers: [{
    name: 'github',
    command: 'mcp-server-github',
    env: { GITHUB_TOKEN: process.env.GITHUB_TOKEN }
  }]
});

// Execute tools
const result = await playbook.callTool('github.create_issue', {
  title: 'Automated issue from CI',
  body: 'This issue was created by Director'
});
```

# Repository Structure

### External Apps

- [`apps/cli`](./apps/cli/README.md) - The command-line interface, the primary way to interact with Director. Available on [npm](https://www.npmjs.com/package/@director.run/cli).
- [`apps/sdk`](./apps/sdk/README.md) - The Typescript SDK, available on [npm](https://www.npmjs.com/package/@director.run/sdk).
- [`apps/docker`](./apps/docker/README.md) - The Director docker image, which allows you to run Director (and all MCP servers) securly inside a container. Available on [Docker Hub](https://hub.docker.com/r/barnaby/director).
- [`apps/docs`](./apps/docs/README.md) - Project documentation hosted at [https://docs.director.run](https://docs.director.run)
- [`apps/registry`](./apps/registry/README.md) - Backend for the registry hosted at [https://registry.director.run](https://registry.director.run)
- [`apps/sandbox`](./apps/sandbox/README.md) - A tool for running Director (and all MCP servers) securely inside a VM. Apple Silicon only.
- [`apps/studio`](./apps/studio/README.md) - Director frontend application

### Internal Packages

- [`packages/client-configurator`](./packages/client-configurator/README.md) - Library for managing MCP client configuration files
- [`packages/gateway`](./packages/gateway/README.md) - Core gateway and playbook logic
- [`packages/mcp`](./packages/mcp/README.md) - Extensions to MCP SDK that add middleware functionality
- [`packages/utilities`](./packages/utilities/README.md) - Shared utilities used across all packages and apps
- [`packages/design`](./packages/design/README.md) - Design system: reusable UI components, hooks, and styles for all Director apps

*This is a monorepo managed by [Turborepo](https://turbo.build/).*

# Community

If you're using director, have any ideas, or just want to chat about MCP, we'd love to chat:
- 💬 Join our [Discord](https://discord.gg/kWZGvWks)
- 📧 Send us an [Email](mailto:hello@director.run)
- 🐛 Report a [Bug](https://github.com/director-run/director/issues)
- 🐦 Follow us on [X / Twitter](https://x.com/barnabymalet) 

# Contributing

We welcome contributions! See [CONTRIBUTING.mdx](./apps/docs/project/contributing.mdx) for guidelines.

## Setting up Development Environment

```bash
# Fork and clone
git clone https://github.com/director_run/director
cd director
./scripts/setup-development.sh
bun run test
```

# License

AGPL v3 - See [LICENSE](./LICENSE) for details.
