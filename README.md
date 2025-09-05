<h1 align="center">Director</h1>
<p align="center">Context infrastructure for AI agents</p>

<p align="center"><code>curl -LsSf https://director.run/install.sh | sh</code></p>

---

<div align="center">

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![ci](https://github.com/director-run/director/workflows/CI/badge.svg)](https://github.com/director-run/director/actions/workflows/ci.yml)
[![Release](https://github.com/director-run/director/workflows/Release/badge.svg)](https://github.com/director-run/director/actions/workflows/release.yml)
[![npm](https://img.shields.io/npm/v/@director.run/cli.svg)](https://www.npmjs.com/package/@director.run/cli)

</div>

# Overview

Director is a **context engine** that packages MCP servers, prompts, and configuration into **workspaces** — portable contexts accessible through a single endpoint.

Instead of configuring MCP servers individually for each agent, Director lets you define context workspaces once and use them everywhere. Share complete AI contexts between Claude, Cursor, VSCode or any MCP enabled client. Distribute workspaces to your team. Switch between development and production contexts instantly. Run untrusted servers in isolation. All without cloud dependencies, API keys or accounts.

<br />
<img src="https://github.com/director-run/director/blob/main/apps/docs/images/context-engine.svg" />

# Quickstart

```bash
# Install Director
$ curl -LsSf https://director.run/install.sh | sh

# Start the onboarding flow
$ director quickstart
```

# The Context Management Problem

MCP standardizes how AI agents access context. However, the ecosystem is still nascent and using it remains complicated.

Every agent needs it's own configuration. You can't share context between Claude Code and Cursor. You definitely can't share with teammates. And running untrusted MCP servers means executing arbitrary code on your machine.

Director fixes this by treating **context as infrastructure** - something you define once and deploy everywhere.

## Why This Matters

| Problem | Current State | With Director |
|---------|--------------|---------------|
| **Agent Portability** | Each agent has proprietary config format | One workspace works with all MCP clients |
| **Context Switching** | Manual JSON editing to change tool sets | `director use production` switches instantly |
| **Team Collaboration** | "Send me your MCP config" "Which one?" "The working one" | `director export > context.yaml` - complete, working context |
| **Token Efficiency** | 50+ tools loaded, 5 actually needed | `include: [create_pr, review_code]` - load only what's relevant |
| **Security** | `npm install sketchy-mcp-server && pray` | `sandbox: docker` - full isolation |
| **Debugging** | Black box with no visibility | Structured JSON logs for every operation |

## Key Features

- 📚 **Workspaces** - Isolated contexts for different tasks or environments  
- 🚀 **Universal Portability** - One workspace, all agents, any teammate  
- 🏠 **Local-First** - Runs on your machine, not ours  
- 🔐 **Sandboxing** - Docker/VM isolation for untrusted servers  
- 🎯 **Smart Filtering** - Reduce token usage and improve accuracy  
- 👤 **Unified OAuth** - Authenticate once, use everywhere  
- 📊 **Observability** - Structured logs for debugging and compliance  
- 🔧 **Multiple Interfaces** - CLI, YAML, Studio UI, or TypeScript SDK  
- 🔌 **MCP Native** - Works with all clients and servers

# Core Concepts

## Workspaces Are Context

A workspace isn't configuration — it's a complete context for your AI. Tools, prompts, environment, and security boundaries packaged together:

```yaml
# Define a Workspace
workspaces:
  production_support:
    description: Investigate and resolve production issues
    servers:
      sentry: # alerts
        type: http
        url: https://mcp.sentry.dev/mcp
      
      cloudwatch: # logging
        type: stdio
        command: uvx
        args: ["awslabs.cloudwatch-mcp-server@latest"]
        env:
          AWS_PROFILE: "[The AWS Profile Name to use for AWS access]",
        include: [search_logs, get_metrics] # No write access

      github: # code
        type: http
        url: https://api.githubcopilot.com/mcp/
        tools:
          include: [ create_pr, search_code ] 

    prompts:
      - name: investigate
        content: |
          Check recent alerts, correlate with deployment times,
          search logs for errors, identify root cause

# Use with any MCP client
director connect production_support --target claude_code  # Auto-configures Claude Code
director connect production_support --target cursor  # Same workspace in Cursor
director export production_support > team-fix.yaml   # Share with team
```

This workspace is:

- **Portable**: Works with any MCP client
- **Shareable**: One file contains everything
- **Auditable**: Every tool call is logged
- **Safe**: Dangerous operations filtered out

## Local-First Architecture

Director runs entirely on your machine. No cloud services, no accounts, no api keys. Your context never leaves your control.

```bash
# Everything runs locally
director start

# Or sandbox everything in Docker
director start --sandbox docker
```

## Consumer Grade Experience

Director meets you where you are. You can interact with it via YAML, CLI or the web based management UI.

<img src="https://github.com/director-run/director/blob/main/apps/docs/images/demo.gif" width="100%" alt="animated hello">

# Usage

## Installation

There are two ways to install director:

```bash
# Option 1: Install director & it's dependencies (node, npm & uvx) using the installation script
$ curl -LsSf https://director.run/install.sh | sh

# Option 2: If you already have node installed, you can use npm
$ npm install -g @director.run/cli

# Start director & open the UI
$ director quickstart
```

## Starting Director

Director is designed to be an always-on background service:

```bash
# Start director
director start

# Stop director
director stop
```

## Management UI (aka Studio)

If you'd like to configure Director visually, this will open the management UI in your browser:

```bash
director studio
```

## Sandboxing

Director makes it easy to sandbox untrusted or insecure MCP servers:

```bash
# Run director (and all MCP servers) inside a docker sandbox
director start --sandbox docker
```

## Workspaces

A workspace is a collection of MCP servers, prompts, and configuration that work together for a specific purpose. For example, maintaining a changelog, fixing bugs, performing research, replying to support tickets...

### Creating a Workspace

You can create as many workspaces as you'd like:

```bash
director create <workspace_name>
```

### Adding Servers

Once you've created a workspace, you can add MCP servers. Director will proxy all tools, prompts and resources to the client.

```bash
# Add a server from the director registry
director server add <workspace_name> --entry <registry_entry>
# Add an Stdio server by specifying the command to run
director server add <workspace_name> --name <server_name> --command "uvx ..."
# Add a streamable or SSE sever by specifying it's URL
director server add <workspace_name> --name <server_name> --url https://example.com/mcp
```

### OAuth

Director has full OAuth support. Currently, we only support OAuth in the CLI.

```bash
# Add an OAuth server by specifying the URL
director server add <workspace_name> --name notion --url https://mcp.notion.com/mcp
# If you query the workspace, you'll notice that the server is "unauthorized"
director get <workspace_name>
# This will trigger the OAuth flow in your browser
director auth <workspace_name> notion
```

### Disabling Tools

MCP servers often add too many tools to your context, which can lead to hallucinations. You can use director to include only the tools you need.

```bash
director update <workspace_name> <server_name> -a includeTools=[<tool_name_1>, <tool_name_2>] 
```

### Tool Prefixing

You can use tool name prefixing to avoid conflicts when includeing multiple MCP servers that use the same tool name (for example search).

```bash
director update <workspace_name> <server_name> -a toolPrefix="prefix__"
```

## Connection Management

### Automatic Agent Connections

Director can manage client connections for you. Currently we support `claude_code`, `claude`, `cursor` & `vscode`.

```bash
# Conntect the workspace to a client, currently: "claude_code", "claude", "cursor", "vscode"
director connect <workspace_name> -t <client_name>
```

### Manual Connection Details

If your client isn't supported yet, you can connect manually.

```bash
# This will print out the Streamable / SSE URL as well as the Stdio connection config
$ director connect test_workspace
```

## Prompts

Director will not only proxy prompts from the underlying MCP servers, but will also allow you define your own prompts at the workspace level. This is helpful to capture and share prompts that you re-use often.

```bash
# Add a prompt to a workspace, this will open up your editor for you to add in the prompt body.
director prompts add <workspace_name> --name <prompt_name>
```

You can now invoke the prompt from your favourite client as follows: `\director__<prompt_name>`

## The Configuration File

Director uses a flat configuration file to manage all of it's state. Which makes it trivial to make large edits to your context as well as sharing.

Director will use the `director.yaml` file in the current directory if it is present. Otherwise, it will default to `~/.director/director.yaml`.

```yaml
# Configuration file reference
workspaces:
  name: code_review
  description: Automates code reviews
  servers:
    filesystem:
      type: stdio
      command: npx
      args: [ "@modelcontextprotocol/server-filesystem", "./src" ]
      
    github:
      type: http
      url: https://api.githubcopilot.com/mcp/
      tools:
        include: [ create_issue, search_code ] 

  prompts:
    - name: code_review
      content: "Review this code for security vulnerabilities and performance issues"
    
    - name: write_tests
      content: "Write comprehensive unit tests including edge cases"
```

## Observability & Debugging

### JSON Logging
Every MCP operation is logged as JSON:

```json
{
  "timestamp": "2024-01-20T10:30:00Z",
  "workspace": "production",
  "server": "github",
  "method": "tools/call",
  "tool": "create_issue",
  "duration_ms": 230,
  "status": "success"
}
```

The log level can be configured via the `LOG_LEVEL` environment variable

### Debugging

Director alsos provides a few utilities to help you debug MCP servers:

```bash
director mcp list-tools <workspace_name>                      
director mcp get-tool <workspace_name> <toolName>             
director mcp call-tool <workspace_name> <toolName> 

```

### CLI Reference

```bash
Manage context for your AI agent

USAGE
  director <command> [subcommand] [flags]

CORE COMMANDS
   quickstart                                    Start the gateway and open the studio in your browser
   serve                                         Start the web service
   studio                                        Open the UI in your browser
   ls                                            List proxies
   get <workspaceId> [serverName]                Show proxy details
   auth <proxyId> <server>                       Authenticate a server
   create <name>                                 Create a new proxy
   destroy <proxyId>                             Delete a proxy
   connect <proxyId> [options]                   Connect a proxy to a MCP client
   disconnect <proxyId> [options]                Disconnect a proxy from an MCP client
   add <proxyId> [options]                       Add a server to a proxy.
   remove <proxyId> <serverName>                 Remove a server from a proxy
   update <proxyId> [serverName] [options]       Update proxy attributes
   http2stdio <url>                              Proxy an HTTP connection (sse or streamable) to a stdio stream
   env [options]                                 Print environment variables
   status                                        Get the status of the director

REGISTRY
   registry ls                                   List all available servers in the registry
   registry get <entryName>                      Get detailed information about a registry item
   registry readme <entryName>                   Print the readme for a registry item

MCP
   mcp list-tools <proxyId>                      List tools on a proxy
   mcp get-tool <proxyId> <toolName>             Get the details of a tool
   mcp call-tool <proxyId> <toolName> [options]  Call a tool on a proxy

PROMPTS
   prompts ls <proxyId>                          List all prompts for a proxy
   prompts add <proxyId>                         Add a new prompt to a proxy
   prompts edit <proxyId> <promptName>           Edit an existing prompt
   prompts remove <proxyId> <promptName>         Remove a prompt from a proxy
   prompts get <proxyId> <promptName>            Show the details of a specific prompt

FLAGS
   -V, --version                                 output the version number

EXAMPLES
  $ director create my-proxy # Create a new proxy
  $ director add my-proxy --entry fetch # Add a server to a proxy
  $ director connect my-proxy --target claude # Connect my-proxy to claude

```

### TypeScript SDK

Programmatic control for advanced use cases:

```typescript
import { Director } from '@director.run/sdk';

const director = new Director();

// Create workspace programmatically
const workspace = await director.workspaces.create({
  name: 'ci-environment',
  servers: [{
    name: 'github',
    command: 'mcp-server-github',
    env: { GITHUB_TOKEN: process.env.GITHUB_TOKEN }
  }]
});

// Execute tools
const result = await workspace.callTool('github.create_issue', {
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
