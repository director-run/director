import { type EntryCreateParams } from "../db/schema";

// Original source: https://github.com/raycast/extensions/blob/main/extensions/model-context-protocol-registry/src/registries/builtin/entries.ts
// "https://raw.githubusercontent.com/raycast/extensions/refs/heads/main/extensions/model-context-protocol-registry/assets/chroma.png"

export const pureEntries: EntryCreateParams[] = [
  {
    name: "github",
    title: "GitHub",
    description:
      "Connect to the GitHub API, enabling file operations, repository management, search functionality, and more.",
    isOfficial: false,
    icon: "public/github.svg",
    homepage:
      "https://github.com/modelcontextprotocol/servers-archived/tree/main/src/github",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-github"],
      env: {
        GITHUB_PERSONAL_ACCESS_TOKEN: "<github-personal-access-token>",
      },
    },
    parameters: [
      {
        name: "github-personal-access-token",
        description:
          "Get a personal access token from [GitHub Settings](https://github.com/settings/tokens)",
        scope: "env",
        type: "string",
        password: true,
        required: true,
      },
    ],
  },
  {
    name: "notion",
    title: "Notion",
    description:
      "Connect to Notion API, enabling advanced automation and interaction capabilities for developers and tools.",
    isOfficial: true,
    icon: "public/notion.svg",
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
    parameters: [
      {
        name: "notion-bearer-token",
        description:
          "Get a bearer token from [Notion Settings](https://www.notion.so/profile/integrations)",
        scope: "env",
        type: "string",
        required: true,
        password: true,
      },
    ],
  },
];

