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

[![Watch the video](https://image.mux.com/LkXOkiGsfatE6XLxda8ZEm02ydvxJ1K004y5EgqYV7dus/thumbnail.png?time=60)](https://player.mux.com/LkXOkiGsfatE6XLxda8ZEm02ydvxJ1K004y5EgqYV7dus)


## Key Features

- 📚 **Playbooks** - Maintain sets of tools, prompts and config for different tasks or environments.
- 🚀 **1-Click Integration** - Switch playbooks with a single click. Currently supports Claude Code, Claude Desktop, Cursor, VSCode
- 🔗 **Shareable** - Playbooks are flat files which can be shared or committed to version control easily.
- 🏠 **Local-First** - Director is local-first, designed to easily run on your own machine or infrastructure.
- 🔑 **Unified OAuth** - Connect to OAuth MCPs centrally, and use them across all of your agents.
- 🎯 **Tool Filtering** - Select only the MCP tools that are required for the specific task, preserving context.  
- 📋 **Declarative** - Like terraform for AI agents, Director will enforce playbook to client mapping on startup.
- 🔧 **Flexibility** - You can configure director through the UI, by editing the config file, through the CLI or even using the Typescript SDK.  
- 📊 **Observability** - Centralized JSON logging, that allows you to understand exactly what your agent is doing.
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
  cursor: [ demo ]

playbooks:
  - id: demo
    name: demo
    description: A demonstration playbook
    #
    # Prompts
    #
    prompts:
      - name: changelog
        title: changelog
        description: ""
        body: "write a short changelog based on recent changes on the
          director-run/director repository and the post it to to the slack
          #general channel. Make sure the message will format correctly inside
          of slack"

    #
    # MCP Servers
    #
    servers:
      # GitHub server
      - name: github
        type: http
        url: https://api.githubcopilot.com/mcp/
        headers:
          Authorization: Bearer
            <YOUR_GITHUB_TOKEN>
        # This server is enabled
        disabled: false
        # Only include the tools you need
        tools:
          include:
            - list_commits
            - search_pull_requests
            - get_latest_release
        # Prompts from MCP server are disabled by default
        prompts:
          include: []

        
      - name: slack
        type: stdio
        command: npx
        args:
          - -y
          - "@modelcontextprotocol/server-slack"
        env:
          SLACK_TEAM_ID: <YOUR_SLACK_TEAM_ID>
          SLACK_BOT_TOKEN: <YOUR_SLACK_BOT_TOKEN>
          SLACK_CHANNEL_IDS: <YOUR_SLACK_CHANNEL_ID>
        # This server is enabled
        disabled: false
        # Only include the tools you need
        tools:
          include:
            - slack_list_channels
            - slack_post_message
        # Prompts from MCP server are disabled by default
        prompts:
          include: []
```

## Architecture

At a high level, Director is a service that sits between your agents and MCP servers. It's transparent to clients, requiring no additional tokens. It models playbooks, which can be thought of as standalone, portable skills that enhance your AI agent with new capabilities.

<img src="https://github.com/director-run/director/blob/main/apps/docs/images/director-highlevel-overview.png" width="100%" alt="director demo">

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
   http2stdio <url>                              Proxy an HTTP connection to a stdio stream
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
  # Defaults to 3673
  port: 1234

#
# Client <> Playbook mappings (enforced on startup)
#
clients:
  cursor: [ demo ]

playbooks:
  - id: demo
    name: demo
    description: A demonstration playbook
    #
    # Prompts
    #
    prompts:
      - name: changelog
        title: changelog
        description: ""
        body: "write a short changelog based on recent changes on the
          director-run/director repository and the post it to to the slack
          #general channel. Make sure the message will format correctly inside
          of slack"

    #
    # MCP Servers
    #
    servers:
      # GitHub server
      - name: github
        type: http
        url: https://api.githubcopilot.com/mcp/
        headers:
          Authorization: Bearer
            <YOUR_GITHUB_TOKEN>
        # This server is enabled
        disabled: false
        # Only include the tools you need
        tools:
          include:
            - list_commits
            - search_pull_requests
            - get_latest_release
        # Prompts from MCP server are disabled by default
        prompts:
          include: []

        
      - name: slack
        type: stdio
        command: npx
        args:
          - -y
          - "@modelcontextprotocol/server-slack"
        env:
          SLACK_TEAM_ID: <YOUR_SLACK_TEAM_ID>
          SLACK_BOT_TOKEN: <YOUR_SLACK_BOT_TOKEN>
          SLACK_CHANNEL_IDS: <YOUR_SLACK_CHANNEL_ID>
        # This server is enabled
        disabled: false
        # Only include the tools you need
        tools:
          include:
            - slack_list_channels
            - slack_post_message
        # Prompts from MCP server are disabled by default
        prompts:
          include: []
```

### TypeScript SDK

Programmatic control for advanced use cases:

```typescript
import { Gateway, GatewayConfig } from "@director.run/sdk";

// Start the gateway
const gateway = await Gateway.start({
  config: await GatewayConfig.createMemoryBasedConfig({
    defaults: {
      server: {
        port: 3673,
      },
    },
  }),
  baseUrl: "http://localhost:3673",
});

// Add a new playbook
await gateway.playbookStore.create({
  name: "test",
  servers: [
    {
      name: "notion",
      type: "http",
      url: "https://mcp.notion.com/mcp",
    },
  ],
});
```

# Repository Structure

### External Apps

- [`apps/cli`](./apps/cli/README.md) - The command-line interface, the primary way to interact with Director. Available on [npm](https://www.npmjs.com/package/@director.run/cli).
- [`apps/sdk`](./apps/sdk/README.md) - The Typescript SDK, available on [npm](https://www.npmjs.com/package/@director.run/sdk).
- [`apps/docker`](./apps/docker/README.md) - The Director docker image, which allows you to run Director (and all MCP servers) securely inside a container. Available on [Docker Hub](https://hub.docker.com/r/barnaby/director).
- [`apps/docs`](./apps/docs/README.md) - Project documentation hosted at [https://docs.director.run](https://docs.director.run)
- [`apps/registry`](./apps/registry/README.md) - Backend for the registry hosted at [https://registry.director.run](https://registry.director.run)
- [`apps/studio`](./apps/studio/README.md) - Director frontend application

### Internal Packages

- [`packages/client-configurator`](./packages/client-configurator/README.md) - Library for managing MCP client configuration files
- [`apps/gateway`](./apps/gateway/README.md) - Core gateway and playbook logic
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
