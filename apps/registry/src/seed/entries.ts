import { type EntryCreateParams } from "../db/schema";

// Original source: https://github.com/raycast/extensions/blob/main/extensions/model-context-protocol-registry/src/registries/builtin/entries.ts
// "https://raw.githubusercontent.com/raycast/extensions/refs/heads/main/extensions/model-context-protocol-registry/assets/chroma.png"

export const entries: EntryCreateParams[] = [
  {
    name: "brave-search",
    title: "Brave Search",
    description:
      "A Model Context Protocol server for Brave Search. This server provides tools to read, search, and manipulate Brave Search repositories via Large Language Models.",
    isOfficial: true,
    icon: "https://svgl.app/library/brave.svg",
    homepage:
      "https://github.com/modelcontextprotocol/servers/tree/HEAD/src/brave-search",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-brave-search"],
      env: {
        BRAVE_API_KEY: "<brave-api-key>",
      },
    },
  },
  {
    name: "chroma",
    title: "Chroma",
    description:
      "This server provides data retrieval capabilities powered by Chroma, enabling AI models to create collections over generated data and user inputs, and retrieve that data using vector search, full text search, metadata filtering, and more.",
    isOfficial: true,
    icon: "chroma.png",
    homepage: "https://github.com/chroma-core/chroma-mcp",
    transport: {
      type: "stdio",
      command: "uvx",
      args: [
        "chroma-mcp",
        "--client-type",
        "cloud",
        "--tenant",
        "<chroma-tenant-id>",
        "--database",
        "<chroma-database-name>",
        "--api-key",
        "<chroma-api-key>",
      ],
    },
  },
  {
    name: "context-7",
    title: "Context 7",
    description:
      "Context7 MCP pulls up-to-date, version-specific documentation and code examples straight from the source — and places them directly into your prompt.",
    isOfficial: true,
    icon: "context-7.svg",
    homepage: "https://github.com/upstash/context7",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@upstash/context7-mcp@latest"],
    },
  },
  {
    name: "git",
    title: "Git",
    description:
      "A Model Context Protocol server for Git repository interaction and automation. This server provides tools to read, search, and manipulate Git repositories via Large Language Models.",
    isOfficial: true,
    icon: "https://svgl.app/library/git.svg",
    homepage:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/git",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp-server-git"],
    },
  },
  {
    name: "github",
    title: "GitHub",
    description:
      "The GitHub MCP Server is a Model Context Protocol (MCP) server that provides seamless integration with GitHub APIs, enabling advanced automation and interaction capabilities for developers and tools.",
    isOfficial: true,
    icon: "https://svgl.app/library/github_light.svg",
    homepage:
      "https://github.com/github/github-mcp-server?utm_source=Blog&utm_medium=GitHub&utm_campaign=proplus&utm_notesblogtop",
    transport: {
      type: "stdio",
      command: "docker",
      args: [
        "run",
        "-i",
        "--rm",
        "-e",
        "GITHUB_PERSONAL_ACCESS_TOKEN",
        "ghcr.io/github/github-mcp-server",
      ],
      env: {
        GITHUB_PERSONAL_ACCESS_TOKEN: "<github-personal-access-token>",
      },
    },
  },
  {
    name: "gitlab",
    title: "GitLab",
    description:
      "MCP Server for the GitLab API, enabling project management, file operations, and more.",
    isOfficial: true,
    icon: "https://svgl.app/library/gitlab.svg",
    homepage:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/gitlab",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-gitlab"],
      env: {
        GITLAB_PERSONAL_ACCESS_TOKEN: "<gitlab-personal-access-token>",
        GITLAB_API_URL: "https://gitlab.com/api/v4", // Optional, for self-hosted instances
      },
    },
  },
  {
    name: "e2b",
    title: "E2B Code Interpreter",
    description:
      "A Model Context Protocol server for running code in a secure sandbox by [E2B](https://e2b.dev/).",
    isOfficial: true,
    icon: "e2b.svg",
    homepage:
      "https://github.com/e2b-dev/mcp-server/blob/main/packages/js/README.md",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@e2b/mcp-server"],
      env: {
        E2B_API_KEY: "<e2b-api-key>",
      },
    },
  },
  {
    name: "exa",
    title: "Exa",
    description:
      "A Model Context Protocol (MCP) server lets AI assistants like Claude use the Exa AI Search API for web searches. This setup allows AI models to get real-time web information in a safe and controlled way.",
    isOfficial: true,
    icon: "exa.png",
    homepage: "https://github.com/exa-labs/exa-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["exa-mcp-server"],
      env: {
        EXA_API_KEY: "<exa-api-key>",
      },
    },
  },
  {
    name: "google-drive",
    title: "Google Drive",
    description:
      "This MCP server integrates with Google Drive to allow listing, reading, and searching over files.",
    isOfficial: true,
    icon: "https://svgl.app/library/drive.svg",
    homepage:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/gdrive",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-gdrive"],
      env: {
        GDRIVE_CREDENTIALS_PATH: "<gdrive-server-credentials-path>",
      },
    },
  },
  {
    name: "jetbrains",
    title: "JetBrains",
    description: "The server proxies requests from client to JetBrains IDE.",
    isOfficial: true,
    icon: "https://svgl.app/library/jetbrains.svg",
    homepage: "https://github.com/JetBrains/mcp-jetbrains",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@jetbrains/mcp-proxy"],
    },
  },
  {
    name: "heroku",
    title: "Heroku",
    description:
      "The Heroku Platform MCP Server is a specialized Model Context Protocol (MCP) implementation designed to facilitate seamless interaction between large language models (LLMs) and the Heroku Platform. This server provides a robust set of tools and capabilities that enable LLMs to read, manage, and operate Heroku Platform resources.",
    isOfficial: true,
    icon: "heroku.svg",
    homepage: "https://github.com/heroku/heroku-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@heroku/mcp-server"],
      env: {
        HEROKU_API_KEY: "<heroku-api-key>",
      },
    },
  },
  {
    name: "filesystem",
    title: "Filesystem",
    description:
      "Node.js server implementing Model Context Protocol (MCP) for filesystem operations. The server will only allow operations within directories specified via args.",
    isOfficial: true,
    icon: "https://svgl.app/library/folder.svg",
    homepage:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem",
    transport: {
      type: "stdio",
      command: "npx",
      args: [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "<fs-allowed-path>",
      ],
    },
  },
  {
    name: "paddle",
    title: "Paddle",
    description:
      "Paddle Billing is the developer-first merchant of record. We take care of payments, tax, subscriptions, and metrics with one unified API that does it all. This is a Model Context Protocol (MCP) server that provides tools for interacting with the Paddle API.",
    isOfficial: true,
    icon: "paddle.svg",
    homepage: "https://github.com/PaddleHQ/paddle-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: [
        "-y",
        "@paddle/paddle-mcp",
        "--api-key=<paddle-api-key>",
        "--environment=<paddle-environment>",
      ],
    },
  },
  {
    name: "perplexity",
    title: "Perplexity",
    description:
      "An MCP server implementation that integrates the Sonar API to provide Claude with unparalleled real-time, web-wide research.",
    isOfficial: true,
    icon: "https://svgl.app/library/perplexity.svg",
    homepage: "https://github.com/ppl-ai/modelcontextprotocol",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "server-perplexity-ask"],
      env: {
        PERPLEXITY_API_KEY: "<perplexity-api-key>",
      },
    },
  },
  {
    name: "sentry",
    title: "Sentry",
    description:
      "This service provides a Model Context Provider (MCP) for interacting with Sentry's API.",
    isOfficial: true,
    icon: "sentry.svg",
    homepage: "https://mcp.sentry.dev/",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "mcp-remote", "https://mcp.sentry.dev/sse"],
    },
  },
  {
    name: "slack",
    title: "Slack",
    description:
      "This service provides a Model Context Provider (MCP) for interacting with Slack's API.",
    isOfficial: true,
    icon: "https://svgl.app/library/slack.svg",
    homepage:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/slack",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-slack"],
      env: {
        SLACK_BOT_TOKEN: "<slack-bot-token>",
        SLACK_TEAM_ID: "<slack-team-id>",
        SLACK_CHANNEL_IDS: "<slack-channel-ids>", // C01234567, C76543210
      },
    },
  },
  {
    name: "square",
    title: "Square",
    description:
      "This project follows the Model Context Protocol standard, allowing AI assistants to interact with Square's connect API.",
    isOfficial: true,
    icon: "square.svg",
    homepage: "https://github.com/square/square-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["mcp-remote", "https://mcp.squareup.com/sse"],
    },
  },
  {
    name: "stripe",
    title: "Stripe",
    description:
      "This project follows the Model Context Protocol standard, allowing AI assistants to interact with Stripe's API.",
    isOfficial: true,
    icon: "https://svgl.app/library/stripe.svg",
    homepage: "https://github.com/stripe/agent-toolkit",
    transport: {
      type: "stdio",
      command: "npx",
      args: [
        "-y",
        "@stripe/mcp",
        "--tools=all",
        "--api-key=<stripe-secret-key>",
      ],
    },
  },
  {
    name: "supabase",
    title: "Supabase",
    description:
      "This project follows the Model Context Protocol standard, allowing AI assistants to interact with Supabase's API.",
    isOfficial: true,
    icon: "https://svgl.app/library/supabase.svg",
    homepage: "https://supabase.com/docs/guides/getting-started/mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        "<supabase-personal-access-token>",
      ],
    },
  },
  {
    name: "tavily",
    title: "Tavily",
    description:
      "This project follows the Model Context Protocol standard, allowing AI assistants to interact with Tavily's API.",
    isOfficial: true,
    icon: "tavily.svg",
    homepage: "https://github.com/tavily-ai/tavily-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "tavily-mcp"],
      env: {
        TAVILY_API_KEY: "<tavily-api-key>",
      },
    },
  },
  {
    name: "xero",
    title: "Xero",
    description:
      "This is a Model Context Protocol (MCP) server implementation for Xero. It provides a bridge between the MCP protocol and Xero's API, allowing for standardized access to Xero's accounting and business features.",
    isOfficial: true,
    icon: "xero.svg",
    homepage: "https://github.com/XeroAPI/xero-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@xeroapi/xero-mcp-server@latest"],
      env: {
        XERO_CLIENT_ID: "<xero-client-id>",
        XERO_CLIENT_SECRET: "<xero-client-secret>",
      },
    },
  },
  {
    name: "firecrawl",
    title: "Firecrawl",
    description:
      "A Model Context Protocol (MCP) server implementation that integrates with Firecrawl for web scraping capabilities.",
    isOfficial: true,
    icon: "🔥",
    homepage: "https://github.com/mendableai/firecrawl-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "firecrawl-mcp"],
      env: {
        FIRECRAWL_API_KEY: "<firecrawl-api-key>",
      },
    },
  },
  {
    name: "playwright",
    title: "Playwright",
    description:
      "A Model Context Protocol server that provides browser automation capabilities using Playwright. This server enables LLMs to interact with web pages through structured accessibility snapshots, bypassing the need for screenshots or visually-tuned models.",
    isOfficial: true,
    icon: "https://playwright.dev/img/playwright-logo.svg",
    homepage: "https://github.com/microsoft/playwright-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["@playwright/mcp@latest"],
    },
  },
  {
    name: "notion",
    title: "Notion",
    description:
      "The Notion MCP Server is a Model Context Protocol (MCP) server that provides seamless integration with Notion APIs, enabling advanced automation and interaction capabilities for developers and tools.",
    isOfficial: true,
    icon: "https://svgl.app/library/notion.svg",
    homepage: "https://github.com/makenotion/notion-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@notionhq/notion-mcp-server"],
      env: {
        OPENAPI_MCP_HEADERS:
          '{"Authorization": "Bearer <notion-bearer-token>", "Notion-Version": "2022-06-28" }',
      },
    },
  },
  {
    name: "pydantic-run-python",
    title: "Pydantic Run Python",
    description:
      "The MCP Run Python package is an MCP server that allows agents to execute Python code in a secure, sandboxed environment. It uses Pyodide to run Python code in a JavaScript environment with Deno, isolating execution from the host system.",
    isOfficial: true,
    icon: "pydantic.svg",
    homepage: "https://ai.pydantic.dev/mcp/run-python/",
    transport: {
      type: "stdio",
      command: "deno",
      args: [
        "run",
        "-N",
        "-R=node_modules",
        "-W=node_modules",
        "--node-modules-dir=auto",
        "jsr:@pydantic/mcp-run-python",
        "stdio",
      ],
    },
  },
  {
    name: "pydantic-logfire",
    title: "Pydantic Logfire",
    description:
      "This repository contains a Model Context Protocol (MCP) server with tools that can access the OpenTelemetry traces and metrics you've sent to Logfire.\n\nThis MCP server enables LLMs to retrieve your application's telemetry data, analyze distributed traces, and make use of the results of arbitrary SQL queries executed using the Logfire APIs.",
    isOfficial: true,
    icon: "pydantic.svg",
    homepage: "https://github.com/pydantic/logfire-mcp",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["logfire-mcp", "--read-token=<logfire-api-key>"],
    },
  },
  {
    name: "polar",
    title: "Polar",
    description:
      "Extend the capabilities of your AI Agents with Polar as MCP Server",
    isOfficial: true,
    icon: "polar.svg",
    homepage: "https://docs.polar.sh/integrate/mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: [
        "-y",
        "--package",
        "@polar-sh/sdk",
        "--",
        "mcp",
        "start",
        "--access-token",
        "<polar-access-token>",
      ],
    },
  },
  {
    name: "elevenlabs",
    title: "ElevenLabs",
    description:
      "Official ElevenLabs Model Context Protocol (MCP) server that enables interaction with powerful Text to Speech and audio processing APIs. This server allows MCP clients like Claude Desktop, Cursor, Windsurf, OpenAI Agents and others to generate speech, clone voices, transcribe audio, and more.",
    isOfficial: true,
    icon: "elevenlabs.svg",
    homepage: "https://github.com/elevenlabs/elevenlabs-mcp",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["elevenlabs-mcp"],
      env: {
        ELEVENLABS_API_KEY: "<elevenlabs-api-key>",
      },
    },
  },
  {
    name: "talk-to-figma",
    title: "Talk to Figma",
    description:
      "This project implements a Model Context Protocol (MCP) integration between Cursor AI and Figma, allowing Cursor to communicate with Figma for reading designs and modifying them programmatically.",
    isOfficial: false,
    icon: "https://svgl.app/library/figma.svg",
    homepage: "https://github.com/sonnylazuardi/cursor-talk-to-figma-mcp",
    transport: {
      type: "stdio",
      command: "bunx",
      args: ["cursor-talk-to-figma-mcp@latest"],
    },
  },
  {
    name: "airbnb",
    title: "Airbnb",
    description: "MCP Server for searching Airbnb and get listing details.",
    isOfficial: false,
    icon: "https://svgl.app/library/airbnb.svg",
    homepage: "https://github.com/openbnb-org/mcp-server-airbnb",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@openbnb/mcp-server-airbnb", "--ignore-robots-txt"],
    },
  },
  {
    name: "airtable",
    title: "Airtable",
    description:
      "A Model Context Protocol server that provides read and write access to Airtable databases. This server enables LLMs to inspect database schemas, then read and write records.",
    isOfficial: false,
    icon: "airtable.svg",
    homepage: "https://github.com/domdomegg/airtable-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "airtable-mcp-server"],
      env: {
        AIRTABLE_API_KEY: "<airtable-api-key>",
      },
    },
  },
  {
    name: "apple-script",
    title: "Apple Script",
    description:
      "A Model Context Protocol (MCP) server that lets you run AppleScript code to interact with Mac. This MCP is intentionally designed to be simple, straightforward, intuitive, and require minimal setup.",
    isOfficial: false,
    icon: "applescript.png",
    homepage: "https://github.com/peakmojo/applescript-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["@peakmojo/applescript-mcp"],
    },
  },
  {
    name: "basic-memory",
    title: "Basic Memory",
    description:
      "Basic Memory lets you build persistent knowledge through natural conversations with Large Language Models (LLMs) like Claude, while keeping everything in simple Markdown files on your computer. It uses the Model Context Protocol (MCP) to enable any compatible LLM to read and write to your local knowledge base.",
    isOfficial: false,
    icon: "https://svgl.app/library/memory-stick.svg",
    homepage: "https://github.com/basicmachines-co/basic-memory",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["basic-memory", "mcp"],
    },
  },
  {
    name: "big-query",
    title: "BigQuery",
    description:
      "A Model Context Protocol server that provides access to BigQuery. This server enables LLMs to inspect database schemas and execute queries.",
    isOfficial: false,
    icon: "bigquery.svg",
    homepage: "https://github.com/LucasHild/mcp-server-bigquery",
    transport: {
      type: "stdio",
      command: "uvx",
      args: [
        "mcp-server-bigquery",
        "--project",
        "<bigquery-project-id>",
        "--location",
        "<bigquery-location>",
      ],
    },
  },
  {
    name: "clickup",
    title: "ClickUp",
    description:
      "A Model Context Protocol (MCP) server for integrating ClickUp tasks with AI applications. This server allows AI agents to interact with ClickUp tasks, spaces, lists, and folders through a standardized protocol.",
    isOfficial: false,
    icon: "clickup.svg",
    homepage: "https://github.com/TaazKareem/clickup-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@taazkareem/clickup-mcp-server@latest"],
      env: {
        CLICKUP_API_KEY: "<clickup-api-key>",
        CLICKUP_TEAM_ID: "<clickup-team-id>",
        DOCUMENT_SUPPORT: "true",
      },
    },
  },
  {
    name: "discord",
    title: "Discord",
    description:
      "A Model Context Protocol (MCP) server for the Discord API (JDA), allowing seamless integration of Discord Bot with MCP-compatible applications like Claude Desktop. Enable your AI assistants to seamlessly interact with Discord. Manage channels, send messages, and retrieve server information effortlessly. Enhance your Discord experience with powerful automation capabilities.",
    isOfficial: false,
    icon: "https://svgl.app/library/discord.svg",
    homepage: "https://github.com/SaseQ/discord-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["mcp-remote", "https://gitmcp.io/SaseQ/discord-mcp"],
      env: {
        DISCORD_TOKEN: "<discord-bot-token>",
      },
    },
  },
  {
    name: "firebase",
    title: "Firebase",
    description:
      "Firebase MCP enables AI assistants to work directly with Firebase services.",
    isOfficial: false,
    icon: "https://svgl.app/library/firebase.svg",
    homepage: "https://github.com/gannonh/firebase-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@gannonh/firebase-mcp"],
      env: {
        SERVICE_ACCOUNT_KEY_PATH:
          "<firebase-absolute-path-to-service-account-key>",
        FIREBASE_STORAGE_BUCKET: "<firebase-storage-bucket>",
      },
    },
  },
  {
    name: "ghost",
    title: "Ghost",
    description:
      "A Model Context Protocol (MCP) server for interacting with Ghost CMS through LLM interfaces like Claude. This server provides secure and comprehensive access to your Ghost blog, leveraging JWT authentication and a rich set of MCP tools for managing posts, users, members, tiers, offers, and newsletters.",
    isOfficial: false,
    icon: "ghost.png",
    homepage: "https://github.com/MFYDev/ghost-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@fanyangmeng/ghost-mcp"],
      env: {
        GHOST_API_URL: "<ghost-admin-api-url>",
        GHOST_ADMIN_API_KEY: "<ghost-admin-api-key>",
        GHOST_API_VERSION: "v5.0",
      },
    },
  },
  {
    name: "iterm",
    title: "iTerm",
    description:
      "A Model Context Protocol server that provides access to your iTerm session.",
    isOfficial: false,
    icon: "iterm.svg",
    homepage: "https://github.com/ferrislucas/iterm-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "iterm-mcp"],
    },
  },
  {
    name: "lightdash",
    title: "Lightdash",
    description:
      "This server provides MCP-compatible access to Lightdash's API, allowing AI assistants to interact with your Lightdash data through a standardized interface.",
    isOfficial: false,
    icon: "lightdash.svg",
    homepage: "https://github.com/syucream/lightdash-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "lightdash-mcp-server"],
      env: {
        LIGHTDASH_API_KEY: "<lightdash-api-key>",
        LIGHTDASH_API_URL: "<lightdash-api-url>",
      },
    },
  },
  {
    name: "monday",
    title: "Monday",
    description:
      "MCP Server for monday.com, enabling MCP clients to interact with Monday.com boards, items, updates, and documents.",
    isOfficial: false,
    icon: "monday.svg",
    homepage: "https://github.com/sakce/mcp-server-monday",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp-server-monday"],
      env: {
        MONDAY_API_KEY: "<monday-api-key>",
        MONDAY_WORKSPACE_NAME: "<monday-workspace-name>",
      },
    },
  },
  {
    name: "fetch",
    title: "Fetch",
    description:
      "A Model Context Protocol server that provides web content fetching capabilities. This server enables LLMs to retrieve and process content from web pages, converting HTML to markdown for easier consumption.",
    homepage:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/fetch",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp-server-fetch"],
    },
  },
  {
    name: "hackernews",
    title: "Hackernews",
    description:
      "A Model Context Protocol (MCP) server that provides tools for fetching information from Hacker News.",
    homepage: "https://github.com/erithwik/mcp-hn",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["--from", "git+https://github.com/erithwik/mcp-hn", "mcp-hn"],
    },
  },
];