export const entries: EntryCreateParams[] = [
  {
    name: "brave-search",
    title: "Brave Search",
    description:
      "A Model Context Protocol server for Brave Search. This server provides tools to read, search, and manipulate Brave Search repositories via Large Language Models.",
    isOfficial: true,
    icon: "public/brave.svg",
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
    parameters: [],
  },
  {
    name: "chroma",
    title: "Chroma",
    description:
      "This server provides data retrieval capabilities powered by Chroma, enabling AI models to create collections over generated data and user inputs, and retrieve that data using vector search, full text search, metadata filtering, and more.",
    isOfficial: true,
    icon: "public/chroma.svg",
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
    parameters: [],
  },
  {
    name: "context-7",
    title: "Context 7",
    description:
      "Context7 MCP pulls up-to-date, version-specific documentation and code examples straight from the source — and places them directly into your prompt.",
    isOfficial: true,
    icon: "public/context7.svg",
    homepage: "https://github.com/upstash/context7",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@upstash/context7-mcp@latest"],
    },
    parameters: [],
  },
  {
    name: "git",
    title: "Git",
    description:
      "A Model Context Protocol server for Git repository interaction and automation. This server provides tools to read, search, and manipulate Git repositories via Large Language Models.",
    isOfficial: true,
    icon: "public/git.svg",
    homepage:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/git",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp-server-git"],
    },
    parameters: [],
  },
  {
    name: "github",
    title: "GitHub",
    description:
      "The GitHub MCP Server is a Model Context Protocol (MCP) server that provides seamless integration with GitHub APIs, enabling advanced automation and interaction capabilities for developers and tools.",
    isOfficial: true,
    icon: "public/github.svg",
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
    parameters: [],
  },
  {
    name: "gitlab",
    title: "GitLab",
    description:
      "MCP Server for the GitLab API, enabling project management, file operations, and more.",
    isOfficial: true,
    icon: "public/gitlab.svg",
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
    parameters: [],
  },
  {
    name: "e2b",
    title: "E2B Code Interpreter",
    description:
      "A Model Context Protocol server for running code in a secure sandbox by [E2B](https://e2b.dev/).",
    isOfficial: true,
    icon: "public/e2b.svg",
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
    parameters: [],
  },
  {
    name: "exa",
    title: "Exa",
    description:
      "A Model Context Protocol (MCP) server lets AI assistants like Claude use the Exa AI Search API for web searches. This setup allows AI models to get real-time web information in a safe and controlled way.",
    isOfficial: true,
    icon: "public/exa.svg",
    homepage: "https://github.com/exa-labs/exa-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["exa-mcp-server"],
      env: {
        EXA_API_KEY: "<exa-api-key>",
      },
    },
    parameters: [],
  },
  {
    name: "google-drive",
    title: "Google Drive",
    description:
      "This MCP server integrates with Google Drive to allow listing, reading, and searching over files.",
    isOfficial: true,
    icon: "public/drive.svg",
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
    parameters: [],
  },
  {
    name: "jetbrains",
    title: "JetBrains",
    description: "The server proxies requests from client to JetBrains IDE.",
    isOfficial: true,
    icon: "public/jetbrains.svg",
    homepage: "https://github.com/JetBrains/mcp-jetbrains",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@jetbrains/mcp-proxy"],
    },
    parameters: [],
  },
  {
    name: "heroku",
    title: "Heroku",
    description:
      "The Heroku Platform MCP Server is a specialized Model Context Protocol (MCP) implementation designed to facilitate seamless interaction between large language models (LLMs) and the Heroku Platform. This server provides a robust set of tools and capabilities that enable LLMs to read, manage, and operate Heroku Platform resources.",
    isOfficial: true,
    icon: "public/heroku.svg",
    homepage: "https://github.com/heroku/heroku-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@heroku/mcp-server"],
      env: {
        HEROKU_API_KEY: "<heroku-api-key>",
      },
    },
    parameters: [],
  },
  {
    name: "filesystem",
    title: "Filesystem",
    description:
      "Node.js server implementing Model Context Protocol (MCP) for filesystem operations. The server will only allow operations within directories specified via args.",
    isOfficial: true,
    icon: "public/mcp.svg",
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
    parameters: [],
  },
  {
    name: "paddle",
    title: "Paddle",
    description:
      "Paddle Billing is the developer-first merchant of record. We take care of payments, tax, subscriptions, and metrics with one unified API that does it all. This is a Model Context Protocol (MCP) server that provides tools for interacting with the Paddle API.",
    isOfficial: true,
    icon: "public/paddle.svg",
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
    parameters: [],
  },
  {
    name: "perplexity",
    title: "Perplexity",
    description:
      "An MCP server implementation that integrates the Sonar API to provide Claude with unparalleled real-time, web-wide research.",
    isOfficial: true,
    icon: "public/perplexity.svg",
    homepage: "https://github.com/ppl-ai/modelcontextprotocol",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "server-perplexity-ask"],
      env: {
        PERPLEXITY_API_KEY: "<perplexity-api-key>",
      },
    },
    parameters: [],
  },
  {
    name: "sentry",
    title: "Sentry",
    description:
      "This service provides a Model Context Provider (MCP) for interacting with Sentry's API.",
    isOfficial: true,
    icon: "public/sentry.svg",
    homepage: "https://mcp.sentry.dev/",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "mcp-remote", "https://mcp.sentry.dev/sse"],
    },
    parameters: [],
  },
  {
    name: "slack",
    title: "Slack",
    description:
      "This service provides a Model Context Provider (MCP) for interacting with Slack's API.",
    isOfficial: true,
    icon: "public/slack.svg",
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
    parameters: [],
  },

  {
    name: "stripe",
    title: "Stripe",
    description:
      "This project follows the Model Context Protocol standard, allowing AI assistants to interact with Stripe's API.",
    isOfficial: true,
    icon: "public/stripe.svg",
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
    parameters: [],
  },
  {
    name: "supabase",
    title: "Supabase",
    description:
      "This project follows the Model Context Protocol standard, allowing AI assistants to interact with Supabase's API.",
    isOfficial: true,
    icon: "public/supabase.svg",
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
    parameters: [],
  },
  {
    name: "tavily",
    title: "Tavily",
    description:
      "This project follows the Model Context Protocol standard, allowing AI assistants to interact with Tavily's API.",
    isOfficial: true,
    icon: "public/tavily.svg",
    homepage: "https://github.com/tavily-ai/tavily-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "tavily-mcp"],
      env: {
        TAVILY_API_KEY: "<tavily-api-key>",
      },
    },
    parameters: [],
  },
  {
    name: "xero",
    title: "Xero",
    description:
      "This is a Model Context Protocol (MCP) server implementation for Xero. It provides a bridge between the MCP protocol and Xero's API, allowing for standardized access to Xero's accounting and business features.",
    isOfficial: true,
    icon: "public/xero.svg",
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
    parameters: [],
  },
  {
    name: "firecrawl",
    title: "Firecrawl",
    description:
      "A Model Context Protocol (MCP) server implementation that integrates with Firecrawl for web scraping capabilities.",
    isOfficial: true,
    icon: "public/mcp.svg",
    homepage: "https://github.com/mendableai/firecrawl-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "firecrawl-mcp"],
      env: {
        FIRECRAWL_API_KEY: "<firecrawl-api-key>",
      },
    },
    parameters: [],
  },
  {
    name: "playwright",
    title: "Playwright",
    description:
      "A Model Context Protocol server that provides browser automation capabilities using Playwright. This server enables LLMs to interact with web pages through structured accessibility snapshots, bypassing the need for screenshots or visually-tuned models.",
    isOfficial: true,
    icon: "public/playwright.svg",
    homepage: "https://github.com/microsoft/playwright-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["@playwright/mcp@latest"],
    },
    parameters: [],
  },
  {
    name: "notion",
    title: "Notion",
    description:
      "The Notion MCP Server is a Model Context Protocol (MCP) server that provides seamless integration with Notion APIs, enabling advanced automation and interaction capabilities for developers and tools.",
    isOfficial: true,
    icon: "public/notion.svg",
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
    parameters: [],
  },
  {
    name: "pydantic-run-python",
    title: "Pydantic Run Python",
    description:
      "The MCP Run Python package is an MCP server that allows agents to execute Python code in a secure, sandboxed environment. It uses Pyodide to run Python code in a JavaScript environment with Deno, isolating execution from the host system.",
    isOfficial: true,
    icon: "public/pydantic.svg",
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
    parameters: [],
  },
  {
    name: "pydantic-logfire",
    title: "Pydantic Logfire",
    description:
      "This repository contains a Model Context Protocol (MCP) server with tools that can access the OpenTelemetry traces and metrics you've sent to Logfire.\n\nThis MCP server enables LLMs to retrieve your application's telemetry data, analyze distributed traces, and make use of the results of arbitrary SQL queries executed using the Logfire APIs.",
    isOfficial: true,
    icon: "public/pydantic.svg",
    homepage: "https://github.com/pydantic/logfire-mcp",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["logfire-mcp", "--read-token=<logfire-api-key>"],
    },
    parameters: [],
  },
  {
    name: "polar",
    title: "Polar",
    description:
      "Extend the capabilities of your AI Agents with Polar as MCP Server",
    isOfficial: true,
    icon: "public/polar.svg",
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
    parameters: [],
  },
  {
    name: "elevenlabs",
    title: "ElevenLabs",
    description:
      "Official ElevenLabs Model Context Protocol (MCP) server that enables interaction with powerful Text to Speech and audio processing APIs. This server allows MCP clients like Claude Desktop, Cursor, Windsurf, OpenAI Agents and others to generate speech, clone voices, transcribe audio, and more.",
    isOfficial: true,
    icon: "public/elevenlabs.svg",
    homepage: "https://github.com/elevenlabs/elevenlabs-mcp",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["elevenlabs-mcp"],
      env: {
        ELEVENLABS_API_KEY: "<elevenlabs-api-key>",
      },
    },
    parameters: [],
  },
  {
    name: "talk-to-figma",
    title: "Talk to Figma",
    description:
      "This project implements a Model Context Protocol (MCP) integration between Cursor AI and Figma, allowing Cursor to communicate with Figma for reading designs and modifying them programmatically.",
    isOfficial: false,
    icon: "public/figma.svg",
    homepage: "https://github.com/sonnylazuardi/cursor-talk-to-figma-mcp",
    transport: {
      type: "stdio",
      command: "bunx",
      args: ["cursor-talk-to-figma-mcp@latest"],
    },
    parameters: [],
  },
  {
    name: "airbnb",
    title: "Airbnb",
    description: "MCP Server for searching Airbnb and get listing details.",
    isOfficial: false,
    icon: "public/airbnb.svg",
    homepage: "https://github.com/openbnb-org/mcp-server-airbnb",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@openbnb/mcp-server-airbnb", "--ignore-robots-txt"],
    },
    parameters: [],
  },
  {
    name: "airtable",
    title: "Airtable",
    description:
      "A Model Context Protocol server that provides read and write access to Airtable databases. This server enables LLMs to inspect database schemas, then read and write records.",
    isOfficial: false,
    icon: "public/airtable.svg",
    homepage: "https://github.com/domdomegg/airtable-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "airtable-mcp-server"],
      env: {
        AIRTABLE_API_KEY: "<airtable-api-key>",
      },
    },
    parameters: [],
  },
  {
    name: "apple-script",
    title: "Apple Script",
    description:
      "A Model Context Protocol (MCP) server that lets you run AppleScript code to interact with Mac. This MCP is intentionally designed to be simple, straightforward, intuitive, and require minimal setup.",
    isOfficial: false,
    icon: "public/applescript.svg",
    homepage: "https://github.com/peakmojo/applescript-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["@peakmojo/applescript-mcp"],
    },
    parameters: [],
  },
  {
    name: "basic-memory",
    title: "Basic Memory",
    description:
      "Basic Memory lets you build persistent knowledge through natural conversations with Large Language Models (LLMs) like Claude, while keeping everything in simple Markdown files on your computer. It uses the Model Context Protocol (MCP) to enable any compatible LLM to read and write to your local knowledge base.",
    isOfficial: false,
    icon: "public/mcp.svg",
    homepage: "https://github.com/basicmachines-co/basic-memory",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["basic-memory", "mcp"],
    },
    parameters: [],
  },
  {
    name: "big-query",
    title: "BigQuery",
    description:
      "A Model Context Protocol server that provides access to BigQuery. This server enables LLMs to inspect database schemas and execute queries.",
    isOfficial: false,
    icon: "public/bigquery.svg",
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
    parameters: [],
  },
  {
    name: "clickup",
    title: "ClickUp",
    description:
      "A Model Context Protocol (MCP) server for integrating ClickUp tasks with AI applications. This server allows AI agents to interact with ClickUp tasks, spaces, lists, and folders through a standardized protocol.",
    isOfficial: false,
    icon: "public/clickup.svg",
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
    parameters: [],
  },
  {
    name: "discord",
    title: "Discord",
    description:
      "A Model Context Protocol (MCP) server for the Discord API (JDA), allowing seamless integration of Discord Bot with MCP-compatible applications like Claude Desktop. Enable your AI assistants to seamlessly interact with Discord. Manage channels, send messages, and retrieve server information effortlessly. Enhance your Discord experience with powerful automation capabilities.",
    isOfficial: false,
    icon: "public/discord.svg",
    homepage: "https://github.com/SaseQ/discord-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["mcp-remote", "https://gitmcp.io/SaseQ/discord-mcp"],
      env: {
        DISCORD_TOKEN: "<discord-bot-token>",
      },
    },
    parameters: [],
  },
  {
    name: "firebase",
    title: "Firebase",
    description:
      "Firebase MCP enables AI assistants to work directly with Firebase services.",
    isOfficial: false,
    icon: "public/firebase.svg",
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
    parameters: [],
  },
  {
    name: "ghost",
    title: "Ghost",
    description:
      "A Model Context Protocol (MCP) server for interacting with Ghost CMS through LLM interfaces like Claude. This server provides secure and comprehensive access to your Ghost blog, leveraging JWT authentication and a rich set of MCP tools for managing posts, users, members, tiers, offers, and newsletters.",
    isOfficial: false,
    icon: "public/ghost.png",
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
    parameters: [],
  },
  {
    name: "iterm",
    title: "iTerm",
    description:
      "A Model Context Protocol server that provides access to your iTerm session.",
    isOfficial: false,
    icon: "public/iterm.png",
    homepage: "https://github.com/ferrislucas/iterm-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "iterm-mcp"],
    },
    parameters: [],
  },
  {
    name: "lightdash",
    title: "Lightdash",
    description:
      "This server provides MCP-compatible access to Lightdash's API, allowing AI assistants to interact with your Lightdash data through a standardized interface.",
    isOfficial: false,
    icon: "public/lightdash.png",
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
    parameters: [],
  },
  {
    name: "monday",
    title: "Monday",
    description:
      "MCP Server for monday.com, enabling MCP clients to interact with Monday.com boards, items, updates, and documents.",
    isOfficial: false,
    icon: "public/monday.svg",
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
    parameters: [],
  },
  {
    name: "hackernews",
    title: "Hackernews",
    description:
      "A Model Context Protocol (MCP) server that provides tools for fetching information from Hacker News.",
    icon: "public/hackernews.svg",
    homepage: "https://github.com/erithwik/mcp-hn",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["--from", "git+https://github.com/erithwik/mcp-hn", "mcp-hn"],
    },
    parameters: [],
  },
];
