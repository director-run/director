import { type EntryCreateParams } from "../schema";

// TODO:
// Postgres
// Dropbox?
// Terminal?
// Stripe
// Obsidian
// Playwright

// Gmail
// Google Drive
// Google Calendar
// Google Maps

// All of these servers work. To add a new one, add it to this list.
// Please test it with bin/test-entry.ts before merging to main
export const entries: EntryCreateParams[] = [
  {
    name: "github",
    title: "GitHub",
    description:
      "Provides seamless integration with GitHub APIs, enabling advanced automation and interaction capabilities for developers and tools.",
    isOfficial: true,
    icon: "https://registry.director.run/github.svg",
    homepage: "https://github.com/github/github-mcp-server",
    transport: {
      type: "http",
      url: "https://api.githubcopilot.com/mcp/",
      headers: {
        Authorization: "Bearer <github-personal-access-token>",
      },
    },
    parameters: [
      {
        name: "github-personal-access-token",
        description:
          "Get a personal access token from [GitHub Settings](https://github.com/settings/tokens)",
        type: "string",
        password: true,
        required: true,
      },
    ],
  },
  {
    name: "makenotion-notion-mcp-server",
    title: "Notion",
    description:
      "Connect to Notion API, enabling advanced automation and interaction capabilities for developers and tools.",
    isOfficial: true,
    icon: "https://registry.director.run/notion.svg",
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
        type: "string",
        required: true,
        password: true,
      },
    ],
  },
  {
    name: "hackernews",
    title: "Hackernews",
    description: "Provides tools for fetching information from Hacker News.",
    isOfficial: false,
    icon: "https://registry.director.run/hackernews.svg",
    homepage: "https://github.com/erithwik/mcp-hn",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["--from", "git+https://github.com/erithwik/mcp-hn", "mcp-hn"],
    },
    parameters: [],
  },
  {
    name: "git",
    title: "Git",
    description:
      "Provides tools to read, search, and manipulate Git repositories.",
    isOfficial: false,
    icon: "https://registry.director.run/git.svg",
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
    name: "filesystem",
    title: "Filesystem",
    description: "Secure file operations with configurable access controls.",
    isOfficial: false,
    icon: "https://registry.director.run/mcp.svg",
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
    parameters: [
      {
        name: "fs-allowed-path",
        description:
          "The path to the directory to allow filesystem operations in.",
        type: "string",
        required: true,
      },
    ],
  },
  {
    name: "fetch",
    title: "Fetch",
    description: "Retrieves and converts web content for efficient LLM usage.",
    isOfficial: false,
    icon: "https://registry.director.run/mcp.svg",
    homepage:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/fetch",
    transport: {
      args: ["mcp-server-fetch"],
      type: "stdio",
      command: "uvx",
    },
    parameters: [],
  },
  {
    name: "memory",
    title: "Memory",
    description: "Knowledge graph-based persistent memory system.",
    isOfficial: false,
    icon: "https://registry.director.run/mcp.svg",
    homepage:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/memory",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-memory"],
    },
    parameters: [],
  },
  {
    name: "sequential-thinking",
    title: "Sequential Thinking",
    description:
      "Dynamic and reflective problem-solving through a structured thinking process.",
    isOfficial: false,
    icon: "https://registry.director.run/mcp.svg",
    homepage:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-sequential-thinking"],
    },
    parameters: [],
  },
  {
    name: "time",
    title: "Time",
    description: "Time and timezone conversion capabilities.",
    isOfficial: false,
    icon: "https://registry.director.run/mcp.svg",
    homepage:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/time",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp-server-time"],
    },
    parameters: [],
  },
  {
    name: "slack",
    title: "Slack",
    description: "Allows you to interact with the Slack API.",
    isOfficial: true,
    icon: "https://registry.director.run/slack.svg",
    homepage:
      "https://github.com/modelcontextprotocol/servers-archived/tree/main/src/slack",
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
    parameters: [
      {
        name: "slack-bot-token",
        description: "Slack Bot Token (e.g. 'xoxb-1234..').",
        type: "string",
        required: true,
        password: true,
      },
      {
        name: "slack-team-id",
        description: "Slack Team ID. (e.g. 'T01234567')",
        type: "string",
        required: true,
      },
      {
        name: "slack-channel-ids",
        description:
          "Channel IDs, comma separated. (e.g. 'C01234567, C76543210')",
        type: "string",
        required: true,
      },
    ],
  },
  {
    name: "google-calendar",
    title: "Google Calendar",
    description: "Allows you to interact with Google Calendar integration.",
    isOfficial: false,
    icon: "https://registry.director.run/google-calendar.png",
    homepage: "https://github.com/nspady/google-calendar-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["@cocal/google-calendar-mcp"],
      env: {
        GOOGLE_OAUTH_CREDENTIALS: "<google-oauth-credentials-file>",
      },
    },
    parameters: [
      {
        name: "google-oauth-credentials-file",
        description: "Full path to the Google OAuth credentials JSON file.",
        type: "string",
        required: true,
      },
    ],
  },
  {
    name: "context-7",
    title: "Context 7",
    description:
      "Context7 MCP pulls up-to-date, version-specific documentation and code examples straight from the source — and places them directly into your prompt.",
    isOfficial: true,
    icon: "https://registry.director.run/context7.svg",
    homepage: "https://github.com/upstash/context7",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@upstash/context7-mcp"],
    },
    parameters: [],
  },
  {
    name: "playwright",
    title: "Playwright",
    description:
      "Interact with web pages through structured accessibility snapshots, bypassing the need for screenshots or visually-tuned models.",
    isOfficial: true,
    icon: "https://registry.director.run/playwright.svg",
    homepage: "https://github.com/microsoft/playwright-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["@playwright/mcp@latest"],
    },
    parameters: [],
  },
  {
    name: "supabase",
    title: "Supabase",
    description: "Connect your AI tools to Supabase.",
    isOfficial: true,
    icon: "https://registry.director.run/supabase.svg",
    homepage: "https://supabase.com/docs/guides/getting-started/mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=<supabase-project-ref>",
      ],
      env: {
        SUPABASE_ACCESS_TOKEN: "<supabase-personal-access-token>",
      },
    },
    parameters: [
      {
        name: "supabase-project-ref",
        description: "Supabase project reference.",
        type: "string",
        required: true,
      },
      {
        name: "supabase-personal-access-token",
        description: "Personal access token for Supabase.",
        type: "string",
        required: true,
        password: true,
      },
    ],
  },
  {
    name: "aashari-mcp-server-atlassian-bitbucket",
    title: "Atlassian Bitbucket MCP Server",
    description:
      "An integration tool that enables AI assistants like Claude to directly access and interact with Bitbucket repositories, pull requests, and code without requiring copy/paste operations.",
    icon: "https://avatars.githubusercontent.com/aashari",
    isOfficial: false,
    homepage: "https://github.com/aashari/mcp-server-atlassian-bitbucket",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @aashari/mcp-server-atlassian-bitbucket"],
      env: {
        DEBUG: "<debug>",
        ATLASSIAN_API_TOKEN: "<atlassian-api-token>",
        ATLASSIAN_SITE_NAME: "<atlassian-site-name>",
        ATLASSIAN_USER_EMAIL: "<atlassian-user-email>",
        ATLASSIAN_BITBUCKET_USERNAME: "<atlassian-bitbucket-username>",
        ATLASSIAN_BITBUCKET_APP_PASSWORD: "<atlassian-bitbucket-app-password>",
      },
    },
    parameters: [
      {
        name: "DEBUG",
        description: "Enable debug logging",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "ATLASSIAN_API_TOKEN",
        description: "The API token created in your Atlassian account",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "ATLASSIAN_SITE_NAME",
        description:
          "Your Atlassian site name (e.g., for example.atlassian.net, enter example)",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "ATLASSIAN_USER_EMAIL",
        description: "Your Atlassian account email address",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "ATLASSIAN_BITBUCKET_USERNAME",
        description: "Your Bitbucket username",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "ATLASSIAN_BITBUCKET_APP_PASSWORD",
        description: "The app password created in your Bitbucket account",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "abhaybabbar-retellai-mcp-server",
    title: "RetellAI MCP Server",
    description:
      "A Model Context Protocol server implementation that enables AI assistants to interact with RetellAI's voice services for managing calls, agents, phone numbers, and voice options.",
    icon: "https://avatars.githubusercontent.com/abhaybabbar",
    isOfficial: false,
    homepage: "https://github.com/abhaybabbar/retellai-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @abhaybabbar/retellai-mcp-server"],
      env: {
        RETELL_API_KEY: "<retell-api-key>",
      },
    },
    parameters: [
      {
        name: "RETELL_API_KEY",
        description: "Your RetellAI API key",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "abhishekjairath-sonic-pi-mcp",
    title: "Sonic Pi MCP",
    description:
      "A Model Context Protocol server that allows AI assistants like Claude and Cursor to create music and control Sonic Pi programmatically through OSC messages.",
    icon: "https://avatars.githubusercontent.com/abhishekjairath",
    isOfficial: false,
    homepage: "https://github.com/abhishekjairath/sonic-pi-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y sonic-pi-mcp"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "abhiz123-todoist-mcp-server",
    title: "Todoist MCP Server",
    description:
      "An MCP server that integrates Claude with Todoist, enabling natural language task management including creating, updating, completing, and deleting tasks.",
    icon: "https://avatars.githubusercontent.com/abhiz123",
    isOfficial: false,
    homepage: "https://github.com/abhiz123/todoist-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @abhiz123/todoist-mcp-server"],
      env: {
        TODOIST_API_TOKEN: "<todoist-api-token>",
      },
    },
    parameters: [
      {
        name: "TODOIST_API_TOKEN",
        description:
          "Your Todoist API token obtained from Todoist Settings → Integrations → Developer",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "adepanges-teamretro-mcp-server",
    title: "TeamRetro MCP Server",
    description:
      "An unofficial MCP server that enables Claude to interact with TeamRetro.com's API for team retrospective management, providing direct pass-through to TeamRetro's public API endpoints with multiple authentication options.",
    icon: "https://avatars.githubusercontent.com/adepanges",
    isOfficial: false,
    homepage: "https://github.com/adepanges/teamretro-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y teamretro-mcp-server"],
      env: {
        TEAMRETRO_TOKEN: "<teamretro-token>",
        TEAMRETRO_API_KEY: "<teamretro-api-key>",
        TEAMRETRO_BASE_URL: "<teamretro-base-url>",
        TEAMRETRO_PASSWORD: "<teamretro-password>",
        TEAMRETRO_USERNAME: "<teamretro-username>",
        TEAMRETRO_AUTH_TYPE: "<teamretro-auth-type>",
      },
    },
    parameters: [
      {
        name: "TEAMRETRO_TOKEN",
        description: "Your TeamRetro bearer token for bearer authentication",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "TEAMRETRO_API_KEY",
        description: "Your TeamRetro API key for apiKey authentication",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "TEAMRETRO_BASE_URL",
        description: "Base URL for TeamRetro API",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "TEAMRETRO_PASSWORD",
        description: "Your TeamRetro password for basic authentication",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "TEAMRETRO_USERNAME",
        description: "Your TeamRetro username for basic authentication",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "TEAMRETRO_AUTH_TYPE",
        description: "Authentication type (apiKey, basic, or bearer)",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "agentmode-server",
    title: "AgentMode",
    description:
      "An all-in-one Model Context Protocol (MCP) server that connects your coding AI to numerous databases, data warehouses, data pipelines, and cloud services, streamlining development workflow through seamless integrations.",
    icon: "https://avatars.githubusercontent.com/agentmode",
    isOfficial: true,
    homepage: "https://github.com/agentmode/server",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["agentmode"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "ahonn-mcp-server-gsc",
    title: "Google Search Console MCP Server",
    description:
      "A server that provides access to Google Search Console data through the Model Context Protocol, allowing users to retrieve and analyze search analytics data with customizable dimensions and reporting periods.",
    icon: "https://avatars.githubusercontent.com/ahonn",
    isOfficial: false,
    homepage: "https://github.com/ahonn/mcp-server-gsc",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y mcp-server-gsc"],
      env: {
        GOOGLE_APPLICATION_CREDENTIALS: "<google-application-credentials>",
      },
    },
    parameters: [
      {
        name: "GOOGLE_APPLICATION_CREDENTIALS",
        description:
          "Path to the Google Service Account credentials JSON file with Search Console API access",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "ahujasid-ableton-mcp",
    title: "AbletonMCP",
    description:
      "Connects Ableton Live to Claude AI through the Model Context Protocol, enabling AI-assisted music production by allowing Claude to directly interact with and control Ableton Live sessions.",
    icon: "https://avatars.githubusercontent.com/ahujasid",
    isOfficial: false,
    homepage: "https://github.com/ahujasid/ableton-mcp",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["ableton-mcp"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "aindreyway-mcp-codex-keeper",
    title: "mcp-codex-keeper",
    description:
      "Serves as a guardian of development knowledge, providing AI assistants with curated access to latest documentation and best practices.",
    icon: "https://avatars.githubusercontent.com/aindreyway",
    isOfficial: false,
    homepage: "https://github.com/aindreyway/mcp-codex-keeper",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @aindreyway/mcp-codex-keeper"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "aindreyway-mcp-neurolora",
    title: "mcp-neurolora",
    description:
      "Provides tools for collecting and documenting code from directories.",
    icon: "https://avatars.githubusercontent.com/aindreyway",
    isOfficial: false,
    homepage: "https://github.com/aindreyway/mcp-neurolora",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @aindreyway/mcp-neurolora"],
      env: {
        NODE_OPTIONS: "<node-options>",
        OPENAI_API_KEY: "<openai-api-key>",
      },
    },
    parameters: [
      {
        name: "NODE_OPTIONS",
        description: "Node.js runtime options",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "OPENAI_API_KEY",
        description:
          "Your OpenAI API key needed for code analysis functionality",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "aipotheosis-labs-aci-mcp",
    title: "ACI MCP Server",
    description:
      "MCP server providing access to ACI.dev managed functions (tools) either directly from specific apps or through meta functions that dynamically discover and execute any available function based on user intent.",
    icon: "https://avatars.githubusercontent.com/aipotheosis-labs",
    isOfficial: false,
    homepage: "https://github.com/aipotheosis-labs/aci-mcp",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["aipolabs-mcp"],
      env: {
        ACI_API_KEY: "<aci-api-key>",
        LINKED_ACCOUNT_OWNER_ID: "<linked-account-owner-id>",
      },
    },
    parameters: [
      {
        name: "ACI_API_KEY",
        description: "The API key for your ACI.dev project",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "LINKED_ACCOUNT_OWNER_ID",
        description:
          "The ID of the account that you want to use to access the functions",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "ai-zerolab-mcp-email-server",
    title: "MCP Email Server",
    description:
      "Provides IMAP and SMTP capabilities, enabling developers to manage email services with seamless integration and automated workflows.",
    icon: "https://avatars.githubusercontent.com/ai-zerolab",
    isOfficial: false,
    homepage: "https://github.com/ai-zerolab/mcp-email-server",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp-email-server"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "ai-zerolab-mcp-toolbox",
    title: "MCP Toolbox",
    description:
      "A comprehensive toolkit that enhances LLM capabilities through the Model Context Protocol, allowing LLMs to interact with external services including command-line operations, file management, Figma integration, and audio processing.",
    icon: "https://avatars.githubusercontent.com/ai-zerolab",
    isOfficial: false,
    homepage: "https://github.com/ai-zerolab/mcp-toolbox",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp-toolbox"],
      env: {
        FIGMA_API_KEY: "<figma-api-key>",
      },
    },
    parameters: [
      {
        name: "FIGMA_API_KEY",
        description: "API key for Figma integration",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "alaturqua-mcp-trino-python",
    title: "MCP Trino Server",
    description:
      "A Model Context Protocol server that provides seamless integration with Trino and Iceberg, enabling data exploration, querying, and table maintenance through a standard interface.",
    icon: "https://avatars.githubusercontent.com/alaturqua",
    isOfficial: false,
    homepage: "https://github.com/alaturqua/mcp-trino-python",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp-trino-python"],
      env: {
        TRINO_AUTH: "<trino-auth>",
        TRINO_HOST: "<trino-host>",
        TRINO_PORT: "<trino-port>",
        TRINO_USER: "<trino-user>",
        TRINO_SCHEMA: "<trino-schema>",
        TRINO_CATALOG: "<trino-catalog>",
        TRINO_HTTP_SCHEME: "<trino-http-scheme>",
      },
    },
    parameters: [
      {
        name: "TRINO_AUTH",
        description: "Authentication method",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "TRINO_HOST",
        description: "Trino server hostname",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "TRINO_PORT",
        description: "Trino server port",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "TRINO_USER",
        description: "Trino username",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "TRINO_SCHEMA",
        description: "Default schema",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "TRINO_CATALOG",
        description: "Default catalog",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "TRINO_HTTP_SCHEME",
        description: "HTTP scheme (http/https)",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "alexbakers-mcp-ipfs",
    title: "mcp-ipfs",
    description:
      "🪐 MCP IPFS Server\n\nThis server empowers language models 🤖 and other MCP clients to manage storacha.network spaces, upload/download data, manage delegations, and perform various other tasks by seamlessly wrapping w3 commands.",
    icon: "https://avatars.githubusercontent.com/alexbakers",
    isOfficial: false,
    homepage: "https://github.com/alexbakers/mcp-ipfs",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y mcp-ipfs"],
      env: {
        W3_LOGIN_EMAIL: "<w3-login-email>",
      },
    },
    parameters: [
      {
        name: "W3_LOGIN_EMAIL",
        description:
          "The email address used for w3 login, must be the same as the one used for 'w3 login'",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "aliyun-alibabacloud-adb-mysql-mcp-server",
    title: "Adb MySQL MCP Server",
    description:
      "A universal interface that enables AI Agents to seamlessly communicate with Adb MySQL databases, allowing them to retrieve database metadata and execute SQL operations.",
    icon: "https://avatars.githubusercontent.com/aliyun",
    isOfficial: true,
    homepage: "https://github.com/aliyun/alibabacloud-adb-mysql-mcp-server",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["adb-mysql-mcp-server"],
      env: {
        ADB_MYSQL_HOST: "<adb-mysql-host>",
        ADB_MYSQL_PORT: "<adb-mysql-port>",
        ADB_MYSQL_USER: "<adb-mysql-user>",
        ADB_MYSQL_DATABASE: "<adb-mysql-database>",
        ADB_MYSQL_PASSWORD: "<adb-mysql-password>",
      },
    },
    parameters: [
      {
        name: "ADB_MYSQL_HOST",
        description: "The Adb MySQL database host",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "ADB_MYSQL_PORT",
        description: "The Adb MySQL database port",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "ADB_MYSQL_USER",
        description: "The Adb MySQL database user",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "ADB_MYSQL_DATABASE",
        description: "The Adb MySQL database name",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "ADB_MYSQL_PASSWORD",
        description: "The Adb MySQL database password",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "amidabuddha-unichat-mcp-server",
    title: "Unichat MCP Server",
    description:
      "Send requests to OpenAI, MistralAI, Anthropic, xAI, or Google AI using MCP protocol via tool or predefined prompts. Vendor API key required",
    icon: "https://avatars.githubusercontent.com/amidabuddha",
    isOfficial: false,
    homepage: "https://github.com/amidabuddha/unichat-mcp-server",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["unichat-mcp-server"],
      env: {
        UNICHAT_MODEL: "<unichat-model>",
        UNICHAT_API_KEY: "<unichat-api-key>",
      },
    },
    parameters: [
      {
        name: "UNICHAT_MODEL",
        description: "The Unichat model to use (e.g., gpt-4o-mini)",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "UNICHAT_API_KEY",
        description:
          "Your API key for the selected model's provider (OpenAI, MistralAI, Anthropic, xAI, Google AI or DeepSeek)",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "amidabuddha-unichat-ts-mcp-server",
    title: "unichat-ts-mcp-server",
    description:
      "Send requests to OpenAI, MistralAI, Anthropic, xAI, or Google AI using MCP protocol via tool or predefined prompts. Vendor API key required.\n\nBoth STDIO and SSE transport mechanisms are supported via arguments.",
    icon: "https://avatars.githubusercontent.com/amidabuddha",
    isOfficial: false,
    homepage: "https://github.com/amidabuddha/unichat-ts-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y unichat-ts-mcp-server"],
      env: {
        UNICHAT_MODEL: "<unichat-model>",
        UNICHAT_API_KEY: "<unichat-api-key>",
      },
    },
    parameters: [
      {
        name: "UNICHAT_MODEL",
        description:
          "Your preferred model name to be used by the Unichat MCP Server.",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "UNICHAT_API_KEY",
        description:
          "Your vendor API key required to send requests to OpenAI, MistralAI, Anthropic, xAI, or Google AI.",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "anaisbetts-mcp-youtube",
    title: "YouTube MCP Server",
    description:
      "Uses yt-dlp to download subtitles from YouTube and connects it to claude.ai via Model Context Protocol.",
    icon: "https://avatars.githubusercontent.com/anaisbetts",
    isOfficial: false,
    homepage: "https://github.com/anaisbetts/mcp-youtube",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @anaisbetts/mcp-youtube"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "andybrandt-mcp-simple-arxiv",
    title: "mcp-simple-arxiv",
    description:
      "An MCP server that provides access to arXiv papers through their API.",
    icon: "https://avatars.githubusercontent.com/andybrandt",
    isOfficial: false,
    homepage: "https://github.com/andybrandt/mcp-simple-arxiv",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp-simple-arxiv"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "andybrandt-mcp-simple-openai-assistant",
    title: "MCP Simple OpenAI Assistant",
    description:
      "A simple MCP server for interacting with OpenAI assistants. This server allows other tools (like Claude Desktop) to create and interact with OpenAI assistants through the Model Context Protocol.",
    icon: "https://avatars.githubusercontent.com/andybrandt",
    isOfficial: false,
    homepage: "https://github.com/andybrandt/mcp-simple-openai-assistant",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp-simple-openai-assistant"],
      env: {
        OPENAI_API_KEY: "<openai-api-key>",
      },
    },
    parameters: [
      {
        name: "OPENAI_API_KEY",
        description: "Your OpenAI API key",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "andybrandt-mcp-simple-pubmed",
    title: "mcp-simple-pubmed",
    description:
      "An MCP server that provides access to PubMed articles through the Entrez API.",
    icon: "https://avatars.githubusercontent.com/andybrandt",
    isOfficial: false,
    homepage: "https://github.com/andybrandt/mcp-simple-pubmed",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp-simple-pubmed"],
      env: {
        PUBMED_EMAIL: "<pubmed-email>",
        PUBMED_API_KEY: "<pubmed-api-key>",
      },
    },
    parameters: [
      {
        name: "PUBMED_EMAIL",
        description: "Your email address (required by NCBI)",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "PUBMED_API_KEY",
        description:
          "Optional API key for higher rate limits (10 requests/second instead of 3 requests/second)",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "andybrandt-mcp-simple-timeserver",
    title: "MCP Simple Timeserver",
    description:
      "An MCP server that allows checking local time on the client machine or current UTC time from an NTP server",
    icon: "https://avatars.githubusercontent.com/andybrandt",
    isOfficial: false,
    homepage: "https://github.com/andybrandt/mcp-simple-timeserver",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp-simple-timeserver"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "angiejones-mcp-selenium",
    title: "MCP Selenium",
    description:
      "Enables browser automation using the Selenium WebDriver through MCP, supporting browser management, element location, and both basic and advanced user interactions.",
    icon: "https://avatars.githubusercontent.com/angiejones",
    isOfficial: false,
    homepage: "https://github.com/angiejones/mcp-selenium",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @angiejones/mcp-selenium"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "anirbanbasu-frankfurtermcp",
    title: "FrankfurterMCP",
    description:
      "A MCP server for the Frankfurter API for currency exchange rates.",
    icon: "https://avatars.githubusercontent.com/anirbanbasu",
    isOfficial: false,
    homepage: "https://github.com/anirbanbasu/frankfurtermcp",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["frankfurtermcp"],
      env: {
        SSL_CERT_DIR: "<ssl-cert-dir>",
        FAST_MCP_HOST: "<fast-mcp-host>",
        FAST_MCP_PORT: "<fast-mcp-port>",
        HTTPX_TIMEOUT: "<httpx-timeout>",
        SSL_CERT_FILE: "<ssl-cert-file>",
        HTTPX_VERIFY_SSL: "<httpx-verify-ssl>",
        FRANKFURTER_API_URL: "<frankfurter-api-url>",
        MCP_SERVER_TRANSPORT: "<mcp-server-transport>",
        MCP_SERVER_INCLUDE_METADATA_IN_RESPONSE:
          "<mcp-server-include-metadata-in-response>",
      },
    },
    parameters: [
      {
        name: "SSL_CERT_DIR",
        description:
          "Path to SSL certificate directory for self-signed certificates.",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "FAST_MCP_HOST",
        description:
          "This variable specifies which host the MCP server must bind to unless the server transport is set to stdio.",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "FAST_MCP_PORT",
        description:
          "This variable specifies which port the MCP server must listen on unless the server transport is set to stdio.",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "HTTPX_TIMEOUT",
        description:
          "The time for the underlying HTTP client to wait, in seconds, for a response.",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "SSL_CERT_FILE",
        description:
          "Path to SSL certificate file for self-signed certificates.",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "HTTPX_VERIFY_SSL",
        description:
          "This variable can be set to False to turn off SSL certificate verification. Setting this to False is advised against: instead, use the SSL_CERT_FILE and SSL_CERT_DIR variables.",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "FRANKFURTER_API_URL",
        description:
          "If you are self-hosting the Frankfurter API, you should change this to the API endpoint address of your deployment.",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MCP_SERVER_TRANSPORT",
        description:
          "The acceptable options are stdio, sse or streamable-http.",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MCP_SERVER_INCLUDE_METADATA_IN_RESPONSE",
        description:
          "An experimental feature to include additional metadata to the MCP type TextContent that wraps the response data from each tool call.",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "anpigon-mcp-server-obsidian-omnisearch",
    title: "Obsidian Omnisearch MCP Server",
    description:
      "Provides programmatic search functionality for Obsidian vaults through a REST API interface, allowing external applications to search through notes and retrieve absolute paths to matching documents.",
    icon: "https://avatars.githubusercontent.com/anpigon",
    isOfficial: false,
    homepage: "https://github.com/anpigon/mcp-server-obsidian-omnisearch",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp-server-obsidian-omnisearch"],
      env: {
        OBSIDIAN_VAULT_PATH: "<obsidian-vault-path>",
      },
    },
    parameters: [
      {
        name: "OBSIDIAN_VAULT_PATH",
        description: "Absolute path to your Obsidian vault",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "antvis-mcp-server-chart",
    title: "MCP Server Chart",
    description: "mcp-server-chart",
    icon: "https://avatars.githubusercontent.com/antvis",
    isOfficial: true,
    homepage: "https://github.com/antvis/mcp-server-chart",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @antv/mcp-server-chart"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "api7-apisix-mcp",
    title: "APISIX-MCP",
    description:
      "The APISIX Model Context Protocol (MCP) server bridges large language models (LLMs) with the APISIX Admin API.",
    icon: "https://avatars.githubusercontent.com/api7",
    isOfficial: false,
    homepage: "https://github.com/api7/apisix-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y apisix-mcp"],
      env: {
        APISIX_ADMIN_KEY: "<apisix-admin-key>",
        APISIX_SERVER_HOST: "<apisix-server-host>",
        APISIX_ADMIN_API_PORT: "<apisix-admin-api-port>",
        APISIX_ADMIN_API_PREFIX: "<apisix-admin-api-prefix>",
      },
    },
    parameters: [
      {
        name: "APISIX_ADMIN_KEY",
        description: "Admin API authentication key",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "APISIX_SERVER_HOST",
        description: "Host that have access to your APISIX server",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "APISIX_ADMIN_API_PORT",
        description: "Admin API port",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "APISIX_ADMIN_API_PREFIX",
        description: "Admin API prefix",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "apw124-logseq-mcp",
    title: "Logseq MCP Tools",
    description:
      "A Model Context Protocol server that enables AI agents to interact with local Logseq knowledge graphs, supporting operations like creating/editing pages and blocks, searching content, and managing journal entries.",
    icon: "https://avatars.githubusercontent.com/apw124",
    isOfficial: false,
    homepage: "https://github.com/apw124/logseq-mcp",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["logseq-mcp"],
      env: {
        LOGSEQ_TOKEN: "<logseq-token>",
        LOGSEQ_API_URL: "<logseq-api-url>",
      },
    },
    parameters: [
      {
        name: "LOGSEQ_TOKEN",
        description: "Your Logseq API token from the Advanced settings",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "LOGSEQ_API_URL",
        description: "The URL of the Logseq API",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "arabold-docs-mcp-server",
    title: "docs-mcp-server",
    description:
      "A Model Context Protocol (MCP) server that scrapes, indexes, and searches documentation for third-party software libraries and packages, supporting versioning and hybrid search.",
    icon: "https://avatars.githubusercontent.com/arabold",
    isOfficial: false,
    homepage: "https://github.com/arabold/docs-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @arabold/docs-mcp-server"],
      env: {
        OPENAI_API_KEY: "<openai-api-key>",
      },
    },
    parameters: [
      {
        name: "OPENAI_API_KEY",
        description: "Your OpenAI API key for generating vector embeddings",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "arjunkmrm-mcp-minecraft",
    title: "mcp-minecraft",
    description:
      "Allows AI models to observe and interact with the Minecraft world through a bot.",
    icon: "https://avatars.githubusercontent.com/arjunkmrm",
    isOfficial: false,
    homepage: "https://github.com/arjunkmrm/mcp-minecraft",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y mcp-minecraft"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "aashari-mcp-server-atlassian-confluence",
    title: "Atlassian Confluence MCP Server",
    description:
      "A Model Context Protocol server that enables AI assistants like Claude to access and search Atlassian Confluence content, allowing integration with your organization's knowledge base.",
    icon: "https://avatars.githubusercontent.com/aashari",
    isOfficial: false,
    homepage: "https://github.com/aashari/mcp-server-atlassian-confluence",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @aashari/mcp-server-atlassian-confluence"],
      env: {
        DEBUG: "<debug>",
        ATLASSIAN_API_TOKEN: "<atlassian-api-token>",
        ATLASSIAN_SITE_NAME: "<atlassian-site-name>",
        ATLASSIAN_USER_EMAIL: "<atlassian-user-email>",
      },
    },
    parameters: [
      {
        name: "DEBUG",
        description: "Enable debug logging",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "ATLASSIAN_API_TOKEN",
        description: "The API token created in your Atlassian account",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "ATLASSIAN_SITE_NAME",
        description:
          "Your Atlassian site name (e.g., for example.atlassian.net, enter example)",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "ATLASSIAN_USER_EMAIL",
        description: "Your Atlassian account email address",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "auto-browse-unbundle_openapi_mcp",
    title: "Unbundle OpenAPI Specs MCP",
    description: "Unbundle OpenAPI Specs MCP",
    icon: "https://avatars.githubusercontent.com/auto-browse",
    isOfficial: false,
    homepage: "https://github.com/auto-browse/unbundle_openapi_mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @auto-browse/unbundle-openapi-mcp"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "automation-ai-labs-mcp-wait",
    title: "MCP-Wait",
    description:
      "A simple MCP server that provides waiting functionality to pause until other tasks finish, with progress reporting and support for CLI or HTTP server with SSE.",
    icon: "https://avatars.githubusercontent.com/automation-ai-labs",
    isOfficial: false,
    homepage: "https://github.com/automation-ai-labs/mcp-wait",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @automation-ai-labs/mcp-wait"],
      env: {
        PORT: "<port>",
        TRANSPORT_TYPE: "<transport-type>",
      },
    },
    parameters: [
      {
        name: "PORT",
        description: "The port to use when running as an SSE server",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "TRANSPORT_TYPE",
        description: "The transport type for the MCP server (stdio or sse)",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "automcp-app-linkd-mcp",
    title: "Linkd MCP Server",
    description:
      "An unofficial Model Context Protocol server that enables programmatic access to LinkedIn data through tools like user search, company search, profile enrichment, and contact retrieval.",
    icon: "https://avatars.githubusercontent.com/automcp-app",
    isOfficial: false,
    homepage: "https://github.com/automcp-app/linkd-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y linkd-mcp"],
      env: {
        LINKD_API_KEY: "<linkd-api-key>",
      },
    },
    parameters: [
      {
        name: "LINKD_API_KEY",
        description: "Your Linkd API key",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "awesimon-elasticsearch-mcp",
    title: "Elasticsearch MCP Server",
    description:
      "Connects agents to Elasticsearch data using the Model Context Protocol, allowing natural language interaction with Elasticsearch indices through MCP Clients like Claude Desktop and Cursor.",
    icon: "https://avatars.githubusercontent.com/awesimon",
    isOfficial: false,
    homepage: "https://github.com/awesimon/elasticsearch-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @awesome-ai/elasticsearch-mcp"],
      env: {
        HOST: "<host>",
        API_KEY: "<api-key>",
        CA_CERT: "<ca-cert>",
        PASSWORD: "<password>",
        USERNAME: "<username>",
      },
    },
    parameters: [
      {
        name: "HOST",
        description: "Your Elasticsearch instance URL",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "API_KEY",
        description: "Elasticsearch API key for authentication",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "CA_CERT",
        description: "Path to custom CA certificate for Elasticsearch SSL/TLS",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "PASSWORD",
        description: "Elasticsearch password for basic authentication",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "USERNAME",
        description: "Elasticsearch username for basic authentication",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "awkoy-replicate-flux-mcp",
    title: "replicate-flux-mcp",
    description: "MCP for Replicate Flux Model. Generating images by prompts",
    icon: "https://avatars.githubusercontent.com/awkoy",
    isOfficial: false,
    homepage: "https://github.com/awkoy/replicate-flux-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y replicate-flux-mcp"],
      env: {
        REPLICATE_API_TOKEN: "<replicate-api-token>",
      },
    },
    parameters: [
      {
        name: "REPLICATE_API_TOKEN",
        description:
          "Your Replicate API token for accessing the Flux Schnell model",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "baranwang-mcp-trends-hub",
    title: "Trends Hub",
    description:
      "A MCP server that aggregates hot trends and rankings from various Chinese websites and platforms including Weibo, Zhihu, Bilibili, and more.",
    icon: "https://avatars.githubusercontent.com/baranwang",
    isOfficial: false,
    homepage: "https://github.com/baranwang/mcp-trends-hub",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y mcp-trends-hub"],
      env: {
        TRENDS_HUB_HIDDEN_FIELDS: "<trends-hub-hidden-fields>",
        TRENDS_HUB_CUSTOM_RSS_URL: "<trends-hub-custom-rss-url>",
      },
    },
    parameters: [
      {
        name: "TRENDS_HUB_HIDDEN_FIELDS",
        description:
          "Controls which fields are hidden in the returned data. Format: field-name or tool-name:field-name, multiple values separated by commas (e.g., 'cover,get-nytimes-news:description')",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "TRENDS_HUB_CUSTOM_RSS_URL",
        description:
          "URL for a custom RSS feed to be added as a 'custom-rss' tool",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "bigcodegen-mcp-neovim-server",
    title: "mcp-neovim-server",
    description:
      "Leverages Vim's native text editing commands and workflows, which Claude already understands, to create a lightweight code assistance layer.",
    icon: "https://avatars.githubusercontent.com/bigcodegen",
    isOfficial: false,
    homepage: "https://github.com/bigcodegen/mcp-neovim-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y mcp-neovim-server"],
      env: {
        ALLOW_SHELL_COMMANDS: "<allow-shell-commands>",
      },
    },
    parameters: [
      {
        name: "ALLOW_SHELL_COMMANDS",
        description:
          "Set to 'true' to enable shell command execution (e.g. `!ls`). Defaults to false for security.",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "binalyze-air-mcp",
    title: "Binalyze AIR MCP Server",
    description:
      "A Node.js server implementing Model Context Protocol (MCP) that enables natural language interaction with Binalyze AIR's digital forensics and incident response capabilities.",
    icon: "https://avatars.githubusercontent.com/binalyze",
    isOfficial: true,
    homepage: "https://github.com/binalyze/air-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @binalyze/air-mcp"],
      env: {
        AIR_HOST: "<air-host>",
        AIR_API_TOKEN: "<air-api-token>",
      },
    },
    parameters: [
      {
        name: "AIR_HOST",
        description: "Your Binalyze AIR API host URL",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "AIR_API_TOKEN",
        description: "API token required for authentication with Binalyze AIR",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "bitrefill-bitrefill-mcp-server",
    title: "Bitrefill Search and Shop",
    description:
      "This MCP wraps Bitrefill public API to allow agents to search for products and shop using cryptocurrencies like Bitcoin, Ethereum, Solana, and many more.",
    icon: "https://avatars.githubusercontent.com/bitrefill",
    isOfficial: true,
    homepage: "https://github.com/bitrefill/bitrefill-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y bitrefill-mcp-server"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "blazickjp-arxiv-mcp-server",
    title: "ArXiv MCP Server",
    description:
      "The ArXiv MCP Server bridges the gap between AI models and academic research by providing a sophisticated interface to arXiv's extensive research repository. This server enables AI assistants to perform precise paper searches and access full paper content, enhancing their ability to engage with scientific literature.",
    icon: "https://avatars.githubusercontent.com/blazickjp",
    isOfficial: false,
    homepage: "https://github.com/blazickjp/arxiv-mcp-server",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["arxiv-mcp-server"],
      env: {
        ARXIV_STORAGE_PATH: "<arxiv-storage-path>",
      },
    },
    parameters: [
      {
        name: "ARXIV_STORAGE_PATH",
        description: "Paper storage location",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "blazickjp-web-browser-mcp-server",
    title: "web-browser-mcp-server",
    description: "Enables web browsing capabilities using BeautifulSoup4",
    icon: "https://avatars.githubusercontent.com/blazickjp",
    isOfficial: false,
    homepage: "https://github.com/blazickjp/web-browser-mcp-server",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["web-browser-mcp-server"],
      env: {
        REQUEST_TIMEOUT: "<request-timeout>",
      },
    },
    parameters: [
      {
        name: "REQUEST_TIMEOUT",
        description:
          "The request timeout period in seconds for the web-browser-mcp-server.",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "b-open-io-bsv-mcp",
    title: "Bitcoin SV MCP Server",
    description:
      "A collection of Bitcoin SV tools for the Model Context Protocol that enables AI assistants to interact with the BSV blockchain through wallet operations, ordinals (NFTs), and various blockchain utilities.",
    icon: "https://avatars.githubusercontent.com/b-open-io",
    isOfficial: false,
    homepage: "https://github.com/b-open-io/bsv-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y bsv-mcp"],
      env: {
        DISABLE_TOOLS: "<disable-tools>",
        DISABLE_PROMPTS: "<disable-prompts>",
        PRIVATE_KEY_WIF: "<private-key-wif>",
        IDENTITY_KEY_WIF: "<identity-key-wif>",
        DISABLE_BSV_TOOLS: "<disable-bsv-tools>",
        DISABLE_RESOURCES: "<disable-resources>",
        DISABLE_MNEE_TOOLS: "<disable-mnee-tools>",
        DISABLE_UTILS_TOOLS: "<disable-utils-tools>",
        DISABLE_BROADCASTING: "<disable-broadcasting>",
        DISABLE_WALLET_TOOLS: "<disable-wallet-tools>",
        DISABLE_ORDINALS_TOOLS: "<disable-ordinals-tools>",
      },
    },
    parameters: [
      {
        name: "DISABLE_TOOLS",
        description: "Set to true to disable all tools",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "DISABLE_PROMPTS",
        description: "Set to true to disable all educational prompts",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "PRIVATE_KEY_WIF",
        description:
          "Your private key in WIF format for Bitcoin wallet operations",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "IDENTITY_KEY_WIF",
        description:
          "Optional WIF for identity key; if set, ordinals inscriptions will be signed with sigma-protocol for authentication, curation, and web-of-trust",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "DISABLE_BSV_TOOLS",
        description: "Set to true to disable BSV blockchain tools",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "DISABLE_RESOURCES",
        description: "Set to true to disable all resources (BRCs, changelog)",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "DISABLE_MNEE_TOOLS",
        description: "Set to true to disable MNEE token tools",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "DISABLE_UTILS_TOOLS",
        description: "Set to true to disable utility tools",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "DISABLE_BROADCASTING",
        description:
          "Set to true to disable transaction broadcasting; returns raw transaction hex instead - useful for testing and transaction review before broadcasting",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "DISABLE_WALLET_TOOLS",
        description: "Set to true to disable Bitcoin wallet tools",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "DISABLE_ORDINALS_TOOLS",
        description: "Set to true to disable Ordinals/NFT tools",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "brightdata-brightdata-mcp",
    title: "Bright Data MCP",
    description:
      "Official Bright Data server for the Model Context Protocol that enables AI assistants like Claude Desktop to reference and make decisions based on real-time public web data.",
    icon: "https://avatars.githubusercontent.com/brightdata",
    isOfficial: true,
    homepage: "https://github.com/brightdata/brightdata-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @brightdata/mcp"],
      env: {
        API_TOKEN: "<api-token>",
        BROWSER_AUTH: "<browser-auth>",
        WEB_UNLOCKER_ZONE: "<web-unlocker-zone>",
      },
    },
    parameters: [
      {
        name: "API_TOKEN",
        description: "Your Bright Data API token from the user settings page",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "BROWSER_AUTH",
        description:
          "Optional authentication string for enabling remote browser control tools, formatted like: brd-customer-[your-customer-ID]-zone-[your-zone-ID]:[your-password]",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "WEB_UNLOCKER_ZONE",
        description: "Optional override for the default mcp_unlocker zone name",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "djyde-browser-mcp",
    title: "browser-mcp",
    description:
      "A MCP server that allows AI assistants to interact with the browser, including getting page content as markdown, modifying page styles, and searching browser history.",
    icon: "https://avatars.githubusercontent.com/djyde",
    isOfficial: false,
    homepage: "https://github.com/djyde/browser-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @djyde/browser-mcp"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "browserstack-mcp-server",
    title: "BrowserStack MCP server",
    description: "BrowserStack MCP server",
    icon: "https://avatars.githubusercontent.com/browserstack",
    isOfficial: true,
    homepage: "https://github.com/browserstack/mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @browserstack/mcp-server"],
      env: {
        BROWSERSTACK_USERNAME: "<browserstack-username>",
        BROWSERSTACK_ACCESS_KEY: "<browserstack-access-key>",
      },
    },
    parameters: [
      {
        name: "BROWSERSTACK_USERNAME",
        description: "Your BrowserStack username from Account Settings",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "BROWSERSTACK_ACCESS_KEY",
        description: "Your BrowserStack access key from Account Settings",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "bsmi021-mcp-chain-of-draft-server",
    title: "Chain of Draft Thinking",
    description:
      "Chain of Draft Server is a powerful AI-driven tool that helps developers make better decisions through systematic, iterative refinement of thoughts and designs. It integrates seamlessly with popular AI agents and provides a structured approach to reasoning, API design, architecture decisions, code r",
    icon: "https://avatars.githubusercontent.com/bsmi021",
    isOfficial: false,
    homepage: "https://github.com/bsmi021/mcp-chain-of-draft-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y mcp-chain-of-draft-server"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "btwiuse-npm-search-mcp-server",
    title: "npm-search-mcp-server",
    description: "MCP server for searching npm packages",
    icon: "https://avatars.githubusercontent.com/btwiuse",
    isOfficial: false,
    homepage: "https://github.com/btwiuse/npm-search-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y npm-search-mcp-server"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "buoooou-mcp-ui-gen",
    title: "SupaUI MCP Server",
    description:
      "A Model Context Protocol server that enables AI agents to generate, fetch, and manage UI components through natural language interactions.",
    icon: "https://avatars.githubusercontent.com/buoooou",
    isOfficial: false,
    homepage: "https://github.com/buoooou/mcp-ui-gen",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @buouui/supaui-mcp"],
      env: {
        BUOU_API_KEY: "<buou-api-key>",
      },
    },
    parameters: [
      {
        name: "BUOU_API_KEY",
        description: "Your API key from buouui.com",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "burakdirin-clickhouse-mcp-server",
    title: "clickhouse-mcp-server",
    description:
      "An MCP server implementation that enables Claude AI to interact with Clickhouse databases. Features include secure database connections, query execution, read-only mode support, and multi-query capabilities.",
    icon: "https://avatars.githubusercontent.com/burakdirin",
    isOfficial: false,
    homepage: "https://github.com/burakdirin/clickhouse-mcp-server",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["clickhouse-mcp-server"],
      env: {
        CLICKHOUSE_HOST: "<clickhouse-host>",
        CLICKHOUSE_USER: "<clickhouse-user>",
        CLICKHOUSE_DATABASE: "<clickhouse-database>",
        CLICKHOUSE_PASSWORD: "<clickhouse-password>",
        CLICKHOUSE_READONLY: "<clickhouse-readonly>",
      },
    },
    parameters: [
      {
        name: "CLICKHOUSE_HOST",
        description: "Clickhouse server address",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "CLICKHOUSE_USER",
        description: "Clickhouse username",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "CLICKHOUSE_DATABASE",
        description: "Initial database (optional)",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "CLICKHOUSE_PASSWORD",
        description: "Clickhouse password",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "CLICKHOUSE_READONLY",
        description: "Read-only mode (set to 1/true to enable)",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "burakdirin-mysqldb-mcp-server",
    title: "mysqldb-mcp-server",
    description:
      "An MCP server that enables MySQL database integration with Claude. You can execute SQL queries and manage database connections.",
    icon: "https://avatars.githubusercontent.com/burakdirin",
    isOfficial: false,
    homepage: "https://github.com/burakdirin/mysqldb-mcp-server",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mysqldb-mcp-server"],
      env: {
        MYSQL_HOST: "<mysql-host>",
        MYSQL_USER: "<mysql-user>",
        MYSQL_DATABASE: "<mysql-database>",
        MYSQL_PASSWORD: "<mysql-password>",
        MYSQL_READONLY: "<mysql-readonly>",
        UV_PUBLISH_TOKEN: "<uv-publish-token>",
        UV_PUBLISH_PASSWORD: "<uv-publish-password>",
        UV_PUBLISH_USERNAME: "<uv-publish-username>",
      },
    },
    parameters: [
      {
        name: "MYSQL_HOST",
        description: "MySQL server address",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "MYSQL_USER",
        description: "MySQL username",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "MYSQL_DATABASE",
        description: "Initial database (optional)",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MYSQL_PASSWORD",
        description: "MySQL password",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "MYSQL_READONLY",
        description: "Read-only mode (set to 1/true to enable)",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "UV_PUBLISH_TOKEN",
        description: "Token for publishing to PyPI",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "UV_PUBLISH_PASSWORD",
        description: "Password for publishing to PyPI",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "UV_PUBLISH_USERNAME",
        description: "Username for publishing to PyPI",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "burningion-video-editing-mcp",
    title: "video-editing-mcp",
    description:
      "Upload, edit, and generate videos from everyone's favorite LLM and Video Jungle.",
    icon: "https://avatars.githubusercontent.com/burningion",
    isOfficial: false,
    homepage: "https://github.com/burningion/video-editing-mcp",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["video-editor-mcp"],
      env: {
        YOURAPIKEY: "<yourapikey>",
        UV_PUBLISH_TOKEN: "<uv-publish-token>",
        UV_PUBLISH_PASSWORD: "<uv-publish-password>",
        UV_PUBLISH_USERNAME: "<uv-publish-username>",
      },
    },
    parameters: [
      {
        name: "YOURAPIKEY",
        description: "Your Video Jungle API key",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "UV_PUBLISH_TOKEN",
        description: "Token for publishing to PyPI",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "UV_PUBLISH_PASSWORD",
        description: "Password for publishing to PyPI",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "UV_PUBLISH_USERNAME",
        description: "Username for publishing to PyPI",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "smithery-ai-mcp-obsidian",
    title: "Obsidian",
    description:
      "This is a connector to allow Claude Desktop (or any MCP client) to read and search any directory containing Markdown notes (such as an Obsidian vault).",
    icon: "https://avatars.githubusercontent.com/smithery-ai",
    isOfficial: false,
    homepage: "https://github.com/smithery-ai/mcp-obsidian",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y mcp-obsidian"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "cdugo-package-documentation-mcp",
    title: "DocsFetcher MCP Server",
    description:
      "Fetches and extracts comprehensive package documentation from multiple programming language ecosystems (JavaScript, Python, Java, etc.) for LLMs like Claude without requiring API keys.",
    icon: "https://avatars.githubusercontent.com/cdugo",
    isOfficial: false,
    homepage: "https://github.com/cdugo/package-documentation-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @cdugo/docs-fetcher-mcp"],
      env: {
        PORT: "<port>",
      },
    },
    parameters: [
      {
        name: "PORT",
        description: "The port on which the server will run",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "characat0-databricks-mcp-server",
    title: "databricks-mcp-server",
    description: "databricks-mcp-server",
    icon: "https://avatars.githubusercontent.com/characat0",
    isOfficial: false,
    homepage: "https://github.com/characat0/databricks-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y databricks-mcp-server"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "chatmcp-heybeauty-mcp",
    title: "HeyBeauty MCP Server",
    description:
      "A TypeScript-based MCP server that implements virtual try-on capabilities using the HeyBeauty API, allowing users to visualize how clothes would look on them through Claude.",
    icon: "https://avatars.githubusercontent.com/chatmcp",
    isOfficial: false,
    homepage: "https://github.com/chatmcp/heybeauty-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y heybeauty-mcp"],
      env: {
        HEYBEAUTY_API_KEY: "<heybeauty-api-key>",
      },
    },
    parameters: [
      {
        name: "HEYBEAUTY_API_KEY",
        description: "Your HeyBeauty API key",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "chriscarrollsmith-taskqueue-mcp",
    title: "taskqueue-mcp",
    description:
      'MCP server for "taming the Claude" with structured task queues.',
    icon: "https://avatars.githubusercontent.com/chriscarrollsmith",
    isOfficial: false,
    homepage: "https://github.com/chriscarrollsmith/taskqueue-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y taskqueue-mcp"],
      env: {
        TASK_MANAGER_FILE_PATH: "<task-manager-file-path>",
      },
    },
    parameters: [
      {
        name: "TASK_MANAGER_FILE_PATH",
        description:
          "Custom path to the tasks.json file. If not provided, defaults to platform-specific locations (Linux: ~/.local/share/taskqueue-mcp/tasks.json, macOS: ~/Library/Application Support/taskqueue-mcp/tasks.json, Windows: %APPDATA%\\taskqueue-mcp\\tasks.json)",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "clay-inc-clay-mcp",
    title: "Clay",
    description:
      "A Model Context Protocol (MCP) server for Clay (https://clay.earth). Search your email, calendar, Twitter / X, Linkedin, iMessage, Facebook, and WhatsApp contacts. Take notes, set reminders, and more.",
    icon: "https://avatars.githubusercontent.com/clay-inc",
    isOfficial: true,
    homepage: "https://github.com/clay-inc/clay-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @clayhq/clay-mcp"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "codefriar-sf-mcp",
    title: "Salesforce CLI MCP Server",
    description:
      "Exposes Salesforce CLI functionality to LLM tools like Claude Desktop, allowing AI agents to execute Salesforce commands, manage orgs, deploy code, and query data through natural language.",
    icon: "https://avatars.githubusercontent.com/codefriar",
    isOfficial: false,
    homepage: "https://github.com/codefriar/sf-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y sf-mcp"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "coinpaprika-dexpaprika-mcp",
    title: "DexPaprika (CoinPaprika)",
    description:
      "DexPaprika MCP server allows LLMs to access real-time and historical data on tokens, DEX trading activity, and liquidity across multiple blockchains. It enables natural language queries for exploring market trends, token performance, and DeFi analytics through a standardized interface.",
    icon: "https://avatars.githubusercontent.com/coinpaprika",
    isOfficial: true,
    homepage: "https://github.com/coinpaprika/dexpaprika-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y dexpaprika-mcp"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "cristip73-mcp-server-asana",
    title: "MCP Server for Asana",
    description:
      "This server implementation allows AI assistants to interact with Asana's API, enabling users to manage tasks, projects, workspaces, and comments through natural language requests.",
    icon: "https://avatars.githubusercontent.com/cristip73",
    isOfficial: false,
    homepage: "https://github.com/cristip73/mcp-server-asana",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @cristip73/mcp-server-asana"],
      env: {
        ASANA_ACCESS_TOKEN: "<asana-access-token>",
        DEFAULT_WORKSPACE_ID: "<default-workspace-id>",
      },
    },
    parameters: [
      {
        name: "ASANA_ACCESS_TOKEN",
        description:
          "Your personal access token from the Asana developer console",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "DEFAULT_WORKSPACE_ID",
        description:
          "Optional default workspace ID to use for API calls that require a workspace",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "crystaldba-postgres-mcp",
    title: "Postgres MCP",
    description:
      "Postgres Pro is an open source Model Context Protocol (MCP) server built to support you and your AI agents throughout the entire development process—from initial coding, through testing and deployment, and to production tuning and maintenance.",
    icon: "https://avatars.githubusercontent.com/crystaldba",
    isOfficial: false,
    homepage: "https://github.com/crystaldba/postgres-mcp",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["postgres-mcp"],
      env: {
        DATABASE_URI: "<database-uri>",
      },
    },
    parameters: [
      {
        name: "DATABASE_URI",
        description: "The PostgreSQL database connection URI",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "cswkim-discogs-mcp-server",
    title: "Discogs MCP Server",
    description:
      "Enables interactions with the Discogs API for music catalog operations and search functionality, allowing users to manage their Discogs collections through natural language.",
    icon: "https://avatars.githubusercontent.com/cswkim",
    isOfficial: false,
    homepage: "https://github.com/cswkim/discogs-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y discogs-mcp-server"],
      env: {
        DISCOGS_PERSONAL_ACCESS_TOKEN: "<discogs-personal-access-token>",
      },
    },
    parameters: [
      {
        name: "DISCOGS_PERSONAL_ACCESS_TOKEN",
        description:
          "Your Discogs personal access token from your Discogs Settings > Developers page",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "cyanheads-filesystem-mcp-server",
    title: "Filesystem MCP Server",
    description:
      "A Model Context Protocol server that provides AI agents with secure access to local filesystem operations, enabling reading, writing, and managing files through a standardized interface.",
    icon: "https://avatars.githubusercontent.com/cyanheads",
    isOfficial: false,
    homepage: "https://github.com/cyanheads/filesystem-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @cyanheads/filesystem-mcp-server"],
      env: {
        LOG_DIR: "<log-dir>",
        LOG_LEVEL: "<log-level>",
        FS_BASE_DIRECTORY: "<fs-base-directory>",
      },
    },
    parameters: [
      {
        name: "LOG_DIR",
        description:
          "Specifies the directory where log files (combined.log, error.log) will be stored.",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "LOG_LEVEL",
        description:
          "Controls the verbosity of logs. Options: error, warn, info, http, verbose, debug, silly.",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "FS_BASE_DIRECTORY",
        description:
          "If set to an absolute path, all file operations performed by the server will be strictly confined within this directory and its subdirectories. This prevents the AI agent from accessing files outside the intended scope.",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "daisys-ai-daisys-mcp",
    title: "Daisys MCP Server",
    description:
      "A beta server that enables integration with Daisys.ai services via the Message Control Protocol (MCP), allowing AI clients like Claude Desktop and Cursor to use Daisys features through a standardized interface.",
    icon: "https://avatars.githubusercontent.com/daisys-ai",
    isOfficial: false,
    homepage: "https://github.com/daisys-ai/daisys-mcp",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["daisys-mcp"],
      env: {
        DAISYS_EMAIL: "<daisys-email>",
        DAISYS_PASSWORD: "<daisys-password>",
        DAISYS_BASE_STORAGE_PATH: "<daisys-base-storage-path>",
      },
    },
    parameters: [
      {
        name: "DAISYS_EMAIL",
        description: "Your Daisys account email",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "DAISYS_PASSWORD",
        description: "Your Daisys account password",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "DAISYS_BASE_STORAGE_PATH",
        description: "Path where you want to store your audio files",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "isdaniel-mcp_weather_server",
    title: "Weather MCP Server",
    description:
      "A Model Context Protocol server that retrieves current weather information for specified cities using the Open-Meteo API, requiring no API key.",
    icon: "https://avatars.githubusercontent.com/isdaniel",
    isOfficial: false,
    homepage: "https://github.com/isdaniel/mcp_weather_server",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp_weather_server"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "da-okazaki-mcp-neo4j-server",
    title: "MCP Neo4j Server",
    description:
      "This server enables interaction between Neo4j databases and Claude Desktop, allowing users to execute Cypher queries, create nodes, and establish relationships in the database.",
    icon: "https://avatars.githubusercontent.com/da-okazaki",
    isOfficial: false,
    homepage: "https://github.com/da-okazaki/mcp-neo4j-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @alanse/mcp-neo4j-server"],
      env: {
        NEO4J_URI: "<neo4j-uri>",
        NEO4J_PASSWORD: "<neo4j-password>",
        NEO4J_USERNAME: "<neo4j-username>",
      },
    },
    parameters: [
      {
        name: "NEO4J_URI",
        description: "Neo4j database URI",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "NEO4J_PASSWORD",
        description: "Neo4j password",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "NEO4J_USERNAME",
        description: "Neo4j username",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "its-dart-dart-mcp-server",
    title: "Dart MCP Server",
    description:
      "An official AI Model Context Protocol server that enables AI assistants to interact with Dart project management by creating/managing tasks and documents through prompts and tools.",
    icon: "https://avatars.githubusercontent.com/its-dart",
    isOfficial: false,
    homepage: "https://github.com/its-dart/dart-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y dart-mcp-server"],
      env: {
        DART_TOKEN: "<dart-token>",
      },
    },
    parameters: [
      {
        name: "DART_TOKEN",
        description: "Your Dart authentication token from your Dart profile",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "databutton-databutton-mcp",
    title: "Databutton MCP Server",
    description:
      "An MCP server for doing doing initial app planning and creating a good starting point in Databutton – it starts a new app and generates the initial MVP tasks",
    icon: "https://avatars.githubusercontent.com/databutton",
    isOfficial: true,
    homepage: "https://github.com/databutton/databutton-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y databutton"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "ai-1st-deepview-mcp",
    title: "DeepView MCP",
    description:
      "A Model Context Protocol server that enables IDEs like Cursor and Windsurf to analyze large codebases using Gemini's extensive context window.",
    icon: "https://avatars.githubusercontent.com/ai-1st",
    isOfficial: false,
    homepage: "https://github.com/ai-1st/deepview-mcp",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["deepview-mcp"],
      env: {
        GEMINI_API_KEY: "<gemini-api-key>",
      },
    },
    parameters: [
      {
        name: "GEMINI_API_KEY",
        description: "Your API key from Google AI Studio",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "delorenj-mcp-server-ticketmaster",
    title: "MCP Server for Ticketmaster Events",
    description:
      "Provides tools for discovering events at Madison Square Garden via the Ticketmaster API, returning structured data with event details like name, date, price, and ticket purchase links.",
    icon: "https://avatars.githubusercontent.com/delorenj",
    isOfficial: false,
    homepage: "https://github.com/delorenj/mcp-server-ticketmaster",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @delorenj/mcp-server-ticketmaster"],
      env: {
        TICKETMASTER_API_KEY: "<ticketmaster-api-key>",
      },
    },
    parameters: [
      {
        name: "TICKETMASTER_API_KEY",
        description:
          "Your Ticketmaster API key obtained from the Ticketmaster Developer portal",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "designcomputer-mysql_mcp_server",
    title: "MySQL MCP Server",
    description:
      "Allows AI assistants to list tables, read data, and execute SQL queries through a controlled interface, making database exploration and analysis safer and more structured.",
    icon: "https://avatars.githubusercontent.com/designcomputer",
    isOfficial: false,
    homepage: "https://github.com/designcomputer/mysql_mcp_server",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mysql-mcp-server"],
      env: {
        MYSQL_HOST: "<mysql-host>",
        MYSQL_PORT: "<mysql-port>",
        MYSQL_USER: "<mysql-user>",
        MYSQL_DATABASE: "<mysql-database>",
        MYSQL_PASSWORD: "<mysql-password>",
      },
    },
    parameters: [
      {
        name: "MYSQL_HOST",
        description: "Database host",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "MYSQL_PORT",
        description: "Database port (defaults to 3306 if not specified)",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MYSQL_USER",
        description: "MySQL username",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "MYSQL_DATABASE",
        description: "MySQL database name",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "MYSQL_PASSWORD",
        description: "MySQL password",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "docfork-docfork-mcp",
    title: "Docfork",
    description:
      "Provides up-to-date documentation for 9000+ libraries directly in your AI code editor, enabling accurate code suggestions and eliminating outdated information.",
    icon: "https://avatars.githubusercontent.com/docfork",
    isOfficial: false,
    homepage: "https://github.com/docfork/docfork-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y docfork"],
      env: {
        DEFAULT_MINIMUM_TOKENS: "<default-minimum-tokens>",
      },
    },
    parameters: [
      {
        name: "DEFAULT_MINIMUM_TOKENS",
        description: "Set the minimum token count for documentation retrieval",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "doggybee-mcp-server-ccxt",
    title: "CCXT MCP Server",
    description:
      "High-performance CCXT MCP server for cryptocurrency exchange integration",
    icon: "https://avatars.githubusercontent.com/doggybee",
    isOfficial: false,
    homepage: "https://github.com/doggybee/mcp-server-ccxt",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @mcpfun/mcp-server-ccxt"],
      env: {
        BINANCE_SECRET: "<binance-secret>",
        BINANCE_API_KEY: "<binance-api-key>",
        DEFAULT_EXCHANGE: "<default-exchange>",
      },
    },
    parameters: [
      {
        name: "BINANCE_SECRET",
        description: "Your Binance exchange API secret",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "BINANCE_API_KEY",
        description: "Your Binance exchange API key",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "DEFAULT_EXCHANGE",
        description: "The default exchange to use (optional)",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "domdomegg-airtable-mcp-server",
    title: "airtable-mcp-server",
    description:
      "A Model Context Protocol server that provides read and write access to Airtable databases. This server enables LLMs to inspect database schemas, then read and write records.",
    icon: "https://avatars.githubusercontent.com/domdomegg",
    isOfficial: false,
    homepage: "https://github.com/domdomegg/airtable-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y airtable-mcp-server"],
      env: {
        AIRTABLE_API_KEY: "<airtable-api-key>",
      },
    },
    parameters: [
      {
        name: "AIRTABLE_API_KEY",
        description: "",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "dpflucas-mysql-mcp-server",
    title: "MySQL Database Access",
    description:
      "An MCP server that provides read-only access to MySQL databases.",
    icon: "https://avatars.githubusercontent.com/dpflucas",
    isOfficial: false,
    homepage: "https://github.com/dpflucas/mysql-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y mysql-mcp-server"],
      env: {
        MYSQL_HOST: "<mysql-host>",
        MYSQL_PORT: "<mysql-port>",
        MYSQL_USER: "<mysql-user>",
        MYSQL_DATABASE: "<mysql-database>",
        MYSQL_PASSWORD: "<mysql-password>",
      },
    },
    parameters: [
      {
        name: "MYSQL_HOST",
        description: "Database server hostname",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "MYSQL_PORT",
        description: "Database server port",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MYSQL_USER",
        description: "Database username",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "MYSQL_DATABASE",
        description: "Default database name (optional)",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MYSQL_PASSWORD",
        description:
          "Database password (optional, but recommended for secure connections)",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "dryeab-mcp-telegram",
    title: "MCP Telegram",
    description: "MCP Server for Telegram",
    icon: "https://avatars.githubusercontent.com/dryeab",
    isOfficial: false,
    homepage: "https://github.com/dryeab/mcp-telegram",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp-telegram"],
      env: {
        API_ID: "<api-id>",
        API_HASH: "<api-hash>",
      },
    },
    parameters: [
      {
        name: "API_ID",
        description: "Your Telegram API ID obtained from my.telegram.org/apps",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "API_HASH",
        description:
          "Your Telegram API Hash obtained from my.telegram.org/apps",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "effytech-freshdesk_mcp",
    title: "Freshdesk MCP server",
    description:
      "Integrate AI models with Freshdesk to automate support operations. Create, update, and manage support tickets seamlessly through the Freshdesk API. Enhance your customer support experience with automated ticket management and AI-driven interactions.",
    icon: "https://avatars.githubusercontent.com/effytech",
    isOfficial: false,
    homepage: "https://github.com/effytech/freshdesk_mcp",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["freshdesk-mcp"],
      env: {
        FRESHDESK_DOMAIN: "<freshdesk-domain>",
        FRESHDESK_API_KEY: "<freshdesk-api-key>",
      },
    },
    parameters: [
      {
        name: "FRESHDESK_DOMAIN",
        description: "Your Freshdesk domain (e.g., yourcompany.freshdesk.com)",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "FRESHDESK_API_KEY",
        description: "Your Freshdesk API key from the Freshdesk admin panel",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "effytech-freshservice_mcp",
    title: "Freshservice MCP server",
    description: "Freshservice MCP server",
    icon: "https://avatars.githubusercontent.com/effytech",
    isOfficial: false,
    homepage: "https://github.com/effytech/freshservice_mcp",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["freshservice-mcp"],
      env: {
        FRESHSERVICE_APIKEY: "<freshservice-apikey>",
        FRESHSERVICE_DOMAIN: "<freshservice-domain>",
      },
    },
    parameters: [
      {
        name: "FRESHSERVICE_APIKEY",
        description:
          "Your Freshservice API key generated from the admin panel (Profile Settings → API Settings)",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "FRESHSERVICE_DOMAIN",
        description:
          "Your Freshservice domain (e.g., yourcompany.freshservice.com)",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "elevenlabs-elevenlabs-mcp",
    title: "ElevenLabs MCP Server",
    description:
      "An official Model Context Protocol (MCP) server that enables AI clients to interact with ElevenLabs' Text to Speech and audio processing APIs, allowing for speech generation, voice cloning, audio transcription, and other audio-related tasks.",
    icon: "https://cdn.simpleicons.org/elevenlabs",
    isOfficial: true,
    homepage: "https://github.com/elevenlabs/elevenlabs-mcp",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["elevenlabs-mcp"],
      env: {
        ELEVENLABS_API_KEY: "<elevenlabs-api-key>",
        ELEVENLABS_MCP_BASE_PATH: "<elevenlabs-mcp-base-path>",
      },
    },
    parameters: [
      {
        name: "ELEVENLABS_API_KEY",
        description:
          "Your ElevenLabs API key from elevenlabs.io/app/settings/api-keys",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "ELEVENLABS_MCP_BASE_PATH",
        description:
          "The base path MCP server should look for and output files specified with relative paths",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "emzimmer-server-wp-mcp",
    title: "WordPress MCP Server",
    description:
      "Enables AI assistants to interact with WordPress sites through the WordPress REST API. Supports multiple WordPress sites with secure authentication, enabling content management, post operations, and site configuration through natural language.",
    icon: "https://avatars.githubusercontent.com/emzimmer",
    isOfficial: false,
    homepage: "https://github.com/emzimmer/server-wp-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y server-wp-mcp"],
      env: {
        WP_SITES_PATH: "<wp-sites-path>",
      },
    },
    parameters: [
      {
        name: "WP_SITES_PATH",
        description:
          "The absolute path to the JSON configuration file containing your WordPress site details.",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "unctad-ai-eregulations-mcp-server",
    title: "eRegulations MCP Server",
    description:
      "A Model Context Protocol server implementation that provides structured, AI-friendly access to eRegulations data, making it easier for AI models to answer user questions about administrative procedures.",
    icon: "https://avatars.githubusercontent.com/unctad-ai",
    isOfficial: false,
    homepage: "https://github.com/unctad-ai/eregulations-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @unctad-ai/eregulations-mcp-server"],
      env: {
        EREGULATIONS_API_URL: "<eregulations-api-url>",
      },
    },
    parameters: [
      {
        name: "EREGULATIONS_API_URL",
        description:
          "URL of the eRegulations API to connect to (e.g., https://api-tanzania.tradeportal.org)",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "ergut-mcp-bigquery-server",
    title: "BigQuery MCP Server",
    description:
      "This is a server that lets your LLMs (like Claude) talk directly to your BigQuery data! Think of it as a friendly translator that sits between your AI assistant and your database, making sure they can chat securely and efficiently.",
    icon: "https://avatars.githubusercontent.com/ergut",
    isOfficial: false,
    homepage: "https://github.com/ergut/mcp-bigquery-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @ergut/mcp-bigquery-server"],
      env: {
        "key-file": "<key-file>",
        location: "<location>",
        "project-id": "<project-id>",
      },
    },
    parameters: [
      {
        name: "key-file",
        description: "Path to service account key JSON file",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "location",
        description: "BigQuery location",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "project-id",
        description: "Your Google Cloud project ID",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "erniebrodeur-mcp-grep",
    title: "MCP-Grep",
    description:
      "A server implementation that exposes grep functionality through the Model Context Protocol, allowing MCP-compatible clients to search for patterns in files using regular expressions.",
    icon: "https://avatars.githubusercontent.com/erniebrodeur",
    isOfficial: false,
    homepage: "https://github.com/erniebrodeur/mcp-grep",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp-grep"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "qianniuspace-mcp-security-audit",
    title: "MCP Security Audit Server",
    description:
      "Audits npm package dependencies for security vulnerabilities, providing detailed reports and fix recommendations with MCP integration.",
    icon: "https://avatars.githubusercontent.com/qianniuspace",
    isOfficial: false,
    homepage: "https://github.com/qianniuspace/mcp-security-audit",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y mcp-security-audit"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "evalstate-mcp-hfspace",
    title: "mcp-hfspace",
    description:
      "Use HuggingFace Spaces directly from Claude. Use Open Source Image Generation, Chat, Vision tasks and more. Supports Image, Audio and text uploads/downloads.",
    icon: "https://avatars.githubusercontent.com/evalstate",
    isOfficial: false,
    homepage: "https://github.com/evalstate/mcp-hfspace",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @llmindset/mcp-hfspace"],
      env: {
        HF_TOKEN: "<hf-token>",
        MCP_HF_WORK_DIR: "<mcp-hf-work-dir>",
        CLAUDE_DESKTOP_MODE: "<claude-desktop-mode>",
      },
    },
    parameters: [
      {
        name: "HF_TOKEN",
        description: "Your Hugging Face Token for accessing private spaces.",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MCP_HF_WORK_DIR",
        description:
          "Specifies the working directory for handling the upload and download of images and other file-based content.",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "CLAUDE_DESKTOP_MODE",
        description:
          "Disables Claude Desktop Mode, in which content is returned as an embedded Base64 encoded Resource.",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "executeautomation-mcp-playwright",
    title: "mcp-playwright",
    description:
      "A Model Context Protocol server that provides browser automation capabilities using Playwright. This server enables LLMs to interact with web pages, take screenshots, and execute JavaScript in a real browser environment.",
    icon: "https://avatars.githubusercontent.com/executeautomation",
    isOfficial: false,
    homepage: "https://github.com/executeautomation/mcp-playwright",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @executeautomation/playwright-mcp-server"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "eyaltoledano-claude-task-master",
    title: "Task Master",
    description:
      "A task management system for AI-driven development with Claude, designed to work seamlessly with Cursor AI and other code editors via MCP.",
    icon: "https://avatars.githubusercontent.com/eyaltoledano",
    isOfficial: false,
    homepage: "https://github.com/eyaltoledano/claude-task-master",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y task-master-ai"],
      env: {
        XAI_API_KEY: "<xai-api-key>",
        GOOGLE_API_KEY: "<google-api-key>",
        OLLAMA_API_KEY: "<ollama-api-key>",
        OPENAI_API_KEY: "<openai-api-key>",
        MISTRAL_API_KEY: "<mistral-api-key>",
        ANTHROPIC_API_KEY: "<anthropic-api-key>",
        OPENROUTER_API_KEY: "<openrouter-api-key>",
        PERPLEXITY_API_KEY: "<perplexity-api-key>",
        AZURE_OPENAI_API_KEY: "<azure-openai-api-key>",
      },
    },
    parameters: [
      {
        name: "XAI_API_KEY",
        description: "API key for xAI (for research or main model)",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "GOOGLE_API_KEY",
        description: "API key for Google Gemini models",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "OLLAMA_API_KEY",
        description: "API key for Ollama models",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "OPENAI_API_KEY",
        description: "API key for OpenAI models",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MISTRAL_API_KEY",
        description: "API key for Mistral models",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "ANTHROPIC_API_KEY",
        description: "API key for Anthropic Claude models",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "OPENROUTER_API_KEY",
        description: "API key for OpenRouter (for research or main model)",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "PERPLEXITY_API_KEY",
        description: "API key for Perplexity (for research model)",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "AZURE_OPENAI_API_KEY",
        description: "API key for Azure OpenAI models",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "f2c-ai-f2c-mcp",
    title: "f2c-mcp-server",
    description: "f2c-mcp-server",
    icon: "https://avatars.githubusercontent.com/f2c-ai",
    isOfficial: false,
    homepage: "https://github.com/f2c-ai/f2c-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @f2c/mcp"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "f4ww4z-mcp-mysql-server",
    title: "mcp-mysql-server",
    description:
      "This server enables AI models to interact with MySQL databases through a standardized interface.",
    icon: "https://avatars.githubusercontent.com/f4ww4z",
    isOfficial: false,
    homepage: "https://github.com/f4ww4z/mcp-mysql-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @f4ww4z/mcp-mysql-server"],
      env: {
        MYSQL_HOST: "<mysql-host>",
        MYSQL_USER: "<mysql-user>",
        MYSQL_DATABASE: "<mysql-database>",
        MYSQL_PASSWORD: "<mysql-password>",
      },
    },
    parameters: [
      {
        name: "MYSQL_HOST",
        description: "MySQL database host",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "MYSQL_USER",
        description: "MySQL database user",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "MYSQL_DATABASE",
        description: "MySQL database name",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "MYSQL_PASSWORD",
        description: "MySQL database password",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "fakepixels-base-mcp-server",
    title: "Base Network MCP Server",
    description:
      "An MCP server that enables LLMs to perform blockchain operations on the Base network through natural language commands, including wallet management, balance checking, and transaction execution.",
    icon: "https://avatars.githubusercontent.com/fakepixels",
    isOfficial: false,
    homepage: "https://github.com/fakepixels/base-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y base-network-mcp-server"],
      env: {
        BASE_PROVIDER_URL: "<base-provider-url>",
        DEFAULT_GAS_PRICE: "<default-gas-price>",
        WALLET_PRIVATE_KEY: "<wallet-private-key>",
      },
    },
    parameters: [
      {
        name: "BASE_PROVIDER_URL",
        description:
          "The URL of the Base network provider (Mainnet or Sepolia)",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "DEFAULT_GAS_PRICE",
        description: "Default gas price in Gwei",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "WALLET_PRIVATE_KEY",
        description:
          "Your wallet private key for authentication and transaction signing",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "fatwang2-search1api-mcp",
    title: "Search1API MCP Server",
    description:
      "A Model Context Protocol (MCP) server that provides search and crawl functionality using Search1API.",
    icon: "https://avatars.githubusercontent.com/fatwang2",
    isOfficial: false,
    homepage: "https://github.com/fatwang2/search1api-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y search1api-mcp"],
      env: {
        SEARCH1API_KEY: "<search1api-key>",
      },
    },
    parameters: [
      {
        name: "SEARCH1API_KEY",
        description:
          "Your API key from Search1API (https://www.search1api.com)",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "felores-placid-mcp-server",
    title: "Placid MCP Server",
    description:
      "A server for integrating with Placid.app's API, enabling listing templates and generating creatives using the Model Context Protocol with secure API token management.",
    icon: "https://avatars.githubusercontent.com/felores",
    isOfficial: false,
    homepage: "https://github.com/felores/placid-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @felores/placid-mcp-server"],
      env: {
        PLACID_API_TOKEN: "<placid-api-token>",
      },
    },
    parameters: [
      {
        name: "PLACID_API_TOKEN",
        description:
          "Your Placid.app API token obtained from your Placid.app account under Settings > API",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "fenxer-steam-review-mcp",
    title: "Steam Review MCP",
    description:
      "Enables LLMs to retrieve and analyze Steam game reviews, providing access to review statistics, game information, and helping summarize pros and cons of games.",
    icon: "https://avatars.githubusercontent.com/fenxer",
    isOfficial: false,
    homepage: "https://github.com/fenxer/steam-review-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y steam-review-mcp"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "ferrislucas-iterm-mcp",
    title: "iTerm MCP Server",
    description:
      "This MCP server enables users to execute shell commands in the current iTerm2 session through integration with Claude Desktop, facilitating seamless command execution via the Model Context Protocol.",
    icon: "https://avatars.githubusercontent.com/ferrislucas",
    isOfficial: false,
    homepage: "https://github.com/ferrislucas/iterm-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y iterm-mcp"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "feuerdev-keep-mcp",
    title: "Keep MCP",
    description:
      "Enables interaction with Google Keep notes through an MCP server, allowing users to search, create, update, and delete notes via natural language commands.",
    icon: "https://avatars.githubusercontent.com/feuerdev",
    isOfficial: false,
    homepage: "https://github.com/feuerdev/keep-mcp",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["keep-mcp"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "firstorderai-authenticator_mcp",
    title: "Authenticator App MCP Server",
    description:
      "A secure server that enables AI agents to access 2FA codes and passwords from the Authenticator App, allowing them to assist with automated login processes while maintaining security.",
    icon: "https://avatars.githubusercontent.com/firstorderai",
    isOfficial: false,
    homepage: "https://github.com/firstorderai/authenticator_mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y authenticator-mcp"],
      env: {
        AUTHENTICATOR_ACCESS_TOKEN: "<authenticator-access-token>",
      },
    },
    parameters: [
      {
        name: "AUTHENTICATOR_ACCESS_TOKEN",
        description:
          "Your Authenticator App access token generated from the desktop app",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "f-is-h-mcp-easy-copy",
    title: "MCP Easy Copy",
    description:
      "A Model Context Protocol server that automatically reads the Claude Desktop configuration file and presents all available MCP services in an easy-to-copy format at the top of the tools list.",
    icon: "https://avatars.githubusercontent.com/f-is-h",
    isOfficial: false,
    homepage: "https://github.com/f-is-h/mcp-easy-copy",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @fishes/mcp-easy-copy"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "fleagne-backlog-mcp-server",
    title: "Backlog MCP Server",
    description:
      "An MCP server implementation that integrates with Backlog API, enabling project management operations including issues, projects, and wikis through natural language interactions.",
    icon: "https://avatars.githubusercontent.com/fleagne",
    isOfficial: false,
    homepage: "https://github.com/fleagne/backlog-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y backlog-mcp-server"],
      env: {
        BACKLOG_API_KEY: "<backlog-api-key>",
        BACKLOG_BASE_URL: "<backlog-base-url>",
        BACKLOG_SPACE_ID: "<backlog-space-id>",
      },
    },
    parameters: [
      {
        name: "BACKLOG_API_KEY",
        description: "Your Backlog API key",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "BACKLOG_BASE_URL",
        description:
          "Your Backlog base URL (default: https://{your-space-id}.backlog.com/api/v2)",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "BACKLOG_SPACE_ID",
        description: "Your Backlog space ID",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "flutterninja9-better-fetch",
    title: "Better Fetch",
    description:
      "A Model Context Protocol server that intelligently fetches and processes web content, transforming websites and documentation into clean, structured markdown with nested URL crawling capabilities.",
    icon: "https://avatars.githubusercontent.com/flutterninja9",
    isOfficial: false,
    homepage: "https://github.com/flutterninja9/better-fetch",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y better-fetch-mcp"],
      env: {
        NODE_ENV: "<node-env>",
      },
    },
    parameters: [
      {
        name: "NODE_ENV",
        description: "Environment mode for the server",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "formulahendry-mcp-server-code-runner",
    title: "mcp-server-code-runner",
    description: "MCP Server for running code snippet and show the result.",
    icon: "https://avatars.githubusercontent.com/formulahendry",
    isOfficial: false,
    homepage: "https://github.com/formulahendry/mcp-server-code-runner",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y mcp-server-code-runner"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "fortunto2-prefect-mcp-server",
    title: "Prefect MCP Server",
    description:
      "A server that enables interacting with Prefect workflow automation tools through the Model Context Protocol, offering enhanced reliability through uvx running mechanism and seamless integration with Cursor IDE.",
    icon: "https://avatars.githubusercontent.com/fortunto2",
    isOfficial: false,
    homepage: "https://github.com/fortunto2/prefect-mcp-server",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["prefect-mcp-server"],
      env: {
        PREFECT_API_KEY: "<prefect-api-key>",
        PREFECT_API_URL: "<prefect-api-url>",
      },
    },
    parameters: [
      {
        name: "PREFECT_API_KEY",
        description:
          "API key to authenticate with your Prefect server or Prefect Cloud",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "PREFECT_API_URL",
        description: "The URL of the Prefect API server",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "g0t4-mcp-server-macos-defaults",
    title: "macOS Defaults MCP Server",
    description:
      "MCP server that enables reading and writing macOS system preferences and application settings through the defaults system.",
    icon: "https://avatars.githubusercontent.com/g0t4",
    isOfficial: false,
    homepage: "https://github.com/g0t4/mcp-server-macos-defaults",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp-server-macos-defaults"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "g0t4-mcp-server-commands",
    title: "mcp-server-commands",
    description: "An MCP server to run commands.",
    icon: "https://avatars.githubusercontent.com/g0t4",
    isOfficial: false,
    homepage: "https://github.com/g0t4/mcp-server-commands",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y mcp-server-commands"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "gannonh-firebase-mcp",
    title: "Firebase MCP",
    description:
      "The Firebase MCP server provides a standardized interface to interact with Firebase services, including Firebase Authentication, Firestore, and Firebase Storage.",
    icon: "https://avatars.githubusercontent.com/gannonh",
    isOfficial: false,
    homepage: "https://github.com/gannonh/firebase-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @gannonh/firebase-mcp"],
      env: {
        FIREBASE_STORAGE_BUCKET: "<firebase-storage-bucket>",
        SERVICE_ACCOUNT_KEY_PATH: "<service-account-key-path>",
      },
    },
    parameters: [
      {
        name: "FIREBASE_STORAGE_BUCKET",
        description:
          "Bucket name for Firebase Storage (defaults to [projectId].appspot.com if not provided)",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "SERVICE_ACCOUNT_KEY_PATH",
        description: "Path to your Firebase service account key JSON file",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "garylab-serper-mcp-server",
    title: "Serper MCP Server",
    description:
      "A Model Context Protocol server that enables LLMs to perform Google searches via the Serper API, allowing models to retrieve current information from the web.",
    icon: "https://avatars.githubusercontent.com/garylab",
    isOfficial: false,
    homepage: "https://github.com/garylab/serper-mcp-server",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["serper-mcp-server"],
      env: {
        SERPER_API_KEY: "<serper-api-key>",
      },
    },
    parameters: [
      {
        name: "SERPER_API_KEY",
        description: "Your Serper API key",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "genomoncology-biomcp",
    title: "BioMCP",
    description:
      "Provides LLMs with structured access to critical biomedical databases including PubTator3 (PubMed/PMC), ClinicalTrials.gov, and MyVariant.info through the Model Context Protocol.",
    icon: "https://avatars.githubusercontent.com/genomoncology",
    isOfficial: false,
    homepage: "https://github.com/genomoncology/biomcp",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["biomcp-python"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "gerred-mcpmc",
    title: "MCPMC (Minecraft MCP)",
    description:
      "Enables AI agents to control Minecraft bots through a standardized JSON-RPC interface.",
    icon: "https://avatars.githubusercontent.com/gerred",
    isOfficial: false,
    homepage: "https://github.com/gerred/mcpmc",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @gerred/mcpmc"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "gimjin-message-mcp",
    title: "message-mcp",
    description:
      "Real-time push notifications and alert sounds free you from staring at the screen. While the AI works, you can comfortably enjoy a cup of coffee.",
    icon: "https://avatars.githubusercontent.com/gimjin",
    isOfficial: false,
    homepage: "https://github.com/gimjin/message-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y message-mcp"],
      env: {
        SMTP_URL: "<smtp-url>",
        WEBHOOK_URL: "<webhook-url>",
      },
    },
    parameters: [
      {
        name: "SMTP_URL",
        description:
          "SMTP URL for email notifications (e.g., smtp://your-email@gmail.com:your-app-password@smtp.gmail.com:587)",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "WEBHOOK_URL",
        description: "URL endpoint for webhook notifications",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "gitmotion-ntfy-me-mcp",
    title: "ntfy-me-mcp",
    description:
      "A streamlined MCP server that enables AI assistants to send real-time notifications to your devices through the ntfy service, allowing you to receive alerts when tasks complete or important events occur.",
    icon: "https://avatars.githubusercontent.com/gitmotion",
    isOfficial: false,
    homepage: "https://github.com/gitmotion/ntfy-me-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y ntfy-me-mcp"],
      env: {
        NTFY_URL: "<ntfy-url>",
        NTFY_TOKEN: "<ntfy-token>",
        NTFY_TOPIC: "<ntfy-topic>",
        PROTECTED_TOPIC: "<protected-topic>",
      },
    },
    parameters: [
      {
        name: "NTFY_URL",
        description:
          "URL of the ntfy server (change to your self-hosted ntfy server URL if needed)",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "NTFY_TOKEN",
        description:
          "Access token for authentication with protected topics/servers",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "NTFY_TOPIC",
        description: "Your ntfy topic name for sending notifications",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "PROTECTED_TOPIC",
        description:
          "Set to 'true' if your topic requires authentication (helps prevent auth errors)",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "bsreeram08-git-commands-mcp",
    title: "Git Repo Browser MCP",
    description:
      "A Node.js implementation that enables browsing Git repositories through the Model Context Protocol, providing features like displaying directory structures, reading files, searching code, comparing branches, and viewing commit history.",
    icon: "https://avatars.githubusercontent.com/bsreeram08",
    isOfficial: false,
    homepage: "https://github.com/bsreeram08/git-commands-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y git-commands-mcp"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "modelcontextprotocol-servers-google-search-mcp",
    title: "Google Search MCP",
    description:
      "A Playwright-based tool that performs Google searches and extracts results while bypassing anti-bot mechanisms, providing real-time search capabilities for AI assistants.",
    icon: "https://avatars.githubusercontent.com/modelcontextprotocol-servers",
    isOfficial: false,
    homepage:
      "https://github.com/modelcontextprotocol-servers/google-search-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @mcp-server/google-search-mcp"],
      env: {
        limit: "<limit>",
        query: "<query>",
        region: "<region>",
        timeout: "<timeout>",
        language: "<language>",
      },
    },
    parameters: [
      {
        name: "limit",
        description: "Number of search results to return, default is 10",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "query",
        description: "Search query string",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "region",
        description:
          "Region for search results, e.g., cn, com, co.jp, default is cn",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "timeout",
        description:
          "Search operation timeout in milliseconds, default is 60000",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "language",
        description:
          "Language for search results, e.g., zh-CN, en-US, default is zh-CN",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "graphlit-graphlit-mcp-server",
    title: "Graphlit MCP Server",
    description:
      "The Model Context Protocol (MCP) Server enables integration between MCP clients and the Graphlit service.\n\nIngest anything from Slack to Gmail to podcast feeds, in addition to web crawling, into a Graphlit project - and then retrieve relevant contents from the MCP client.",
    icon: "https://avatars.githubusercontent.com/graphlit",
    isOfficial: true,
    homepage: "https://github.com/graphlit/graphlit-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y graphlit-mcp-server"],
      env: {
        JIRA_EMAIL: "<jira-email>",
        JIRA_TOKEN: "<jira-token>",
        LINEAR_API_KEY: "<linear-api-key>",
        NOTION_API_KEY: "<notion-api-key>",
        SLACK_BOT_TOKEN: "<slack-bot-token>",
        DISCORD_BOT_TOKEN: "<discord-bot-token>",
        NOTION_DATABASE_ID: "<notion-database-id>",
        GRAPHLIT_JWT_SECRET: "<graphlit-jwt-secret>",
        GOOGLE_EMAIL_CLIENT_ID: "<google-email-client-id>",
        GRAPHLIT_ENVIRONMENT_ID: "<graphlit-environment-id>",
        GRAPHLIT_ORGANIZATION_ID: "<graphlit-organization-id>",
        GOOGLE_EMAIL_CLIENT_SECRET: "<google-email-client-secret>",
        GOOGLE_EMAIL_REFRESH_TOKEN: "<google-email-refresh-token>",
        GITHUB_PERSONAL_ACCESS_TOKEN: "<github-personal-access-token>",
      },
    },
    parameters: [
      {
        name: "JIRA_EMAIL",
        description: "Your Jira email for Jira data connector integration",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "JIRA_TOKEN",
        description: "Your Jira token for Jira data connector integration",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "LINEAR_API_KEY",
        description:
          "Your Linear API key for Linear data connector integration",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "NOTION_API_KEY",
        description:
          "Your Notion API key for Notion data connector integration",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "SLACK_BOT_TOKEN",
        description:
          "Your Slack bot token for Slack data connector integration",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "DISCORD_BOT_TOKEN",
        description:
          "Your Discord bot token for Discord data connector integration",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "NOTION_DATABASE_ID",
        description:
          "Your Notion database ID for Notion data connector integration",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "GRAPHLIT_JWT_SECRET",
        description:
          "Your JWT secret for signing the JWT token found in the API settings dashboard",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "GOOGLE_EMAIL_CLIENT_ID",
        description:
          "Your Google client ID for Google Mail data connector integration",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "GRAPHLIT_ENVIRONMENT_ID",
        description:
          "Your Graphlit environment ID found in the API settings dashboard",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "GRAPHLIT_ORGANIZATION_ID",
        description:
          "Your Graphlit organization ID found in the API settings dashboard",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "GOOGLE_EMAIL_CLIENT_SECRET",
        description:
          "Your Google client secret for Google Mail data connector integration",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "GOOGLE_EMAIL_REFRESH_TOKEN",
        description:
          "Your Google refresh token for Google Mail data connector integration",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "GITHUB_PERSONAL_ACCESS_TOKEN",
        description:
          "Your GitHub personal access token for GitHub data connector integration",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "jorgeraad-mcp4gql",
    title: "mcp4gql",
    description:
      "GraphQL MCP Server that acts as a bridge allowing MCP clients (like Cursor or Claude Desktop) to interact with target GraphQL APIs through standard tools for schema introspection and operation execution.",
    icon: "https://avatars.githubusercontent.com/jorgeraad",
    isOfficial: false,
    homepage: "https://github.com/jorgeraad/mcp4gql",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y mcp4gql"],
      env: {
        AUTH_TOKEN: "<auth-token>",
        GRAPHQL_ENDPOINT: "<graphql-endpoint>",
      },
    },
    parameters: [
      {
        name: "AUTH_TOKEN",
        description:
          "A bearer token for an optional `Authorization: Bearer <token>` header for authenticating with the GraphQL API",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "GRAPHQL_ENDPOINT",
        description: "The URL of the target GraphQL API",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "greirson-mcp-todoist",
    title: "Todoist MCP Server",
    description:
      "An MCP server that connects Claude with Todoist for complete task and project management through natural language.",
    icon: "https://avatars.githubusercontent.com/greirson",
    isOfficial: false,
    homepage: "https://github.com/greirson/mcp-todoist",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @greirson/mcp-todoist"],
      env: {
        TODOIST_API_TOKEN: "<todoist-api-token>",
      },
    },
    parameters: [
      {
        name: "TODOIST_API_TOKEN",
        description:
          "Your Todoist API token from Settings → Integrations → Developer section",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "growthbook-growthbook-mcp",
    title: "GrowthBook MCP Server",
    description: "GrowthBook MCP Server",
    icon: "https://avatars.githubusercontent.com/growthbook",
    isOfficial: true,
    homepage: "https://github.com/growthbook/growthbook-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @growthbook/mcp"],
      env: {
        GB_USER: "<gb-user>",
        GB_API_KEY: "<gb-api-key>",
        GB_API_URL: "<gb-api-url>",
        GB_APP_ORIGIN: "<gb-app-origin>",
      },
    },
    parameters: [
      {
        name: "GB_USER",
        description: "Your name. Used when creating a feature flag.",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "GB_API_KEY",
        description: "A GrowthBook API key.",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "GB_API_URL",
        description: "Your GrowthBook API URL.",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "GB_APP_ORIGIN",
        description: "Your GrowthBook app URL.",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "haltakov-meme-mcp",
    title: "Meme MCP Server",
    description:
      "A simple Model Context Protocol server that allows AI models to generate meme images using the ImgFlip API, enabling users to create memes from text prompts.",
    icon: "https://avatars.githubusercontent.com/haltakov",
    isOfficial: false,
    homepage: "https://github.com/haltakov/meme-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y meme-mcp"],
      env: {
        IMGFLIP_PASSWORD: "<imgflip-password>",
        IMGFLIP_USERNAME: "<imgflip-username>",
      },
    },
    parameters: [
      {
        name: "IMGFLIP_PASSWORD",
        description: "Your ImgFlip account password",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "IMGFLIP_USERNAME",
        description:
          "Your ImgFlip account username (create a free account on ImgFlip)",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "hannesj-mcp-graphql-schema",
    title: "mcp-graphql-schema",
    description:
      "A MCP server that exposes GraphQL schema information to LLMs like Claude. This server allows an LLM to explore and understand large GraphQL schemas through a set of specialized tools, without needing to load the whole schema into the context",
    icon: "https://avatars.githubusercontent.com/hannesj",
    isOfficial: false,
    homepage: "https://github.com/hannesj/mcp-graphql-schema",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y mcp-graphql-schema"],
      env: {
        SCHEMA_PATH: "<schema-path>",
      },
    },
    parameters: [
      {
        name: "SCHEMA_PATH",
        description:
          "Path to the GraphQL schema file. If not provided, defaults to schema.graphqls in the current directory.",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "haris-musa-excel-mcp-server",
    title: "Excel MCP Server",
    description:
      "Provides Excel file manipulation capabilities. This server enables workbook creation, data manipulation, formatting, and advanced Excel features.",
    icon: "https://avatars.githubusercontent.com/haris-musa",
    isOfficial: false,
    homepage: "https://github.com/haris-musa/excel-mcp-server",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["excel-mcp-server"],
      env: {
        FASTMCP_PORT: "<fastmcp-port>",
        EXCEL_FILES_PATH: "<excel-files-path>",
      },
    },
    parameters: [
      {
        name: "FASTMCP_PORT",
        description: "Port the server listens on when using SSE transport",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "EXCEL_FILES_PATH",
        description:
          "Directory where Excel files are read from and written to when using SSE transport",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "heilgar-shadcn-ui-mcp-server",
    title: "Shadcn UI MCP Server",
    description:
      "A Model Control Protocol server that allows users to discover, install, and manage Shadcn UI components and blocks through natural language interactions in compatible AI tools.",
    icon: "https://avatars.githubusercontent.com/heilgar",
    isOfficial: false,
    homepage: "https://github.com/heilgar/shadcn-ui-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @heilgar/shadcn-ui-mcp-server"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "githejie-mcp-server-calculator",
    title: "Calculator MCP Server",
    description:
      "A Model Context Protocol server that enables LLMs to perform precise numerical calculations by evaluating mathematical expressions.",
    icon: "https://avatars.githubusercontent.com/githejie",
    isOfficial: false,
    homepage: "https://github.com/githejie/mcp-server-calculator",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp-server-calculator"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "horizondatawave-hdw-mcp-server",
    title: "HDW MCP Server",
    description:
      "A Model Context Protocol server that provides comprehensive access to LinkedIn data and functionality, enabling data retrieval and user account management through the HorizonDataWave API.",
    icon: "https://avatars.githubusercontent.com/horizondatawave",
    isOfficial: false,
    homepage: "https://github.com/horizondatawave/hdw-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @horizondatawave/mcp"],
      env: {
        HDW_ACCOUNT_ID: "<hdw-account-id>",
        HDW_ACCESS_TOKEN: "<hdw-access-token>",
      },
    },
    parameters: [
      {
        name: "HDW_ACCOUNT_ID",
        description:
          "Your HorizonDataWave account ID obtained from app.horizondatawave.ai",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "HDW_ACCESS_TOKEN",
        description:
          "Your HorizonDataWave API access token obtained from app.horizondatawave.ai",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "hyperbrowserai-mcp",
    title: "Hyperbrowser",
    description:
      "Welcome to Hyperbrowser, the Internet for AI. Hyperbrowser is the next-generation platform empowering AI agents and enabling effortless, scalable browser automation. Built specifically for AI developers, it eliminates the headaches of local infrastructure and performance bottlenecks, allowing you to",
    icon: "https://avatars.githubusercontent.com/hyperbrowserai",
    isOfficial: false,
    homepage: "https://github.com/hyperbrowserai/mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y hyperbrowser-mcp"],
      env: {
        HYPERBROWSER_API_KEY: "<hyperbrowser-api-key>",
      },
    },
    parameters: [
      {
        name: "HYPERBROWSER_API_KEY",
        description: "Your Hyperbrowser API key",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "iamjzx-dida",
    title: "Dida365 (TickTick) MCP Server",
    description:
      "Provides tools for AI assistants to interact with the Dida365 (TickTick) task management API, allowing management of tasks and projects after user authorization.",
    icon: "https://avatars.githubusercontent.com/iamjzx",
    isOfficial: false,
    homepage: "https://github.com/iamjzx/dida",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y my-mcp-server"],
      env: {
        CLIENT_ID: "<client-id>",
        SERVER_PORT: "<server-port>",
        CLIENT_SECRET: "<client-secret>",
      },
    },
    parameters: [
      {
        name: "CLIENT_ID",
        description:
          "Your Dida365 (TickTick) Client ID from the developer portal",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "SERVER_PORT",
        description: "The port on which the MCP server will run",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "CLIENT_SECRET",
        description:
          "Your Dida365 (TickTick) Client Secret from the developer portal",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "icraft2170-youtube-data-mcp-server",
    title: "YouTube MCP Server",
    description:
      "Enables AI language models to interact with YouTube content through a standardized interface, providing tools for retrieving video information, transcripts, channel analytics, and trend analysis.",
    icon: "https://avatars.githubusercontent.com/icraft2170",
    isOfficial: false,
    homepage: "https://github.com/icraft2170/youtube-data-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y youtube-data-mcp-server"],
      env: {
        YOUTUBE_API_KEY: "<youtube-api-key>",
        YOUTUBE_TRANSCRIPT_LANG: "<youtube-transcript-lang>",
      },
    },
    parameters: [
      {
        name: "YOUTUBE_API_KEY",
        description: "YouTube Data API key (required)",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "YOUTUBE_TRANSCRIPT_LANG",
        description: "Default caption language",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "idoru-influxdb-mcp-server",
    title: "InfluxDB MCP Server",
    description:
      "A Model Context Protocol server that provides Claude with access to InfluxDB time-series database instances, enabling data writing, querying, and management of organizations and buckets through natural language.",
    icon: "https://avatars.githubusercontent.com/idoru",
    isOfficial: false,
    homepage: "https://github.com/idoru/influxdb-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y influxdb-mcp-server"],
      env: {
        INFLUXDB_ORG: "<influxdb-org>",
        INFLUXDB_URL: "<influxdb-url>",
        INFLUXDB_TOKEN: "<influxdb-token>",
      },
    },
    parameters: [
      {
        name: "INFLUXDB_ORG",
        description: "Default organization name for certain operations",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "INFLUXDB_URL",
        description: "URL of the InfluxDB instance",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "INFLUXDB_TOKEN",
        description: "Authentication token for the InfluxDB API",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "inkdropapp-mcp-server",
    title: "Inkdrop MCP Server",
    description:
      "Integrates Inkdrop note-taking app with Claude AI through Model Context Protocol, allowing Claude to search, read, create, and update notes in your Inkdrop database.",
    icon: "https://avatars.githubusercontent.com/inkdropapp",
    isOfficial: true,
    homepage: "https://github.com/inkdropapp/mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @inkdropapp/mcp-server"],
      env: {
        INKDROP_LOCAL_PASSWORD: "<inkdrop-local-password>",
        INKDROP_LOCAL_USERNAME: "<inkdrop-local-username>",
        INKDROP_LOCAL_SERVER_URL: "<inkdrop-local-server-url>",
      },
    },
    parameters: [
      {
        name: "INKDROP_LOCAL_PASSWORD",
        description: "Password for the Inkdrop Local HTTP Server",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "INKDROP_LOCAL_USERNAME",
        description: "Username for the Inkdrop Local HTTP Server",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "INKDROP_LOCAL_SERVER_URL",
        description: "URL for the Inkdrop Local HTTP Server",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "isaacwasserman-mcp-snowflake-server",
    title: "mcp-snowflake-server",
    description:
      "Snowflake integration implementing read and (optional) write operations as well as insight tracking",
    icon: "https://avatars.githubusercontent.com/isaacwasserman",
    isOfficial: false,
    homepage: "https://github.com/isaacwasserman/mcp-snowflake-server",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp_snowflake_server"],
      env: {
        SNOWFLAKE_ROLE: "<snowflake-role>",
        SNOWFLAKE_USER: "<snowflake-user>",
        SNOWFLAKE_SCHEMA: "<snowflake-schema>",
        SNOWFLAKE_ACCOUNT: "<snowflake-account>",
        SNOWFLAKE_DATABASE: "<snowflake-database>",
        SNOWFLAKE_PASSWORD: "<snowflake-password>",
        SNOWFLAKE_WAREHOUSE: "<snowflake-warehouse>",
      },
    },
    parameters: [
      {
        name: "SNOWFLAKE_ROLE",
        description: "Your Snowflake role",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "SNOWFLAKE_USER",
        description: "Your Snowflake username",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "SNOWFLAKE_SCHEMA",
        description: "Your Snowflake schema",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "SNOWFLAKE_ACCOUNT",
        description: "Your Snowflake account identifier",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "SNOWFLAKE_DATABASE",
        description: "Your Snowflake database",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "SNOWFLAKE_PASSWORD",
        description: "Your Snowflake password",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "SNOWFLAKE_WAREHOUSE",
        description: "Your Snowflake warehouse",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "itseasy21-mcp-knowledge-graph",
    title: "Knowledge Graph Memory Server",
    description:
      "An implementation of persistent memory for Claude using a local knowledge graph, allowing the AI to remember information about users across conversations with customizable storage location.",
    icon: "https://avatars.githubusercontent.com/itseasy21",
    isOfficial: false,
    homepage: "https://github.com/itseasy21/mcp-knowledge-graph",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @itseasy21/mcp-knowledge-graph"],
      env: {
        MEMORY_FILE_PATH: "<memory-file-path>",
      },
    },
    parameters: [
      {
        name: "MEMORY_FILE_PATH",
        description: "Custom path for the memory file",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "ivo-toby-contentful-mcp",
    title: "contentful-mcp",
    description:
      "Update, create, delete content, content-models and assets in your Contentful Space",
    icon: "https://avatars.githubusercontent.com/ivo-toby",
    isOfficial: false,
    homepage: "https://github.com/ivo-toby/contentful-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @ivotoby/contentful-management-mcp-server"],
      env: {
        SPACE_ID: "<space-id>",
        ENVIRONMENT_ID: "<environment-id>",
        CONTENTFUL_HOST: "<contentful-host>",
        CONTENTFUL_MANAGEMENT_ACCESS_TOKEN:
          "<contentful-management-access-token>",
      },
    },
    parameters: [
      {
        name: "SPACE_ID",
        description:
          "Optional space ID to scope operations to a specific space",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "ENVIRONMENT_ID",
        description:
          "Optional environment ID to scope operations to a specific environment",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "CONTENTFUL_HOST",
        description: "Contentful Management API Endpoint",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "CONTENTFUL_MANAGEMENT_ACCESS_TOKEN",
        description: "Your Content Management API token",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "janwilmake-uithub-mcp",
    title: "UIThub MCP Server",
    description:
      "Model Context Protocol server that enables Claude to retrieve and analyze code from GitHub repositories through the uithub API.",
    icon: "https://avatars.githubusercontent.com/janwilmake",
    isOfficial: false,
    homepage: "https://github.com/janwilmake/uithub-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y uithub-mcp"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "thirdstrandstudio-mcp-figma",
    title: "mcp-figma",
    description: "Figma MCP with full API functionality",
    icon: "https://avatars.githubusercontent.com/thirdstrandstudio",
    isOfficial: false,
    homepage: "https://github.com/thirdstrandstudio/mcp-figma",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @jayarrowz/mcp-figma"],
      env: {
        FIGMA_API_KEY: "<figma-api-key>",
      },
    },
    parameters: [
      {
        name: "FIGMA_API_KEY",
        description: "Your Figma API key",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "thirdstrandstudio-mcp-xpath",
    title: "mcp-xpath",
    description: "MCP Server for executing XPath queries on XML content",
    icon: "https://avatars.githubusercontent.com/thirdstrandstudio",
    isOfficial: false,
    homepage: "https://github.com/thirdstrandstudio/mcp-xpath",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @jayarrowz/mcp-xpath"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "jbrower95-mcp-asset-gen",
    title: "MCP Asset Generator",
    description:
      "An MCP server that allows Claude to use OpenAI's image generation capabilities (gpt-image-1) to create image assets for users, which is particularly useful for game and web development projects.",
    icon: "https://avatars.githubusercontent.com/jbrower95",
    isOfficial: false,
    homepage: "https://github.com/jbrower95/mcp-asset-gen",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y mcp-asset-gen"],
      env: {
        API_KEY: "<api-key>",
      },
    },
    parameters: [
      {
        name: "API_KEY",
        description:
          "OpenAI API Key required for accessing the image generation service",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "jhgaylor-hirebase-mcp",
    title: "HireBase MCP Server",
    description:
      "Provides tools to interact with the HireBase Job API, enabling users to search for jobs using various criteria and retrieve detailed job information through natural language.",
    icon: "https://avatars.githubusercontent.com/jhgaylor",
    isOfficial: false,
    homepage: "https://github.com/jhgaylor/hirebase-mcp",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["hirebase-mcp"],
      env: {
        HIREBASE_API_KEY: "<hirebase-api-key>",
      },
    },
    parameters: [
      {
        name: "HIREBASE_API_KEY",
        description:
          "Your API key for accessing the HireBase API. The server needs this to make authenticated requests for job data.",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "jiayao-mcp-chess",
    title: "MCP Chess Server",
    description:
      "A server that enables users to play chess against any LLM, with features for visualizing the board, making moves in standard notation, and analyzing positions from PGN files.",
    icon: "https://avatars.githubusercontent.com/jiayao",
    isOfficial: false,
    homepage: "https://github.com/jiayao/mcp-chess",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp-chess"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "jinzcdev-leetcode-mcp-server",
    title: "LeetCode MCP Server",
    description:
      "A Model Context Protocol server that provides integration with LeetCode APIs, enabling automated interaction with programming problems, contests, solutions, and user data across both leetcode.com and leetcode.cn platforms.",
    icon: "https://avatars.githubusercontent.com/jinzcdev",
    isOfficial: false,
    homepage: "https://github.com/jinzcdev/leetcode-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @jinzcdev/leetcode-mcp-server"],
      env: {
        LEETCODE_SITE: "<leetcode-site>",
        LEETCODE_SESSION: "<leetcode-session>",
      },
    },
    parameters: [
      {
        name: "LEETCODE_SITE",
        description: "LeetCode API endpoint ('global' or 'cn')",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "LEETCODE_SESSION",
        description: "LeetCode session cookie for authenticated API access",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "jinzcdev-markmap-mcp-server",
    title: "Markmap MCP Server",
    description:
      "A Model Context Protocol server that converts Markdown text to interactive mind maps with support for rich interactive operations and multi-format exports.",
    icon: "https://avatars.githubusercontent.com/jinzcdev",
    isOfficial: false,
    homepage: "https://github.com/jinzcdev/markmap-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @jinzcdev/markmap-mcp-server"],
      env: {
        MARKMAP_DIR: "<markmap-dir>",
      },
    },
    parameters: [
      {
        name: "MARKMAP_DIR",
        description:
          "Specify the output directory for mind maps (optional, defaults to system temp directory)",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "jjikky-dynamo-readonly-mcp",
    title: "DynamoDB Read-Only MCP",
    description:
      "A server that enables LLMs like Claude to query AWS DynamoDB databases through natural language requests, supporting table management, data querying, and schema analysis.",
    icon: "https://avatars.githubusercontent.com/jjikky",
    isOfficial: false,
    homepage: "https://github.com/jjikky/dynamo-readonly-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y dynamo-readonly-mcp"],
      env: {
        AWS_REGION: "<aws-region>",
        AWS_ACCESS_KEY_ID: "<aws-access-key-id>",
        AWS_SECRET_ACCESS_KEY: "<aws-secret-access-key>",
      },
    },
    parameters: [
      {
        name: "AWS_REGION",
        description: "The AWS region of your DynamoDB tables",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "AWS_ACCESS_KEY_ID",
        description: "Your AWS access key for authentication",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "AWS_SECRET_ACCESS_KEY",
        description: "Your AWS secret access key for authentication",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "jkingsman-qanon-mcp-server",
    title: "https://github.com/jkingsman/qanon-mcp-server",
    description:
      "Enables search, exploration, and analysis of all QAnon posts for sociological study.",
    icon: "https://avatars.githubusercontent.com/jkingsman",
    isOfficial: false,
    homepage: "https://github.com/jkingsman/qanon-mcp-server",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["qanon_mcp"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "jlcases-paelladoc",
    title: "PAELLADOC",
    description:
      "A Model Context Protocol (MCP) server that implements AI-First Development framework principles, allowing LLMs to interact with context-first documentation tools and workflows for preserving knowledge and intent alongside code.",
    icon: "https://avatars.githubusercontent.com/jlcases",
    isOfficial: false,
    homepage: "https://github.com/jlcases/paelladoc",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["paelladoc"],
      env: {
        PAELLADOC_DB_PATH: "<paelladoc-db-path>",
      },
    },
    parameters: [
      {
        name: "PAELLADOC_DB_PATH",
        description: "Path where PAELLADOC will store its memory database",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "john-zhang-dev-xero-mcp",
    title: "Xero MCP Server",
    description:
      "An MCP server allowing Clients to interact with Xero Accounting Software",
    icon: "https://avatars.githubusercontent.com/john-zhang-dev",
    isOfficial: false,
    homepage: "https://github.com/john-zhang-dev/xero-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y xero-mcp"],
      env: {
        XERO_CLIENT_ID: "<xero-client-id>",
        XERO_REDIRECT_URI: "<xero-redirect-uri>",
        XERO_CLIENT_SECRET: "<xero-client-secret>",
      },
    },
    parameters: [
      {
        name: "XERO_CLIENT_ID",
        description: "Your Xero OAuth 2.0 app client ID",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "XERO_REDIRECT_URI",
        description: "The OAuth 2.0 redirect URI",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "XERO_CLIENT_SECRET",
        description: "Your Xero OAuth 2.0 app client secret",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "johnnyoshika-mcp-server-sqlite-npx",
    title: "MCP SQLite Server",
    description:
      "A Node.js implementation of the Model Context Protocol server using SQLite, providing a npx-based alternative for environments lacking Python's UVX runner.",
    icon: "https://avatars.githubusercontent.com/johnnyoshika",
    isOfficial: false,
    homepage: "https://github.com/johnnyoshika/mcp-server-sqlite-npx",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y mcp-server-sqlite-npx"],
      env: {
        PATH: "<path>",
        NODE_PATH: "<node-path>",
      },
    },
    parameters: [
      {
        name: "PATH",
        description:
          "The system PATH environment variable used for executable lookups.",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "NODE_PATH",
        description:
          "The NODE_PATH environment variable pointing to Node.js modules.",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "joshuayoes-ios-simulator-mcp",
    title: "iOS Simulator MCP",
    description:
      "Enables interaction with iOS simulators by providing tools to inspect UI elements, control UI interactions, and manage simulators through natural language commands.",
    icon: "https://avatars.githubusercontent.com/joshuayoes",
    isOfficial: false,
    homepage: "https://github.com/joshuayoes/ios-simulator-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y ios-simulator-mcp"],
      env: {
        IOS_SIMULATOR_MCP_FILTERED_TOOLS: "<ios-simulator-mcp-filtered-tools>",
      },
    },
    parameters: [
      {
        name: "IOS_SIMULATOR_MCP_FILTERED_TOOLS",
        description:
          "A comma-separated list of tool names to filter out from being registered. For example: screenshot,record_video,stop_recording",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "jsonallen-perplexity-mcp",
    title: "Perplexity MCP Server",
    description:
      "A server facilitating web search functionality by utilizing Perplexity AI's API, designed to integrate with the Claude desktop client for enhanced search queries.",
    icon: "https://avatars.githubusercontent.com/jsonallen",
    isOfficial: false,
    homepage: "https://github.com/jsonallen/perplexity-mcp",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["perplexity-mcp"],
      env: {
        PERPLEXITY_API_KEY: "<perplexity-api-key>",
      },
    },
    parameters: [
      {
        name: "PERPLEXITY_API_KEY",
        description: "Your Perplexity AI API key",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "juhemcp-jnews-mcp-server",
    title: "Juhe News MCP Server",
    description:
      "A Model Context Protocol server that enables large language models to access the latest trending news headlines and detailed content across various categories including recommended, domestic, technology, and sports news.",
    icon: "https://avatars.githubusercontent.com/juhemcp",
    isOfficial: true,
    homepage: "https://github.com/juhemcp/jnews-mcp-server",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["jnews-mcp-server"],
      env: {
        JUHE_NEWS_API_KEY: "<juhe-news-api-key>",
      },
    },
    parameters: [
      {
        name: "JUHE_NEWS_API_KEY",
        description:
          "聚合数据的新闻头条API密钥。获取：https://www.juhe.cn/docs/api/id/235",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "kaliaboi-mcp-zotero",
    title: "MCP Zotero",
    description: "Allows AI to interact with your Zotero library.",
    icon: "https://avatars.githubusercontent.com/kaliaboi",
    isOfficial: false,
    homepage: "https://github.com/kaliaboi/mcp-zotero",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y mcp-zotero"],
      env: {
        ZOTERO_API_KEY: "<zotero-api-key>",
        ZOTERO_USER_ID: "<zotero-user-id>",
      },
    },
    parameters: [
      {
        name: "ZOTERO_API_KEY",
        description:
          "Your Zotero API key created at https://www.zotero.org/settings/keys",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "ZOTERO_USER_ID",
        description: "Your Zotero user ID obtained from the API",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "kazuph-mcp-browser-tabs",
    title: "MCP Browser Tabs Server",
    description:
      "Enables interaction with Google Chrome tabs through the MCP protocol, allowing clients to retrieve information and control tabs on macOS using AppleScript.",
    icon: "https://avatars.githubusercontent.com/kazuph",
    isOfficial: false,
    homepage: "https://github.com/kazuph/mcp-browser-tabs",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @kazuph/mcp-browser-tabs"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "kazuph-mcp-fetch",
    title: "@kazuph/mcp-fetch",
    description:
      "Model Context Protocol server for fetching web content and processing images. This allows Claude Desktop (or any MCP client) to fetch web content and handle images appropriately.",
    icon: "https://avatars.githubusercontent.com/kazuph",
    isOfficial: false,
    homepage: "https://github.com/kazuph/mcp-fetch",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @kazuph/mcp-fetch"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "kazuph-mcp-github-pera1",
    title: "@kazuph/mcp-github-pera1",
    description:
      "A Model Context Protocol server that connects GitHub code to Claude.ai. This server utilizes the Pera1 service to extract code from GitHub repositories and provide better context to Claude.",
    icon: "https://avatars.githubusercontent.com/kazuph",
    isOfficial: false,
    homepage: "https://github.com/kazuph/mcp-github-pera1",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @kazuph/mcp-github-pera1"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "kazuph-mcp-taskmanager",
    title: "@kazuph/mcp-taskmanager",
    description:
      "Model Context Protocol server for Task Management. This allows Claude Desktop (or any MCP client) to manage and execute tasks in a queue-based system.",
    icon: "https://avatars.githubusercontent.com/kazuph",
    isOfficial: false,
    homepage: "https://github.com/kazuph/mcp-taskmanager",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @kazuph/mcp-taskmanager"],
      env: {
        PUBMED_EMAIL: "<pubmed-email>",
        PUBMED_API_KEY: "<pubmed-api-key>",
      },
    },
    parameters: [
      {
        name: "PUBMED_EMAIL",
        description: "Your email address (required by NCBI)",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "PUBMED_API_KEY",
        description: "Optional API key for higher rate limits",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "keegancsmith-linear-issues-mcp-server",
    title: "Linear Issues MCP Server",
    description:
      "An MCP server providing read-only access to Linear issues for language models, allowing them to fetch issue details and comments using a Linear API token.",
    icon: "https://avatars.githubusercontent.com/keegancsmith",
    isOfficial: false,
    homepage: "https://github.com/keegancsmith/linear-issues-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @keegancsmith/linear-issues-mcp-server"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "kiliczsh-mcp-mongo-server",
    title: "MongoDB",
    description:
      "A Model Context Protocol server that provides access to MongoDB databases. This server enables LLMs to inspect collection schemas and execute read-only queries.",
    icon: "https://avatars.githubusercontent.com/kiliczsh",
    isOfficial: false,
    homepage: "https://github.com/kiliczsh/mcp-mongo-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y mcp-mongo-server"],
      env: {
        MCP_MONGODB_URI: "<mcp-mongodb-uri>",
        MCP_MONGODB_READONLY: "<mcp-mongodb-readonly>",
      },
    },
    parameters: [
      {
        name: "MCP_MONGODB_URI",
        description: "MongoDB Connection URL",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "MCP_MONGODB_READONLY",
        description:
          "MongoDB Connection Read-Only mode. If read-only set to 'true'.",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "kimtaeyoon83-mcp-server-youtube-transcript",
    title: "mcp-server-youtube-transcript",
    description:
      "A Model Context Protocol server that enables retrieval of transcripts from YouTube videos. This server provides direct access to video captions and subtitles through a simple interface.",
    icon: "https://avatars.githubusercontent.com/kimtaeyoon83",
    isOfficial: false,
    homepage: "https://github.com/kimtaeyoon83/mcp-server-youtube-transcript",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @kimtaeyoon83/mcp-server-youtube-transcript"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "kingdomseed-structured-workflow-mcp",
    title: "Structured Workflow MCP",
    description:
      "Enforces disciplined programming practices by requiring AI assistants to audit their work and produce verified outputs at each phase of development, following structured workflows for refactoring, feature development, and testing.",
    icon: "https://avatars.githubusercontent.com/kingdomseed",
    isOfficial: false,
    homepage: "https://github.com/kingdomseed/structured-workflow-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y structured-workflow-mcp"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "kj455-mcp-kibela",
    title: "MCP Kibela",
    description:
      "A Model Context Protocol server that enables AI assistants to search and access information stored in Kibela, supporting note search, retrieval, creation and updating.",
    icon: "https://avatars.githubusercontent.com/kj455",
    isOfficial: false,
    homepage: "https://github.com/kj455/mcp-kibela",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @kj455/mcp-kibela"],
      env: {
        KIBELA_TEAM: "<kibela-team>",
        KIBELA_TOKEN: "<kibela-token>",
      },
    },
    parameters: [
      {
        name: "KIBELA_TEAM",
        description:
          "Your Kibela team name. You can find it from the URL of your Kibela team page. e.g. https://[team-name].kibe.la",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "KIBELA_TOKEN",
        description: "Your Kibela API token",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "k-jarzyna-mcp-miro",
    title: "Miro MCP",
    description:
      "Miro MCP server, exposing all functionalities available in official Miro SDK.",
    icon: "https://avatars.githubusercontent.com/k-jarzyna",
    isOfficial: false,
    homepage: "https://github.com/k-jarzyna/mcp-miro",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @k-jarzyna/mcp-miro"],
      env: {
        MIRO_ACCESS_TOKEN: "<miro-access-token>",
      },
    },
    parameters: [
      {
        name: "MIRO_ACCESS_TOKEN",
        description:
          "Your Miro access token with necessary permissions (boards:read, boards:write, identity:read, identity:write, team:read, team:write)",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "kmexnx-excel-to-pdf-mcp",
    title: "Excel to PDF Converter",
    description:
      "An MCP server that converts Excel and Apple Numbers files to PDF format, enabling AI assistants like Claude to perform file conversion directly through conversation.",
    icon: "https://avatars.githubusercontent.com/kmexnx",
    isOfficial: false,
    homepage: "https://github.com/kmexnx/excel-to-pdf-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y excel-to-pdf-mcp"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "kpsunil97-devrev-mcp-server",
    title: "DevRev MCP Server",
    description:
      "A Model Context Protocol server that enables searching and retrieving information from DevRev using its APIs with Claude.",
    icon: "https://avatars.githubusercontent.com/kpsunil97",
    isOfficial: false,
    homepage: "https://github.com/kpsunil97/devrev-mcp-server",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["devrev-mcp"],
      env: {
        DEVREV_API_KEY: "<devrev-api-key>",
      },
    },
    parameters: [
      {
        name: "DEVREV_API_KEY",
        description:
          "Your DevRev API key obtained from the DevRev developer portal",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "krzko-google-cloud-mcp",
    title: "Google Cloud MCP Server",
    description:
      "A Model Context Protocol server that connects to Google Cloud services, allowing users to query logs, interact with Spanner databases, and analyze Cloud Monitoring metrics through natural language interaction.",
    icon: "https://avatars.githubusercontent.com/krzko",
    isOfficial: false,
    homepage: "https://github.com/krzko/google-cloud-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y google-cloud-mcp"],
      env: {
        GOOGLE_PRIVATE_KEY: "<google-private-key>",
        GOOGLE_CLIENT_EMAIL: "<google-client-email>",
        GOOGLE_CLOUD_PROJECT: "<google-cloud-project>",
        GOOGLE_APPLICATION_CREDENTIALS: "<google-application-credentials>",
      },
    },
    parameters: [
      {
        name: "GOOGLE_PRIVATE_KEY",
        description: "Your Google Cloud service account private key (method 2)",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "GOOGLE_CLIENT_EMAIL",
        description: "Your Google Cloud service account email (method 2)",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "GOOGLE_CLOUD_PROJECT",
        description:
          "Your Google Cloud project ID (optional, will attempt to determine from credentials if not set)",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "GOOGLE_APPLICATION_CREDENTIALS",
        description:
          "Path to your Google Cloud service account key file (method 1)",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "ks0318-p-sound-notification-mcp",
    title: "Sound Notification MCP",
    description:
      "An MCP server that plays notification sounds when AI coding assistants like Windsurf or Cursor require user attention, such as when coding is complete or when user approval is needed.",
    icon: "https://avatars.githubusercontent.com/ks0318-p",
    isOfficial: false,
    homepage: "https://github.com/ks0318-p/sound-notification-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y sound-mcp"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "ktanaka101-mcp-server-duckdb",
    title: "mcp-server-duckdb",
    description:
      "A Model Context Protocol (MCP) server implementation for DuckDB, providing database interaction capabilities through MCP tools. It would be interesting to have LLM analyze it. DuckDB is suitable for local analysis.",
    icon: "https://avatars.githubusercontent.com/ktanaka101",
    isOfficial: false,
    homepage: "https://github.com/ktanaka101/mcp-server-duckdb",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp-server-duckdb"],
      env: {
        "db-path": "<db-path>",
      },
    },
    parameters: [
      {
        name: "db-path",
        description:
          "Path to the DuckDB database file. The server will automatically create the database file and parent directories if they don't exist.",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "kydycode-todoist-mcp-server-ext",
    title: "Enhanced Todoist MCP Server Extended",
    description:
      "A comprehensive MCP server that provides full integration between Claude and Todoist, enabling task, project, section, and label management through 24 different tools with the complete Todoist API.",
    icon: "https://avatars.githubusercontent.com/kydycode",
    isOfficial: false,
    homepage: "https://github.com/kydycode/todoist-mcp-server-ext",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @kydycode/todoist-mcp-server-ext"],
      env: {
        TODOIST_API_TOKEN: "<todoist-api-token>",
      },
    },
    parameters: [
      {
        name: "TODOIST_API_TOKEN",
        description:
          "Your Todoist API token from Settings → Integrations → Developer",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "landicefu-divide-and-conquer-mcp-server",
    title: "Divide and Conquer MCP Server",
    description:
      "Enables AI agents to break down complex tasks into manageable pieces using a structured JSON format with task tracking, context preservation, and progress monitoring capabilities.",
    icon: "https://avatars.githubusercontent.com/landicefu",
    isOfficial: false,
    homepage: "https://github.com/landicefu/divide-and-conquer-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @landicefu/divide-and-conquer-mcp-server"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "langchain-ai-mcpdoc",
    title: "MCP LLMS-TXT Documentation Server",
    description:
      "An MCP server that provides tools to load and fetch documentation from any llms.txt source, giving users full control over context retrieval for LLMs in IDE agents and applications.",
    icon: "https://avatars.githubusercontent.com/langchain-ai",
    isOfficial: false,
    homepage: "https://github.com/langchain-ai/mcpdoc",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcpdoc"],
      env: {
        host: "<host>",
        json: "<json>",
        port: "<port>",
        urls: "<urls>",
        yaml: "<yaml>",
        timeout: "<timeout>",
        transport: "<transport>",
        follow_redirects: "<follow-redirects>",
      },
    },
    parameters: [
      {
        name: "host",
        description:
          "Host to bind the server to when using non-stdio transport",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "json",
        description:
          "Path to a JSON config file containing documentation sources",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "port",
        description: "Port to run the server on when using non-stdio transport",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "urls",
        description:
          "URLs of llms.txt files to use, can be specified as plain URLs or with optional names using the format 'name:url'",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "yaml",
        description:
          "Path to a YAML config file containing documentation sources",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "timeout",
        description: "HTTP request timeout in seconds",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "transport",
        description: "Transport method to use (e.g., 'stdio', 'sse')",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "follow_redirects",
        description: "Follow HTTP redirects",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "leafeye-lunchmoney-mcp-server",
    title: "lunchmoney-mcp",
    description:
      "An MCP server that lets AI assistants interact with your Lunchmoney data, enabling natural language queries about transactions, budgets, and spending patterns.",
    icon: "https://avatars.githubusercontent.com/leafeye",
    isOfficial: false,
    homepage: "https://github.com/leafeye/lunchmoney-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y lunchmoney-mcp"],
      env: {
        LUNCHMONEY_TOKEN: "<lunchmoney-token>",
      },
    },
    parameters: [
      {
        name: "LUNCHMONEY_TOKEN",
        description:
          "Your Lunchmoney API token, which you can get from your Lunchmoney developer settings (https://my.lunchmoney.app/developers)",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "liorfranko-mcp-chain-of-thought",
    title: "mcp-chain-of-thought",
    description: "mcp-chain-of-thought",
    icon: "https://avatars.githubusercontent.com/liorfranko",
    isOfficial: false,
    homepage: "https://github.com/liorfranko/mcp-chain-of-thought",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y mcp-chain-of-thought"],
      env: {
        DATA_DIR: "<data-dir>",
        ENABLE_GUI: "<enable-gui>",
        TEMPLATES_USE: "<templates-use>",
        ENABLE_DETAILED_MODE: "<enable-detailed-mode>",
        ENABLE_THOUGHT_CHAIN: "<enable-thought-chain>",
      },
    },
    parameters: [
      {
        name: "DATA_DIR",
        description: "Directory for storing task data (absolute path required)",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "ENABLE_GUI",
        description: "Enables web interface",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "TEMPLATES_USE",
        description: "Template language",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "ENABLE_DETAILED_MODE",
        description: "Shows conversation history",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "ENABLE_THOUGHT_CHAIN",
        description: "Controls detailed thinking process",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "lumile-mercadolibre-mcp",
    title: "MercadoLibre MCP Server",
    description:
      "Enables interaction with MercadoLibre's API for product search, reviews, descriptions, and seller reputation insights.",
    icon: "https://avatars.githubusercontent.com/lumile",
    isOfficial: false,
    homepage: "https://github.com/lumile/mercadolibre-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y mercadolibre-mcp"],
      env: {
        SITE_ID: "<site-id>",
        CLIENT_ID: "<client-id>",
        CLIENT_SECRET: "<client-secret>",
      },
    },
    parameters: [
      {
        name: "SITE_ID",
        description:
          "The MercadoLibre site ID to use (MLA: Argentina, MLB: Brasil, MCO: Colombia, MEX: México, MLU: Uruguay, MLC: Chile)",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "CLIENT_ID",
        description:
          "Your MercadoLibre Client ID obtained from https://developers.mercadolibre.com/",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "CLIENT_SECRET",
        description:
          "Your MercadoLibre Client Secret obtained from https://developers.mercadolibre.com/",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "lupuletic-onyx-mcp-server",
    title: "onyx-mcp-server",
    description:
      "Connect your MCP-compatible clients to Onyx AI knowledge bases for enhanced semantic search and chat capabilities. Retrieve relevant context from your documents seamlessly, enabling powerful interactions and comprehensive answers. Streamline knowledge management and improve access to information acr",
    icon: "https://avatars.githubusercontent.com/lupuletic",
    isOfficial: false,
    homepage: "https://github.com/lupuletic/onyx-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y onyx-mcp-server"],
      env: {
        ONYX_API_URL: "<onyx-api-url>",
        ONYX_API_TOKEN: "<onyx-api-token>",
      },
    },
    parameters: [
      {
        name: "ONYX_API_URL",
        description: "The URL of your Onyx API instance",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "ONYX_API_TOKEN",
        description: "Your Onyx API token for authentication",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "mackenly-mcp-fathom-analytics",
    title: "MCP Fathom Analytics",
    description:
      "An unofficial server that allows AI assistants to access Fathom Analytics data, enabling users to retrieve account information, site statistics, events, aggregated reports, and real-time visitor tracking.",
    icon: "https://avatars.githubusercontent.com/mackenly",
    isOfficial: false,
    homepage: "https://github.com/mackenly/mcp-fathom-analytics",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y mcp-fathom-analytics"],
      env: {
        FATHOM_API_KEY: "<fathom-api-key>",
      },
    },
    parameters: [
      {
        name: "FATHOM_API_KEY",
        description: "Your Fathom Analytics API key",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "magarcia-mcp-server-giphy",
    title: "MCP Server Giphy",
    description:
      "Enables AI models to search, retrieve, and utilize GIFs from Giphy with features like content filtering, multiple search methods, and comprehensive metadata.",
    icon: "https://avatars.githubusercontent.com/magarcia",
    isOfficial: false,
    homepage: "https://github.com/magarcia/mcp-server-giphy",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y mcp-server-giphy"],
      env: {
        GIPHY_API_KEY: "<giphy-api-key>",
      },
    },
    parameters: [
      {
        name: "GIPHY_API_KEY",
        description:
          "Your Giphy API key obtained from the Giphy Developer dashboard",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "magicuidesign-mcp",
    title: "Magic UI MCP Server",
    description:
      "ModelContextProtocol server for Magic UI that allows AI assistants to easily implement UI components for web applications by providing code for components like marquees, animations, special effects, and interactive backgrounds.",
    icon: "https://avatars.githubusercontent.com/magicuidesign",
    isOfficial: false,
    homepage: "https://github.com/magicuidesign/mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @magicuidesign/mcp"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "mahdin75-gis-mcp",
    title: "GIS MCP Server",
    description:
      "A Model Context Protocol server that connects LLMs to GIS operations, enabling AI assistants to perform accurate geospatial analysis including geometric operations, coordinate transformations, and spatial measurements.",
    icon: "https://avatars.githubusercontent.com/mahdin75",
    isOfficial: false,
    homepage: "https://github.com/mahdin75/gis-mcp",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["gis-mcp"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "makeplane-plane-mcp-server",
    title: "Plane MCP Server",
    description:
      "A Model Context Protocol server that enables AI interfaces to seamlessly interact with Plane's project management system, allowing management of projects, issues, states, and other work items through a standardized API.",
    icon: "https://avatars.githubusercontent.com/makeplane",
    isOfficial: true,
    homepage: "https://github.com/makeplane/plane-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @makeplane/plane-mcp-server"],
      env: {
        PLANE_API_KEY: "<plane-api-key>",
        PLANE_API_HOST_URL: "<plane-api-host-url>",
        PLANE_WORKSPACE_SLUG: "<plane-workspace-slug>",
      },
    },
    parameters: [
      {
        name: "PLANE_API_KEY",
        description:
          "The user's API token. This can be obtained from the /settings/api-tokens/ page in the UI.",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "PLANE_API_HOST_URL",
        description:
          "The host URL of the Plane API Server. Defaults to https://api.plane.so/",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "PLANE_WORKSPACE_SLUG",
        description: "The workspace slug for your Plane instance.",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "mamertofabian-mcp-everything-search",
    title: "mcp-everything-search",
    description:
      "This server provides:\n\n* Fast file search capabilities using Everything SDK\n* Windows-specific implementation\n* Complements existing filesystem servers with specialized search functionality",
    icon: "https://avatars.githubusercontent.com/mamertofabian",
    isOfficial: false,
    homepage: "https://github.com/mamertofabian/mcp-everything-search",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp-server-everything-search"],
      env: {
        EVERYTHING_SDK_PATH: "<everything-sdk-path>",
      },
    },
    parameters: [
      {
        name: "EVERYTHING_SDK_PATH",
        description: "Path to the Everything SDK DLL (Everything64.dll).",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "marcoeg-mcp-server-ntopng",
    title: "mcp-ntopng",
    description: "MCP Server for networl monitoring software ntopng.",
    icon: "https://avatars.githubusercontent.com/marcoeg",
    isOfficial: false,
    homepage: "https://github.com/marcoeg/mcp-server-ntopng",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp-ntopng"],
      env: {
        NTOPNG_HOST: "<ntopng-host>",
        NTOPNG_DBPORT: "<ntopng-dbport>",
        NTOPNG_DBUSER: "<ntopng-dbuser>",
        NTOPNG_SECURE: "<ntopng-secure>",
        NTOPNG_VERIFY: "<ntopng-verify>",
        NTOPNG_API_KEY: "<ntopng-api-key>",
        NTOPNG_DBPASSWORD: "<ntopng-dbpassword>",
        NTOPNG_CONNECT_TIMEOUT: "<ntopng-connect-timeout>",
        SELECT_QUERY_TIMEOUT_SECS: "<select-query-timeout-secs>",
        NTOPNG_SEND_RECEIVE_TIMEOUT: "<ntopng-send-receive-timeout>",
      },
    },
    parameters: [
      {
        name: "NTOPNG_HOST",
        description: "The hostname of the ntopng server",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "NTOPNG_DBPORT",
        description:
          "The port number of the Clickhouse DB in the ntopng server (Default: 9000 if HTTPS is enabled, 8123 if disabled)",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "NTOPNG_DBUSER",
        description: "The username for Clickhouse DB authentication",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "NTOPNG_SECURE",
        description: "Enable/disable a TLS connection",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "NTOPNG_VERIFY",
        description: "Enable/disable SSL certificate verification",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "NTOPNG_API_KEY",
        description: "NTOPNG API key token",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "NTOPNG_DBPASSWORD",
        description: "The password for Clickhouse DB authentication",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "NTOPNG_CONNECT_TIMEOUT",
        description: "Connection timeout in seconds",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "SELECT_QUERY_TIMEOUT_SECS",
        description: "Timeout for select queries in seconds",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "NTOPNG_SEND_RECEIVE_TIMEOUT",
        description: "Send/receive timeout in seconds",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "marcopesani-mcp-server-serper",
    title: "serper-search-scrape-mcp-server",
    description:
      "This Serper MCP Server supports search and webpage scraping, and all the most recent parameters introduced by the Serper API, like location.",
    icon: "https://avatars.githubusercontent.com/marcopesani",
    isOfficial: false,
    homepage: "https://github.com/marcopesani/mcp-server-serper",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y serper-search-scrape-mcp-server"],
      env: {
        SERPER_API_KEY: "<serper-api-key>",
      },
    },
    parameters: [
      {
        name: "SERPER_API_KEY",
        description:
          "Your Serper API key for web search and content extraction",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "marcopesani-think-mcp-server",
    title: "think-mcp-server",
    description:
      "A minimal MCP Server that provides Claude AI models with the 'think' tool capability, enabling better performance on complex reasoning tasks by allowing the model to pause during response generation for additional thinking steps.",
    icon: "https://avatars.githubusercontent.com/marcopesani",
    isOfficial: false,
    homepage: "https://github.com/marcopesani/think-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y think-mcp-server"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "marcusbai-caiyun-weather-mcp",
    title: "Caiyun Weather MCP Server",
    description:
      "A Model Context Protocol server that provides comprehensive weather data querying capabilities based on the Caiyun Weather API, supporting real-time weather, forecasts, and alerts with multi-language support.",
    icon: "https://avatars.githubusercontent.com/marcusbai",
    isOfficial: false,
    homepage: "https://github.com/marcusbai/caiyun-weather-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y caiyun-weather-mcp"],
      env: {
        AMAP_API_KEY: "<amap-api-key>",
        CAIYUN_API_KEY: "<caiyun-api-key>",
      },
    },
    parameters: [
      {
        name: "AMAP_API_KEY",
        description:
          "Your Amap (Gaode Maps) API key (optional for address lookup functionality)",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "CAIYUN_API_KEY",
        description: "Your Caiyun Weather API key",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "mastergo-design-mastergo-magic-mcp",
    title: "MasterGo Magic MCP",
    description:
      "A standalone Model Context Protocol service that connects MasterGo design tools with AI models, enabling AI models to directly retrieve DSL data from MasterGo design files.",
    icon: "https://avatars.githubusercontent.com/mastergo-design",
    isOfficial: true,
    homepage: "https://github.com/mastergo-design/mastergo-magic-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @mastergo/magic-mcp"],
      env: {
        url: "<url>",
        MG_MCP_TOKEN: "<mg-mcp-token>",
      },
    },
    parameters: [
      {
        name: "url",
        description: "MasterGo URL",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MG_MCP_TOKEN",
        description:
          "MasterGo personal access token obtained from personal settings in Security Settings tab",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "mcollina-mcp-node-fetch",
    title: "MCP Node Fetch",
    description:
      "An MCP server that enables fetching web content using the Node.js undici library, supporting various HTTP methods, content formats, and request configurations.",
    icon: "https://avatars.githubusercontent.com/mcollina",
    isOfficial: false,
    homepage: "https://github.com/mcollina/mcp-node-fetch",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y mcp-node-fetch"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "mcollina-perm-shell-mcp",
    title: "PermShell MCP",
    description:
      "A Model Context Protocol server that allows LLMs to execute shell commands with explicit user permission through desktop notifications.",
    icon: "https://avatars.githubusercontent.com/mcollina",
    isOfficial: false,
    homepage: "https://github.com/mcollina/perm-shell-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y perm-shell-mcp"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "mcollina-mcp-ripgrep",
    title: "MCP Ripgrep Server",
    description:
      "Provides ripgrep search capabilities to MCP clients like Claude, allowing high-performance text searches across files on your system.",
    icon: "https://avatars.githubusercontent.com/mcollina",
    isOfficial: false,
    homepage: "https://github.com/mcollina/mcp-ripgrep",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y mcp-ripgrep"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "mcp2everything-mcp2serial",
    title: "MCP2Serial",
    description:
      "A bridge that connects physical hardware devices with AI large language models via serial communication, allowing users to control hardware using natural language commands.",
    icon: "https://avatars.githubusercontent.com/mcp2everything",
    isOfficial: false,
    homepage: "https://github.com/mcp2everything/mcp2serial",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp2serial"],
      env: {
        config: "<config>",
      },
    },
    parameters: [
      {
        name: "config",
        description:
          "Specifies the configuration file name to use (without the _config.yaml suffix)",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "mcpdotdirect-starknet-mcp-server",
    title: "Starknet MCP Server",
    description:
      "A comprehensive Model Context Protocol server that enables AI agents to interact with Starknet blockchain, query data, manage wallets, and work with smart contracts.",
    icon: "https://avatars.githubusercontent.com/mcpdotdirect",
    isOfficial: false,
    homepage: "https://github.com/mcpdotdirect/starknet-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @mcpdotdirect/starknet-mcp-server"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "mektigboy-server-hyperliquid",
    title: "Hyperliquid MCP Server",
    description:
      "An MCP server implementation that integrates with Hyperliquid exchange, providing access to crypto market data including mid prices, historical candles, and L2 order books.",
    icon: "https://avatars.githubusercontent.com/mektigboy",
    isOfficial: false,
    homepage: "https://github.com/mektigboy/server-hyperliquid",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @mektigboy/server-hyperliquid"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "melaodoidao-datagov-mcp-server",
    title: "Data.gov MCP Server",
    description:
      "An MCP server that provides access to government datasets from Data.gov, enabling users to search packages, view dataset details, list groups and tags, and access resources by URL.",
    icon: "https://avatars.githubusercontent.com/melaodoidao",
    isOfficial: false,
    homepage: "https://github.com/melaodoidao/datagov-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @melaodoidao/datagov-mcp-server"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "metatool-ai-mcp-server-metamcp",
    title: "MetaMCP MCP Server",
    description:
      "A proxy server that unifies multiple MCP servers, enabling seamless tool, prompt, and resource management via the MetaMCP App.",
    icon: "https://avatars.githubusercontent.com/metatool-ai",
    isOfficial: false,
    homepage: "https://github.com/metatool-ai/mcp-server-metamcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @metamcp/mcp-server-metamcp"],
      env: {
        METAMCP_API_KEY: "<metamcp-api-key>",
        METAMCP_API_BASE_URL: "<metamcp-api-base-url>",
      },
    },
    parameters: [
      {
        name: "METAMCP_API_KEY",
        description:
          'Required. Obtained from MetaMCP App\'s "API Keys" page (https://metamcp.com/api-keys).',
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "METAMCP_API_BASE_URL",
        description:
          "Optional override for MetaMCP App URL (e.g. http://localhost:12005).",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "mfukushim-map-traveler-mcp",
    title: "Map Traveler MCP",
    description:
      "An MCP server that creates a virtual traveling environment on Google Maps, allowing users to guide an avatar on journeys with photo reports and SNS integration.",
    icon: "https://avatars.githubusercontent.com/mfukushim",
    isOfficial: false,
    homepage: "https://github.com/mfukushim/map-traveler-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @mfukushim/map-traveler-mcp"],
      env: {
        MT_BS_ID: "<mt-bs-id>",
        MT_SD_KEY: "<mt-sd-key>",
        MT_BS_PASS: "<mt-bs-pass>",
        MT_NO_IMAGE: "<mt-no-image>",
        MT_BS_HANDLE: "<mt-bs-handle>",
        MT_COMFY_URL: "<mt-comfy-url>",
        MT_MOVE_MODE: "<mt-move-mode>",
        MT_PIXAI_KEY: "<mt-pixai-key>",
        MT_REMBG_URL: "<mt-rembg-url>",
        MT_REMBG_PATH: "<mt-rembg-path>",
        MT_TIME_SCALE: "<mt-time-scale>",
        MT_IMAGE_WIDTH: "<mt-image-width>",
        MT_MAP_API_URL: "<mt-map-api-url>",
        MT_SQLITE_PATH: "<mt-sqlite-path>",
        MT_COMFY_PARAMS: "<mt-comfy-params>",
        MT_FILTER_TOOLS: "<mt-filter-tools>",
        MT_BODY_HW_RATIO: "<mt-body-hw-ratio>",
        MT_GOOGLE_MAP_KEY: "<mt-google-map-key>",
        MT_PIXAI_MODEL_ID: "<mt-pixai-model-id>",
        MT_BODY_AREA_RATIO: "<mt-body-area-ratio>",
        MT_COMFY_WORKFLOW_I2I: "<mt-comfy-workflow-i2i>",
        MT_COMFY_WORKFLOW_T2I: "<mt-comfy-workflow-t2i>",
        MT_FIXED_MODEL_PROMPT: "<mt-fixed-model-prompt>",
        MT_BODY_WINDOW_RATIO_H: "<mt-body-window-ratio-h>",
        MT_BODY_WINDOW_RATIO_W: "<mt-body-window-ratio-w>",
      },
    },
    parameters: [
      {
        name: "MT_BS_ID",
        description: "Bluesky SNS registration address",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MT_SD_KEY",
        description: "Stability.ai image generation API key",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MT_BS_PASS",
        description: "Bluesky SNS password",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MT_NO_IMAGE",
        description:
          "Optional: true = do not output image, not specified = output image if possible",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MT_BS_HANDLE",
        description: "Bluesky SNS handle name: e.g. xxxxxxxx.bsky.social",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MT_COMFY_URL",
        description:
          "Optional: Generate image using ComfyUI API at specified URL. Example: http://192.168.1.100:8188",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MT_MOVE_MODE",
        description:
          "Optional: Specify whether the movement mode is realtime or skip. Default realtime",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MT_PIXAI_KEY",
        description: "pixAi API key",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MT_REMBG_URL",
        description: "rembg API URL",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MT_REMBG_PATH",
        description: "Absolute path of the installed rembg cli",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MT_TIME_SCALE",
        description:
          "Optional: Scale of travel time on real roads duration. Default is 4",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MT_IMAGE_WIDTH",
        description: "Optional: Output image width (pixels). Default is 512",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MT_MAP_API_URL",
        description:
          "Optional: Map API custom endpoint. Example: direction=https://xxxx,places=https://yyyy",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MT_SQLITE_PATH",
        description:
          "db save path: e.g. %USERPROFILE%/Desktop/traveler.sqlite, $HOME/traveler.sqlite",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MT_COMFY_PARAMS",
        description:
          "Optional: Variable values to send to the workflow via comfyUI API",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MT_FILTER_TOOLS",
        description:
          "Optional: Directly filter the tools to be used. All are available if not specified. e.g. tips,set_traveler_location",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MT_BODY_HW_RATIO",
        description:
          "Optional: Acceptable avatar image aspect ratios. Default 1.5~2.3",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MT_GOOGLE_MAP_KEY",
        description:
          "Google Map API key with permissions for Street View Static API, Places API, Time Zone API, and Directions API",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MT_PIXAI_MODEL_ID",
        description:
          "Optional: pixAi ModelId, if not set use default model 1648918127446573124",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MT_BODY_AREA_RATIO",
        description:
          "Optional: Acceptable avatar image area ratio. Default 0.042",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MT_COMFY_WORKFLOW_I2I",
        description:
          "Optional: Path of API workflow file when image to image in ComfyUI. If not specified: assets/comfy/i2i_sample.json",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MT_COMFY_WORKFLOW_T2I",
        description:
          "Optional: Path to API workflow file when using text to image with ComfyUI. If not specified: assets/comfy/t2i_sample.json",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MT_FIXED_MODEL_PROMPT",
        description:
          "Optional: Fixed avatar generation prompt. You will no longer be able to change your avatar during conversations.",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MT_BODY_WINDOW_RATIO_H",
        description:
          "Optional: Avatar composite window aspect ratio. Default 0.75",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MT_BODY_WINDOW_RATIO_W",
        description:
          "Optional: Avatar composite window horizontal ratio. Default 0.5",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "microsoft-clarity-mcp-server",
    title: "Clarity Data Export MCP Server",
    description:
      "A Model Context Protocol server that lets you fetch Microsoft Clarity analytics data through Claude for Desktop or other MCP-compatible clients, with support for filtering by dimensions and retrieving various metrics.",
    icon: "https://avatars.githubusercontent.com/microsoft",
    isOfficial: true,
    homepage: "https://github.com/microsoft/clarity-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @microsoft/clarity-mcp-server"],
      env: {
        clarity_api_token: "<clarity-api-token>",
      },
    },
    parameters: [
      {
        name: "clarity_api_token",
        description:
          "Your Microsoft Clarity API token used for authentication with the Clarity data export API",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "microsoft-playwright-mcp",
    title: "Playwright MCP Server",
    description:
      "A Model Context Protocol server that enables LLMs to interact with web pages through structured accessibility snapshots without requiring vision models or screenshots.",
    icon: "https://avatars.githubusercontent.com/microsoft",
    isOfficial: true,
    homepage: "https://github.com/microsoft/playwright-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @playwright/mcp"],
      env: {
        CAPS: "<caps>",
        PORT: "<port>",
        VISION: "<vision>",
        BROWSER: "<browser>",
        HEADLESS: "<headless>",
        CDP_ENDPOINT: "<cdp-endpoint>",
        USER_DATA_DIR: "<user-data-dir>",
        EXECUTABLE_PATH: "<executable-path>",
      },
    },
    parameters: [
      {
        name: "CAPS",
        description:
          "Comma-separated list of capabilities to enable, possible values: tabs, pdf, history, wait, files, install",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "PORT",
        description: "Port to listen on for SSE transport",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "VISION",
        description:
          "Run server that uses screenshots (Aria snapshots are used by default)",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "BROWSER",
        description:
          "Browser or chrome channel to use. Possible values: chrome, firefox, webkit, msedge, chrome-beta, chrome-canary, chrome-dev, msedge-beta, msedge-canary, msedge-dev",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "HEADLESS",
        description: "Run browser in headless mode (headed by default)",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "CDP_ENDPOINT",
        description: "CDP endpoint to connect to",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "USER_DATA_DIR",
        description: "Path to the user data directory",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "EXECUTABLE_PATH",
        description: "Path to the browser executable",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "mikechao-brave-search-mcp",
    title: "Brave Search MCP",
    description: "Brave Search MCP",
    icon: "https://avatars.githubusercontent.com/mikechao",
    isOfficial: false,
    homepage: "https://github.com/mikechao/brave-search-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y brave-search-mcp"],
      env: {
        BRAVE_API_KEY: "<brave-api-key>",
      },
    },
    parameters: [
      {
        name: "BRAVE_API_KEY",
        description:
          "Your Brave Search API key generated from the developer dashboard",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "misanthropic-ai-ddg-mcp",
    title: "DuckDuckGo MCP Server",
    description:
      "A server that provides DuckDuckGo search capabilities (text, image, news, video search and AI chat) through the Model Context Protocol.",
    icon: "https://avatars.githubusercontent.com/misanthropic-ai",
    isOfficial: false,
    homepage: "https://github.com/misanthropic-ai/ddg-mcp",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["ddg-mcp"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "misanthropic-ai-playwrite-mcp",
    title: "Playwright MCP",
    description:
      "Playwright wrapper for MCP that enables LLM-powered clients to control a browser for automation tasks.",
    icon: "https://avatars.githubusercontent.com/misanthropic-ai",
    isOfficial: false,
    homepage: "https://github.com/misanthropic-ai/playwrite-mcp",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["playwright-mcp"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "mk965-asset-price-mcp",
    title: "Asset Price MCP Server",
    description:
      "A server that provides tools for retrieving real-time price information for various assets including precious metals and cryptocurrencies, allowing language models to access and display current asset price data.",
    icon: "https://avatars.githubusercontent.com/mk965",
    isOfficial: false,
    homepage: "https://github.com/mk965/asset-price-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y asset-price-mcp"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "mobile-next-mobile-mcp",
    title: "Mobile Next MCP Server",
    description:
      "A Model Context Protocol server that enables scalable mobile automation through a platform-agnostic interface for iOS and Android devices, allowing agents and LLMs to interact with mobile applications using accessibility snapshots or coordinate-based interactions.",
    icon: "https://avatars.githubusercontent.com/mobile-next",
    isOfficial: true,
    homepage: "https://github.com/mobile-next/mobile-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @mobilenext/mobile-mcp"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "motherduckdb-mcp-server-motherduck",
    title: "mcp-server-motherduck",
    description: "An MCP server for MotherDuck and local DuckDB.",
    icon: "https://avatars.githubusercontent.com/motherduckdb",
    isOfficial: true,
    homepage: "https://github.com/motherduckdb/mcp-server-motherduck",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp-server-motherduck"],
      env: {
        HOME: "<home>",
        motherduck_token: "<motherduck-token>",
      },
    },
    parameters: [
      {
        name: "HOME",
        description: "Your home folder path (needed by DuckDB)",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "motherduck_token",
        description:
          "Your MotherDuck access token for authenticating to MotherDuck",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "mzxrai-mcp-openai",
    title: "MCP OpenAI Server",
    description:
      "A Model Context Protocol (MCP) server that lets you seamlessly use OpenAI's models right from Claude.",
    icon: "https://avatars.githubusercontent.com/mzxrai",
    isOfficial: false,
    homepage: "https://github.com/mzxrai/mcp-openai",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @mzxrai/mcp-openai"],
      env: {
        OPENAI_API_KEY: "<openai-api-key>",
      },
    },
    parameters: [
      {
        name: "OPENAI_API_KEY",
        description:
          "Your OpenAI API key (get one from https://platform.openai.com/api-keys)",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "mzxrai-mcp-webresearch",
    title: "MCP Web Research Server",
    description:
      "A Model Context Protocol (MCP) server for web research. Bring real-time info into Claude and easily research any topic.",
    icon: "https://avatars.githubusercontent.com/mzxrai",
    isOfficial: false,
    homepage: "https://github.com/mzxrai/mcp-webresearch",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @mzxrai/mcp-webresearch"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "nacal-mcp-minecraft-remote",
    title: "MCP Minecraft Remote",
    description:
      "Allows AI assistants to connect to and control Minecraft players on remote servers, enabling navigation, building, mining, inventory management, entity interaction, and chat communication through natural language commands.",
    icon: "https://avatars.githubusercontent.com/nacal",
    isOfficial: false,
    homepage: "https://github.com/nacal/mcp-minecraft-remote",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y mcp-minecraft-remote"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "ndchikin-reference-mcp",
    title: "cite-mcp",
    description:
      "Retrieve citation data effortlessly from CiteAs and Google Scholar. Get BibTeX-formatted citations for your resources with just a few commands. Enhance your research workflow by integrating citation retrieval directly into your applications.",
    icon: "https://avatars.githubusercontent.com/ndchikin",
    isOfficial: false,
    homepage: "https://github.com/ndchikin/reference-mcp",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["reference-mcp"],
      env: {
        UV_PUBLISH_TOKEN: "<uv-publish-token>",
        UV_PUBLISH_PASSWORD: "<uv-publish-password>",
        UV_PUBLISH_USERNAME: "<uv-publish-username>",
      },
    },
    parameters: [
      {
        name: "UV_PUBLISH_TOKEN",
        description: "Your PyPI token for publishing",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "UV_PUBLISH_PASSWORD",
        description: "Your PyPI password for publishing",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "UV_PUBLISH_USERNAME",
        description: "Your PyPI username for publishing",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "nickclyde-duckduckgo-mcp-server",
    title: "DuckDuckGo MCP Server",
    description:
      "A Model Context Protocol (MCP) server that provides web search capabilities through DuckDuckGo, with additional features for content fetching and parsing.",
    icon: "https://avatars.githubusercontent.com/nickclyde",
    isOfficial: false,
    homepage: "https://github.com/nickclyde/duckduckgo-mcp-server",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["duckduckgo-mcp-server"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "pipeboard-co-meta-ads-mcp",
    title: "Meta Ads MCP",
    description:
      "A Model Context Protocol server that allows AI models to access, analyze, and manage Meta advertising campaigns, enabling LLMs to retrieve performance data, visualize ad creatives, and provide strategic insights for Facebook and Instagram platforms.",
    icon: "https://avatars.githubusercontent.com/pipeboard-co",
    isOfficial: false,
    homepage: "https://github.com/pipeboard-co/meta-ads-mcp",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["meta-ads-mcp"],
      env: {
        META_APP_ID: "<meta-app-id>",
        PIPEBOARD_API_TOKEN: "<pipeboard-api-token>",
      },
    },
    parameters: [
      {
        name: "META_APP_ID",
        description: "Your Meta App ID (Client ID) - for direct OAuth method",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "PIPEBOARD_API_TOKEN",
        description:
          "Your Pipeboard API token for Meta Ads authentication. Token obtainable via https://pipeboard.co",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "nloui-paperless-mcp",
    title: "Paperless-NGX MCP Server",
    description:
      "Enables interaction with Paperless-NGX API servers, supporting document management, tagging, and metadata operations through a natural language interface.",
    icon: "https://avatars.githubusercontent.com/nloui",
    isOfficial: false,
    homepage: "https://github.com/nloui/paperless-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @nloui/paperless-mcp"],
      env: {
        PAPERLESS_URL: "<paperless-url>",
        PAPERLESS_API_TOKEN: "<paperless-api-token>",
      },
    },
    parameters: [
      {
        name: "PAPERLESS_URL",
        description:
          "URL to your Paperless-NGX instance (e.g., http://your-paperless-instance:8000)",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "PAPERLESS_API_TOKEN",
        description:
          "Your Paperless-NGX API token generated from the user profile",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "noahlozevski-mcp-idb",
    title: "MCP-IDB",
    description:
      "Integration between Model Context Protocol (MCP) and Facebook's iOS Development Bridge (idb), enabling automated iOS device management and test execution through natural language.",
    icon: "https://avatars.githubusercontent.com/noahlozevski",
    isOfficial: false,
    homepage: "https://github.com/noahlozevski/mcp-idb",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @noahlozevski/mcp-idb"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "normal-coder-gitee-mcp-server",
    title: "Gitee",
    description:
      "MCP Tool Server for Gitee, supporting the management of repository files/branches, Issues, and Pull Requests.",
    icon: "https://avatars.githubusercontent.com/normal-coder",
    isOfficial: false,
    homepage: "https://github.com/normal-coder/gitee-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y gitee-mcp-server"],
      env: {
        GITEE_API_BASE_URL: "<gitee-api-base-url>",
        GITEE_PERSONAL_ACCESS_TOKEN: "<gitee-personal-access-token>",
      },
    },
    parameters: [
      {
        name: "GITEE_API_BASE_URL",
        description: "Gitee OpenAPI Endpoint",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "GITEE_PERSONAL_ACCESS_TOKEN",
        description:
          "Gitee account personal access token (PAT), can be obtained from Gitee account settings Personal Access Tokens",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "novitalabs-novita-mcp-server",
    title: "Novita MCP Server",
    description:
      "An MCP server that enables seamless management of Novita AI platform resources, currently supporting GPU instance operations (list, create, start, stop, etc.) through compatible clients like Claude Desktop and Cursor.",
    icon: "https://avatars.githubusercontent.com/novitalabs",
    isOfficial: true,
    homepage: "https://github.com/novitalabs/novita-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @novitalabs/novita-mcp-server"],
      env: {
        NOVITA_API_KEY: "<novita-api-key>",
      },
    },
    parameters: [
      {
        name: "NOVITA_API_KEY",
        description: "Your Novita API key from the Novita AI Key Management",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "oxylabs-oxylabs-mcp",
    title: "Oxylabs MCP Server",
    description:
      "A scraper tool that leverages the Oxylabs Web Scraper API to fetch and process web content with flexible options for parsing and rendering pages, enabling efficient content extraction from complex websites.",
    icon: "https://avatars.githubusercontent.com/oxylabs",
    isOfficial: true,
    homepage: "https://github.com/oxylabs/oxylabs-mcp",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["oxylabs-mcp"],
      env: {
        OXYLABS_PASSWORD: "<oxylabs-password>",
        OXYLABS_USERNAME: "<oxylabs-username>",
      },
    },
    parameters: [
      {
        name: "OXYLABS_PASSWORD",
        description: "Your Oxylabs account password",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "OXYLABS_USERNAME",
        description: "Your Oxylabs account username",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "pebbletek-cribl-mcp",
    title: "cribl-mcp",
    description:
      "This server acts as a MCP bridge to interact with the Cribl REST API. It allows AI models or other MCP clients to query and manage Cribl configurations.",
    icon: "https://avatars.githubusercontent.com/pebbletek",
    isOfficial: false,
    homepage: "https://github.com/pebbletek/cribl-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @pebbletek/cribl-mcp"],
      env: {
        CRIBL_BASE_URL: "<cribl-base-url>",
        CRIBL_AUTH_TYPE: "<cribl-auth-type>",
        CRIBL_CLIENT_ID: "<cribl-client-id>",
        CRIBL_CLIENT_SECRET: "<cribl-client-secret>",
      },
    },
    parameters: [
      {
        name: "CRIBL_BASE_URL",
        description: "The base URL of your Cribl cloud instance",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "CRIBL_AUTH_TYPE",
        description: "The authentication type to use (e.g., cloud)",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "CRIBL_CLIENT_ID",
        description: "The client ID for authentication",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "CRIBL_CLIENT_SECRET",
        description: "The client secret for authentication",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "peng-shawn-mermaid-mcp-server",
    title: "mermaid-mcp-server",
    description:
      "A Model Context Protocol (MCP) server that converts Mermaid diagrams to PNG images.",
    icon: "https://avatars.githubusercontent.com/peng-shawn",
    isOfficial: false,
    homepage: "https://github.com/peng-shawn/mermaid-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @peng-shawn/mermaid-mcp-server"],
      env: {
        CONTENT_IMAGE_SUPPORTED: "<content-image-supported>",
      },
    },
    parameters: [
      {
        name: "CONTENT_IMAGE_SUPPORTED",
        description:
          "Controls whether images are returned directly in the response or saved to disk. If true (default), images are returned directly in the response. If false, images are saved to disk, requiring name and folder parameters.",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "pinkpixel-dev-blabber-mcp",
    title: "Blabber-MCP",
    description:
      "An MCP server that enables LLMs to generate spoken audio from text using OpenAI's Text-to-Speech API, supporting various voices, models, and audio formats.",
    icon: "https://avatars.githubusercontent.com/pinkpixel-dev",
    isOfficial: false,
    homepage: "https://github.com/pinkpixel-dev/blabber-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @pinkpixel/blabber-mcp"],
      env: {
        OPENAI_API_KEY: "<openai-api-key>",
        DEFAULT_TTS_VOICE: "<default-tts-voice>",
        AUDIO_PLAYER_COMMAND: "<audio-player-command>",
      },
    },
    parameters: [
      {
        name: "OPENAI_API_KEY",
        description: "Your API key from OpenAI",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "DEFAULT_TTS_VOICE",
        description:
          "Set default voice (alloy, echo, fable, onyx, nova, shimmer)",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "AUDIO_PLAYER_COMMAND",
        description:
          'Command to play audio (e.g., "cvlc", "vlc", "mpv", "ffplay", "afplay", "xdg-open")',
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "pinkpixel-dev-deep-research-mcp",
    title: "Deep Research MCP Server",
    description:
      "A Model Context Protocol server that performs comprehensive web research by combining Tavily Search and Crawl APIs to gather extensive information and provide structured JSON output tailored for LLMs to create detailed markdown documents.",
    icon: "https://avatars.githubusercontent.com/pinkpixel-dev",
    isOfficial: false,
    homepage: "https://github.com/pinkpixel-dev/deep-research-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @pinkpixel/deep-research-mcp"],
      env: {
        CRAWL_LIMIT: "<crawl-limit>",
        CRAWL_TIMEOUT: "<crawl-timeout>",
        SEARCH_TIMEOUT: "<search-timeout>",
        TAVILY_API_KEY: "<tavily-api-key>",
        CRAWL_MAX_DEPTH: "<crawl-max-depth>",
        FILE_WRITE_ENABLED: "<file-write-enabled>",
        MAX_SEARCH_RESULTS: "<max-search-results>",
        ALLOWED_WRITE_PATHS: "<allowed-write-paths>",
        DOCUMENTATION_PROMPT: "<documentation-prompt>",
        RESEARCH_OUTPUT_PATH: "<research-output-path>",
        FILE_WRITE_LINE_LIMIT: "<file-write-line-limit>",
      },
    },
    parameters: [
      {
        name: "CRAWL_LIMIT",
        description: "Maximum number of URLs to crawl per source",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "CRAWL_TIMEOUT",
        description: "Timeout in seconds for Tavily crawl requests",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "SEARCH_TIMEOUT",
        description: "Timeout in seconds for Tavily search requests",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "TAVILY_API_KEY",
        description: "Your Tavily API key",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "CRAWL_MAX_DEPTH",
        description: "Maximum crawl depth from base URL",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "FILE_WRITE_ENABLED",
        description: "Enable file writing capability",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MAX_SEARCH_RESULTS",
        description: "Maximum number of search results to retrieve",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "ALLOWED_WRITE_PATHS",
        description: "Comma-separated allowed directories for file writing",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "DOCUMENTATION_PROMPT",
        description: "Custom prompt for LLM documentation generation",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "RESEARCH_OUTPUT_PATH",
        description: "Path where research documents and images should be saved",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "FILE_WRITE_LINE_LIMIT",
        description: "Maximum lines per file write operation",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "pinkpixel-dev-mindbridge-mcp",
    title: "MindBridge MCP Server",
    description:
      "An AI router that connects applications to multiple LLM providers (OpenAI, Anthropic, Google, DeepSeek, Ollama, etc.) with smart model orchestration capabilities, enabling dynamic switching between models for different reasoning tasks.",
    icon: "https://avatars.githubusercontent.com/pinkpixel-dev",
    isOfficial: false,
    homepage: "https://github.com/pinkpixel-dev/mindbridge-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @pinkpixel/mindbridge"],
      env: {
        GOOGLE_API_KEY: "<google-api-key>",
        OPENAI_API_KEY: "<openai-api-key>",
        OLLAMA_BASE_URL: "<ollama-base-url>",
        DEEPSEEK_API_KEY: "<deepseek-api-key>",
        ANTHROPIC_API_KEY: "<anthropic-api-key>",
        OPENROUTER_API_KEY: "<openrouter-api-key>",
        OPENAI_COMPATIBLE_API_KEY: "<openai-compatible-api-key>",
        OPENAI_COMPATIBLE_API_MODELS: "<openai-compatible-api-models>",
        OPENAI_COMPATIBLE_API_BASE_URL: "<openai-compatible-api-base-url>",
      },
    },
    parameters: [
      {
        name: "GOOGLE_API_KEY",
        description: "Your Google AI API key",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "OPENAI_API_KEY",
        description: "Your OpenAI API key",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "OLLAMA_BASE_URL",
        description: "Ollama instance URL",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "DEEPSEEK_API_KEY",
        description: "Your DeepSeek API key",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "ANTHROPIC_API_KEY",
        description: "Your Anthropic API key",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "OPENROUTER_API_KEY",
        description: "Your OpenRouter API key",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "OPENAI_COMPATIBLE_API_KEY",
        description: "API key for OpenAI-compatible services",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "OPENAI_COMPATIBLE_API_MODELS",
        description:
          "Comma-separated list of available models for OpenAI-compatible services",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "OPENAI_COMPATIBLE_API_BASE_URL",
        description: "Base URL for OpenAI-compatible services",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "pinkpixel-dev-notification-mcp",
    title: "Notifications MCP Server",
    description:
      "A Model Context Protocol server that allows AI agents to play notification sounds when tasks are completed.",
    icon: "https://avatars.githubusercontent.com/pinkpixel-dev",
    isOfficial: false,
    homepage: "https://github.com/pinkpixel-dev/notification-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @pinkpixel/notification-mcp"],
      env: {
        MCP_NOTIFICATION_SOUND_PATH: "<mcp-notification-sound-path>",
      },
    },
    parameters: [
      {
        name: "MCP_NOTIFICATION_SOUND_PATH",
        description:
          "The full absolute path to your notification sound MP3 file",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "puchunjie-doc-tools-mcp",
    title: "doc-tools-mcp",
    description: "Word document reading and writing MCP implemented in Node.js",
    icon: "https://avatars.githubusercontent.com/puchunjie",
    isOfficial: false,
    homepage: "https://github.com/puchunjie/doc-tools-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @puchunjie/doc-tools-mcp"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "puremd-puremd-mcp",
    title: "pure.md MCP server",
    description:
      "An MCP server that enables AI clients like Cursor, Windsurf, and Claude Desktop to access web content in markdown format, providing web unblocking and searching capabilities.",
    icon: "https://avatars.githubusercontent.com/puremd",
    isOfficial: true,
    homepage: "https://github.com/puremd/puremd-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y puremd-mcp"],
      env: {
        PUREMD_API_KEY: "<puremd-api-key>",
      },
    },
    parameters: [
      {
        name: "PUREMD_API_KEY",
        description:
          "Your pure.md API token for higher rate limits. Can be set to an empty string for anonymous usage.",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "qdrant-mcp-server-qdrant",
    title: "mcp-server-qdrant",
    description:
      "This repository is an example of how to create a MCP server for Qdrant, a vector search engine.",
    icon: "https://avatars.githubusercontent.com/qdrant",
    isOfficial: true,
    homepage: "https://github.com/qdrant/mcp-server-qdrant",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp-server-qdrant"],
      env: {
        QDRANT_URL: "<qdrant-url>",
        QDRANT_API_KEY: "<qdrant-api-key>",
        COLLECTION_NAME: "<collection-name>",
        QDRANT_LOCAL_PATH: "<qdrant-local-path>",
        FASTEMBED_MODEL_NAME: "<fastembed-model-name>",
      },
    },
    parameters: [
      {
        name: "QDRANT_URL",
        description: "URL of the Qdrant server, e.g. http://localhost:6333",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "QDRANT_API_KEY",
        description: "API key for the Qdrant server",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "COLLECTION_NAME",
        description: "Name of the collection to use",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "QDRANT_LOCAL_PATH",
        description: "Path to the local Qdrant database",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "FASTEMBED_MODEL_NAME",
        description: "Name of the FastEmbed model to use",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "qpd-v-mcp-delete",
    title: "MCP-Delete",
    description:
      "A Model Context Protocol (MCP) server that provides file deletion capabilities. This server allows AI assistants to safely delete files when needed, with support for both relative and absolute paths.",
    icon: "https://avatars.githubusercontent.com/qpd-v",
    isOfficial: false,
    homepage: "https://github.com/qpd-v/mcp-delete",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @qpd-v/mcp-delete"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "qpd-v-mcp-communicator-telegram",
    title: "MCP-Communicator-Telegram",
    description:
      "An MCP server that enables communication with users through Telegram. This server provides a tool to ask questions to users and receive their responses via a Telegram bot.",
    icon: "https://avatars.githubusercontent.com/qpd-v",
    isOfficial: false,
    homepage: "https://github.com/qpd-v/mcp-communicator-telegram",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y mcp-communicator-telegram"],
      env: {
        CHAT_ID: "<chat-id>",
        TELEGRAM_TOKEN: "<telegram-token>",
      },
    },
    parameters: [
      {
        name: "CHAT_ID",
        description: "Your Telegram chat ID",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "TELEGRAM_TOKEN",
        description: "The Telegram bot token obtained from @BotFather",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "qpd-v-mcp-wordcounter",
    title: "MCP Word Counter",
    description:
      "A Model Context Protocol server that provides tools for analyzing text documents, including counting words and characters. This server helps LLMs perform text analysis tasks by exposing simple document statistics functionality.",
    icon: "https://avatars.githubusercontent.com/qpd-v",
    isOfficial: false,
    homepage: "https://github.com/qpd-v/mcp-wordcounter",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y mcp-wordcounter"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "qwang07-duck-duck-mcp",
    title: "Duck Duck MCP",
    description:
      "This MCP server utilizes DuckDuckGo for web searches, providing structured search results with metadata and features like smart content classification and language detection, facilitating easy integration with AI clients supporting the MCP protocol.",
    icon: "https://avatars.githubusercontent.com/qwang07",
    isOfficial: false,
    homepage: "https://github.com/qwang07/duck-duck-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y duck-duck-mcp"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "rafaljanicki-x-twitter-mcp-server",
    title: "X (Twitter) MCP server",
    description: "X (Twitter) MCP server",
    icon: "https://avatars.githubusercontent.com/rafaljanicki",
    isOfficial: false,
    homepage: "https://github.com/rafaljanicki/x-twitter-mcp-server",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["x-twitter-mcp"],
      env: {
        TWITTER_API_KEY: "<twitter-api-key>",
        PYTHONUNBUFFERED: "<pythonunbuffered>",
        TWITTER_API_SECRET: "<twitter-api-secret>",
        TWITTER_ACCESS_TOKEN: "<twitter-access-token>",
        TWITTER_BEARER_TOKEN: "<twitter-bearer-token>",
        TWITTER_ACCESS_TOKEN_SECRET: "<twitter-access-token-secret>",
      },
    },
    parameters: [
      {
        name: "TWITTER_API_KEY",
        description: "Your Twitter API key from the Twitter Developer Portal",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "PYTHONUNBUFFERED",
        description:
          "Ensures output is unbuffered for better logging in Claude",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "TWITTER_API_SECRET",
        description:
          "Your Twitter API secret from the Twitter Developer Portal",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "TWITTER_ACCESS_TOKEN",
        description:
          "Your Twitter access token from the Twitter Developer Portal",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "TWITTER_BEARER_TOKEN",
        description:
          "Your Twitter bearer token from the Twitter Developer Portal",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "TWITTER_ACCESS_TOKEN_SECRET",
        description:
          "Your Twitter access token secret from the Twitter Developer Portal",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "rahgadda-openapi_mcp_server",
    title: "OpenAPI MCP Server",
    description:
      "A Model Context Protocol Server that enables LLMs to interact with and execute REST API calls through natural language prompts, supporting GET/PUT/POST/PATCH operations on configured APIs.",
    icon: "https://avatars.githubusercontent.com/rahgadda",
    isOfficial: false,
    homepage: "https://github.com/rahgadda/openapi_mcp_server",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["openapi_mcp_server"],
      env: {
        DEBUG: "<debug>",
        NO_PROXY: "<no-proxy>",
        HTTP_PROXY: "<http-proxy>",
        API_HEADERS: "<api-headers>",
        HTTPS_PROXY: "<https-proxy>",
        API_BASE_URL: "<api-base-url>",
        API_BLACK_LIST: "<api-black-list>",
        API_WHITE_LIST: "<api-white-list>",
        OPENAPI_SPEC_PATH: "<openapi-spec-path>",
      },
    },
    parameters: [
      {
        name: "DEBUG",
        description: "Enable debug logging",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "NO_PROXY",
        description: "No Proxy details",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "HTTP_PROXY",
        description: "HTTP Proxy details",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "API_HEADERS",
        description: "Headers to include in the API requests",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "HTTPS_PROXY",
        description: "HTTPS Proxy details",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "API_BASE_URL",
        description: "Base URL for the API requests",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "API_BLACK_LIST",
        description:
          'Black Listed operationId in list format ["operationId3", "operationId4"]',
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "API_WHITE_LIST",
        description:
          'White Listed operationId in list format ["operationId1", "operationId2"]',
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "OPENAPI_SPEC_PATH",
        description: "Path to the OpenAPI document",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "rahgadda-oracledb_mcp_server",
    title: "OracleDB MCP Server",
    description:
      "A Model Context Protocol Server that enables LLMs to interact with Oracle Database by providing database tables/columns as context, allowing users to generate SQL statements and retrieve results using natural language prompts.",
    icon: "https://avatars.githubusercontent.com/rahgadda",
    isOfficial: false,
    homepage: "https://github.com/rahgadda/oracledb_mcp_server",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["oracledb-mcp-server"],
      env: {
        DEBUG: "<debug>",
        QUERY_LIMIT_SIZE: "<query-limit-size>",
        TABLE_WHITE_LIST: "<table-white-list>",
        COLUMN_WHITE_LIST: "<column-white-list>",
        DB_CONNECTION_STRING: "<db-connection-string>",
        COMMENT_DB_CONNECTION_STRING: "<comment-db-connection-string>",
      },
    },
    parameters: [
      {
        name: "DEBUG",
        description: "Enable debug logging",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "QUERY_LIMIT_SIZE",
        description: "Default value is 10 records if not provided",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "TABLE_WHITE_LIST",
        description:
          'White Listed table names in list format ["table1", "table2"]',
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "COLUMN_WHITE_LIST",
        description:
          'White Listed table-column names in list format ["table.column1", "table.column2"]',
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "DB_CONNECTION_STRING",
        description: "Oracle DB connection String for execution of queries",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "COMMENT_DB_CONNECTION_STRING",
        description: "Oracle DB connection String for comments",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "recraft-ai-mcp-recraft-server",
    title: "Recraft AI MCP Server",
    description:
      "An MCP server that integrates with Recraft AI to enable generation and manipulation of high-quality raster and vector images through tools like image generation, editing, vectorization, background removal, and upscaling.",
    icon: "https://avatars.githubusercontent.com/recraft-ai",
    isOfficial: true,
    homepage: "https://github.com/recraft-ai/mcp-recraft-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @recraft-ai/mcp-recraft-server"],
      env: {
        RECRAFT_API_KEY: "<recraft-api-key>",
        IMAGE_STORAGE_DIRECTORY: "<image-storage-directory>",
      },
    },
    parameters: [
      {
        name: "RECRAFT_API_KEY",
        description:
          "Your Recraft AI API key from https://www.recraft.ai/profile/api",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "IMAGE_STORAGE_DIRECTORY",
        description:
          "Optional, absolute path to directory where generated images will be stored. Default is $HOME_DIR/.mcp-recraft-server",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "reeeeemo-ancestry-mcp",
    title: "Ancestry MCP",
    description: "Allows the AI to read .ged files and genetic data.",
    icon: "https://avatars.githubusercontent.com/reeeeemo",
    isOfficial: false,
    homepage: "https://github.com/reeeeemo/ancestry-mcp",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp-server-ancestry"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "erithwik-mcp-hn",
    title: "mcp-hn",
    description:
      "A Model Context Protocol (MCP) server that provides tools for searching and fetching information from Hacker News.",
    icon: "https://avatars.githubusercontent.com/erithwik",
    isOfficial: false,
    homepage: "https://github.com/erithwik/mcp-hn",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp-hn"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "ruixingshi-deepseek-thinker-mcp",
    title: "Deepseek Thinker MCP Server",
    description:
      "Provides reasoning content to MCP-enabled AI clients by interfacing with Deepseek's API or a local Ollama server, enabling focused reasoning and thought process visualization.",
    icon: "https://avatars.githubusercontent.com/ruixingshi",
    isOfficial: false,
    homepage: "https://github.com/ruixingshi/deepseek-thinker-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y deepseek-thinker-mcp"],
      env: {
        API_KEY: "<api-key>",
        BASE_URL: "<base-url>",
        USE_OLLAMA: "<use-ollama>",
      },
    },
    parameters: [
      {
        name: "API_KEY",
        description: "Your OpenAI API Key for accessing Deepseek API",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "BASE_URL",
        description: "API Base URL for the Deepseek API service",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "USE_OLLAMA",
        description: "Enable Ollama local mode instead of OpenAI API mode",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "sakce-mcp-server-monday",
    title: "Monday.com MCP Server",
    description:
      "Enables MCP clients to interact with Monday.com boards, allowing creation and management of items, sub-items, comments, and retrieval of board information.",
    icon: "https://avatars.githubusercontent.com/sakce",
    isOfficial: false,
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
    parameters: [
      {
        name: "MONDAY_API_KEY",
        description: "Your personal API token from Monday.com",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "MONDAY_WORKSPACE_NAME",
        description:
          "The name of your Monday.com workspace (from the URL, e.g., 'myworkspace' from 'https://myworkspace.monday.com/')",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "sammcj-mcp-github-issue",
    title: "MCP GitHub Issue Server",
    description:
      "Enables LLMs to interact with GitHub issues by providing details as tasks, allowing for seamless integration and task management through GitHub's platform.",
    icon: "https://avatars.githubusercontent.com/sammcj",
    isOfficial: false,
    homepage: "https://github.com/sammcj/mcp-github-issue",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y mcp-github-issue"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "sanderkooger-mcp-server-ragdocs",
    title: "@sanderkooger/mcp-server-ragdocs",
    description:
      "An MCP server implementation that provides tools for retrieving and processing documentation through vector search, enabling AI assistants to augment their responses with relevant documentation context.\n\nUses Ollama or OpenAI to generate embeddings.\n\nDocker files included",
    icon: "https://avatars.githubusercontent.com/sanderkooger",
    isOfficial: false,
    homepage: "https://github.com/sanderkooger/mcp-server-ragdocs",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @sanderkooger/mcp-server-ragdocs"],
      env: {
        QDRANT_URL: "<qdrant-url>",
        OPENAI_API_KEY: "<openai-api-key>",
        QDRANT_API_KEY: "<qdrant-api-key>",
        OLLAMA_BASE_URL: "<ollama-base-url>",
        EMBEDDINGS_PROVIDER: "<embeddings-provider>",
      },
    },
    parameters: [
      {
        name: "QDRANT_URL",
        description: "URL of your Qdrant vector database instance",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "OPENAI_API_KEY",
        description:
          "API key for OpenAI (required when EMBEDDINGS_PROVIDER is 'openai')",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "QDRANT_API_KEY",
        description: "API key for authenticating with Qdrant (if applicable)",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "OLLAMA_BASE_URL",
        description:
          "Base URL for Ollama service (used when EMBEDDINGS_PROVIDER is 'ollama')",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "EMBEDDINGS_PROVIDER",
        description: "Provider to use for generating embeddings",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "sapientpants-deepsource-mcp-server",
    title: "DeepSource MCP Server",
    description:
      "A Model Context Protocol server that integrates with DeepSource to provide AI assistants with access to code quality metrics, issues, and analysis results.",
    icon: "https://avatars.githubusercontent.com/sapientpants",
    isOfficial: false,
    homepage: "https://github.com/sapientpants/deepsource-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y deepsource-mcp-server"],
      env: {
        DEEPSOURCE_API_KEY: "<deepsource-api-key>",
      },
    },
    parameters: [
      {
        name: "DEEPSOURCE_API_KEY",
        description:
          "Your DeepSource API key for authentication with the DeepSource API",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "mcp2everything-mcp2tcp",
    title: "mcp2tcp",
    description:
      "A bridge connecting physical hardware with AI large language models through the Model Context Protocol (MCP), enabling natural language control of TCP devices.",
    icon: "https://avatars.githubusercontent.com/mcp2everything",
    isOfficial: false,
    homepage: "https://github.com/mcp2everything/mcp2tcp",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp2tcp"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "shannonlal-mcp-postman",
    title: "Postman MCP Server",
    description:
      "Enables running Postman collections using Newman for conducting API tests and obtaining detailed result analysis via a standardized interface.",
    icon: "https://avatars.githubusercontent.com/shannonlal",
    isOfficial: false,
    homepage: "https://github.com/shannonlal/mcp-postman",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y mcp-postman"],
      env: {
        globals: "<globals>",
        collection: "<collection>",
        environment: "<environment>",
        iterationCount: "<iterationcount>",
      },
    },
    parameters: [
      {
        name: "globals",
        description: "Path or URL to globals file",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "collection",
        description: "Path or URL to the Postman collection",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "environment",
        description: "Path or URL to environment file",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "iterationCount",
        description: "Number of iterations to run",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "shinzo-labs-gmail-mcp",
    title: "Gmail MCP",
    description:
      "Manage your emails effortlessly with a standardized interface for drafting, sending, retrieving, and organizing messages. Streamline your email workflow with complete Gmail API coverage, including label and thread management.",
    icon: "https://avatars.githubusercontent.com/shinzo-labs",
    isOfficial: false,
    homepage: "https://github.com/shinzo-labs/gmail-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @shinzolabs/gmail-mcp"],
      env: {
        CLIENT_ID: "<client-id>",
        CLIENT_SECRET: "<client-secret>",
        REFRESH_TOKEN: "<refresh-token>",
        MCP_CONFIG_DIR: "<mcp-config-dir>",
        AUTH_SERVER_PORT: "<auth-server-port>",
      },
    },
    parameters: [
      {
        name: "CLIENT_ID",
        description:
          "Google OAuth2 client ID, only required if running without credentials JSON file",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "CLIENT_SECRET",
        description:
          "Google OAuth2 client secret, only required if running without credentials JSON file",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "REFRESH_TOKEN",
        description:
          "Google OAuth2 initial refresh token, only required if running without credentials JSON file",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MCP_CONFIG_DIR",
        description:
          "Path for MCP credentials config, defaults to $HOME, only required if CLIENT_ID, CLIENT_SECRET, and REFRESH_TOKEN are not specified",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "AUTH_SERVER_PORT",
        description:
          "Port for auth server to listen on when authenticating locally with pnpm run auth, defaults to 3000",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "shinzo-labs-hubspot-mcp",
    title: "HubSpot MCP",
    description:
      "A Model Context Protocol implementation for the HubSpot API that provides a standardized interface for accessing and managing CRM data, including companies, contacts, deals, and other objects with comprehensive CRUD operations and association management.",
    icon: "https://avatars.githubusercontent.com/shinzo-labs",
    isOfficial: false,
    homepage: "https://github.com/shinzo-labs/hubspot-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @shinzolabs/hubspot-mcp"],
      env: {
        HUBSPOT_ACCESS_TOKEN: "<hubspot-access-token>",
      },
    },
    parameters: [
      {
        name: "HUBSPOT_ACCESS_TOKEN",
        description: "Your HubSpot API access token",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "sylphxltd-pdf-reader-mcp",
    title: "PDF Reader MCP Server",
    description:
      "Empowers AI agents to securely read and extract information (text, metadata, page count) from PDF files within project contexts using a flexible MCP tool.",
    icon: "https://avatars.githubusercontent.com/sylphxltd",
    isOfficial: false,
    homepage: "https://github.com/sylphxltd/pdf-reader-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @shtse8/pdf-reader-mcp"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "sinco-lab-mcp-youtube-transcript",
    title: "mcp-youtube-transcript",
    description:
      "A Model Context Protocol server that enables retrieval of transcripts from YouTube videos. This server provides direct access to video transcripts and subtitles through a simple interface, making it ideal for content analysis and processing.",
    icon: "https://avatars.githubusercontent.com/sinco-lab",
    isOfficial: false,
    homepage: "https://github.com/sinco-lab/mcp-youtube-transcript",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @sinco-lab/mcp-youtube-transcript"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "sirmews-apple-notes-mcp",
    title: "apple-notes-mcp",
    description:
      "Allows the AI to read from your local Apple Notes database (macOS only)",
    icon: "https://avatars.githubusercontent.com/sirmews",
    isOfficial: false,
    homepage: "https://github.com/sirmews/apple-notes-mcp",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["apple-notes-mcp"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "sirmews-mcp-pinecone",
    title: "mcp-pinecone",
    description: "Pinecone integration with vector search capabilities",
    icon: "https://avatars.githubusercontent.com/sirmews",
    isOfficial: false,
    homepage: "https://github.com/sirmews/mcp-pinecone",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp-pinecone"],
      env: {
        "your-index-name": "<your-index-name>",
        UV_PUBLISH_TOKEN: "<uv-publish-token>",
        UV_PUBLISH_PASSWORD: "<uv-publish-password>",
        UV_PUBLISH_USERNAME: "<uv-publish-username>",
        "your-secret-api-key": "<your-secret-api-key>",
      },
    },
    parameters: [
      {
        name: "your-index-name",
        description: "The name of your Pinecone index.",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "UV_PUBLISH_TOKEN",
        description: "Your token used for publishing to PyPI.",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "UV_PUBLISH_PASSWORD",
        description: "Your password for publishing to PyPI.",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "UV_PUBLISH_USERNAME",
        description: "Your username for publishing to PyPI.",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "your-secret-api-key",
        description: "Your secret API key for accessing the Pinecone index.",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "skydeckai-mcp-server-rememberizer",
    title: "Rememberizer MCP Server",
    description:
      "A Model Context Protocol server enabling LLMs to search, retrieve, and manage documents through Rememberizer's knowledge management API.",
    icon: "https://avatars.githubusercontent.com/skydeckai",
    isOfficial: false,
    homepage: "https://github.com/skydeckai/mcp-server-rememberizer",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp-server-rememberizer"],
      env: {
        REMEMBERIZER_API_TOKEN: "<rememberizer-api-token>",
      },
    },
    parameters: [
      {
        name: "REMEMBERIZER_API_TOKEN",
        description:
          "Your Rememberizer API token, obtained by creating your own Common Knowledge in Rememberizer",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "janwilmake-openapi-mcp-server",
    title: "OpenAPI",
    description:
      "This tool creates a Model Context Protocol (MCP) server that acts as a proxy for any API that has an OpenAPI v3.1 specification. This allows you to use Claude Desktop to easily interact with both local and remote server APIs.",
    icon: "https://avatars.githubusercontent.com/janwilmake",
    isOfficial: false,
    homepage: "https://github.com/janwilmake/openapi-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y openapi-mcp-server"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "snjyor-binance-mcp",
    title: "Binance Cryptocurrency MCP",
    description:
      "MCP service that provides real-time access to Binance cryptocurrency market data, allowing AI agents to fetch current prices, order books, candlestick charts, and trading statistics through natural language queries.",
    icon: "https://avatars.githubusercontent.com/snjyor",
    isOfficial: false,
    homepage: "https://github.com/snjyor/binance-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @snjyor/binance-mcp"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "sooperset-mcp-atlassian",
    title: "MCP Atlassian",
    description:
      "Model Context Protocol (MCP) server for Atlassian Cloud products (Confluence and Jira). This integration is designed specifically for Atlassian Cloud instances and does not support Atlassian Server or Data Center deployments.",
    icon: "https://avatars.githubusercontent.com/sooperset",
    isOfficial: false,
    homepage: "https://github.com/sooperset/mcp-atlassian",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp-atlassian"],
      env: {
        JIRA_URL: "<jira-url>",
        JIRA_USERNAME: "<jira-username>",
        CONFLUENCE_URL: "<confluence-url>",
        JIRA_API_TOKEN: "<jira-api-token>",
        CONFLUENCE_USERNAME: "<confluence-username>",
        CONFLUENCE_API_TOKEN: "<confluence-api-token>",
      },
    },
    parameters: [
      {
        name: "JIRA_URL",
        description: "The URL for your Jira instance",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "JIRA_USERNAME",
        description: "Your Jira account email",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "CONFLUENCE_URL",
        description: "The URL for your Confluence instance",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "JIRA_API_TOKEN",
        description: "Your Jira API token",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "CONFLUENCE_USERNAME",
        description: "Your Confluence account email",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "CONFLUENCE_API_TOKEN",
        description: "Your Confluence API token",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "spences10-mcp-memory-libsql",
    title: "mcp-memory-libsql",
    description:
      "A high-performance MCP server utilizing libSQL for persistent memory and vector search capabilities, enabling efficient entity management and semantic knowledge storage.",
    icon: "https://avatars.githubusercontent.com/spences10",
    isOfficial: false,
    homepage: "https://github.com/spences10/mcp-memory-libsql",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y mcp-memory-libsql"],
      env: {
        LIBSQL_URL: "<libsql-url>",
        LIBSQL_AUTH_TOKEN: "<libsql-auth-token>",
      },
    },
    parameters: [
      {
        name: "LIBSQL_URL",
        description:
          "URL for the libSQL database. For local SQLite databases use 'file:/path/to/database.db', for remote libSQL databases use 'libsql://your-database.turso.io'",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "LIBSQL_AUTH_TOKEN",
        description:
          "Authentication token for remote libSQL databases (e.g., Turso)",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "srmorete-adb-mcp",
    title: "ADB MCP Server",
    description:
      "A TypeScript-based bridge between AI models and Android device functionality, enabling interaction with Android devices through ADB commands for tasks like app installation, file transfer, UI analysis, and shell command execution.",
    icon: "https://avatars.githubusercontent.com/srmorete",
    isOfficial: false,
    homepage: "https://github.com/srmorete/adb-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y adb-mcp"],
      env: {
        ADB_PATH: "<adb-path>",
        LOG_LEVEL: "<log-level>",
      },
    },
    parameters: [
      {
        name: "ADB_PATH",
        description: "Custom path to ADB executable",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "LOG_LEVEL",
        description: "Logging verbosity level (e.g. 3 for detailed logs)",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "stabgan-openrouter-mcp-multimodal",
    title: "OpenRouter MCP Multimodal Server",
    description:
      "Provides chat and image analysis capabilities through OpenRouter.ai's diverse model ecosystem, enabling both text conversations and powerful multimodal image processing with various AI models.",
    icon: "https://avatars.githubusercontent.com/stabgan",
    isOfficial: false,
    homepage: "https://github.com/stabgan/openrouter-mcp-multimodal",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @stabgan/openrouter-mcp-multimodal"],
      env: {
        PATH: "<path>",
        OPENROUTER_API_KEY: "<openrouter-api-key>",
        OPENROUTER_DEFAULT_MODEL: "<openrouter-default-model>",
      },
    },
    parameters: [
      {
        name: "PATH",
        description:
          "System PATH environment variable (to resolve 'fetch is not defined' errors)",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "OPENROUTER_API_KEY",
        description: "Your OpenRouter API key from openrouter.ai/keys",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "OPENROUTER_DEFAULT_MODEL",
        description: "Default model to use (e.g., anthropic/claude-3.5-sonnet)",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "steipete-claude-code-mcp",
    title: "Claude Code MCP Server",
    description:
      "A server that allows LLMs to run Claude Code with all permissions bypassed automatically, enabling code execution and file editing without permission interruptions.",
    icon: "https://avatars.githubusercontent.com/steipete",
    isOfficial: false,
    homepage: "https://github.com/steipete/claude-code-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @steipete/claude-code-mcp"],
      env: {
        CLAUDE_CLI_PATH: "<claude-cli-path>",
      },
    },
    parameters: [
      {
        name: "CLAUDE_CLI_PATH",
        description: "Set a custom path to the Claude CLI executable",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "stevengonsalvez-todoist-mcp",
    title: "Todoist MCP Server",
    description:
      "A Model Context Protocol server that enables advanced task and project management in Todoist via Claude Desktop and other MCP-compatible clients.",
    icon: "https://avatars.githubusercontent.com/stevengonsalvez",
    isOfficial: false,
    homepage: "https://github.com/stevengonsalvez/todoist-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y todoist-mcp-server"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "cfdude-super-shell-mcp",
    title: "Super Shell MCP Server",
    description:
      "An MCP server that enables secure execution of shell commands across Windows, macOS, and Linux with built-in whitelisting and approval mechanisms for enhanced security.",
    icon: "https://avatars.githubusercontent.com/cfdude",
    isOfficial: false,
    homepage: "https://github.com/cfdude/super-shell-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y super-shell-mcp"],
      env: {
        shell: "<shell>",
      },
    },
    parameters: [
      {
        name: "shell",
        description:
          "Path to the shell executable to use (e.g. /bin/bash, C:\\Windows\\System32\\cmd.exe)",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "maverickg59-sushimcp",
    title: "SushiMCP",
    description: "sushimcp",
    icon: "https://avatars.githubusercontent.com/maverickg59",
    isOfficial: false,
    homepage: "https://github.com/maverickg59/sushimcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @chriswhiterocks/sushimcp"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "tacticlaunch-mcp-linear",
    title: "Linear",
    description:
      "A Model Context Protocol server that enables AI assistants to interact with Linear project management systems, allowing users to retrieve, create, and update issues, projects, and teams through natural language.",
    icon: "https://avatars.githubusercontent.com/tacticlaunch",
    isOfficial: false,
    homepage: "https://github.com/tacticlaunch/mcp-linear",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @tacticlaunch/mcp-linear"],
      env: {
        LINEAR_API_TOKEN: "<linear-api-token>",
      },
    },
    parameters: [
      {
        name: "LINEAR_API_TOKEN",
        description: "Your Linear API token",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "tadasant-mcp-server-stability-ai",
    title: "Stability AI MCP Server",
    description:
      "An MCP Server that integrates with Stability AI's API to provide high-quality image generation, editing, and manipulation capabilities including background removal, outpainting, search-and-replace, and upscaling.",
    icon: "https://avatars.githubusercontent.com/tadasant",
    isOfficial: false,
    homepage: "https://github.com/tadasant/mcp-server-stability-ai",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y mcp-server-stability-ai"],
      env: {
        GCS_PROJECT_ID: "<gcs-project-id>",
        GCS_BUCKET_NAME: "<gcs-bucket-name>",
        GCS_PRIVATE_KEY: "<gcs-private-key>",
        GCS_CLIENT_EMAIL: "<gcs-client-email>",
        STABILITY_AI_API_KEY: "<stability-ai-api-key>",
        IMAGE_STORAGE_DIRECTORY: "<image-storage-directory>",
      },
    },
    parameters: [
      {
        name: "GCS_PROJECT_ID",
        description:
          "Google Cloud Project ID for storing images (when using SSE mode)",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "GCS_BUCKET_NAME",
        description:
          "Google Cloud Storage bucket name for storing images (when using SSE mode)",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "GCS_PRIVATE_KEY",
        description:
          "Google Cloud Service Account private key for storing images (when using SSE mode)",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "GCS_CLIENT_EMAIL",
        description:
          "Google Cloud Service Account client email for storing images (when using SSE mode)",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "STABILITY_AI_API_KEY",
        description:
          "Your Stability AI API key. Get one at platform.stability.ai",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "IMAGE_STORAGE_DIRECTORY",
        description: "Directory where generated images will be saved",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "tanigami-mcp-server-perplexity",
    title: "Perplexity MCP Server",
    description: "Interacting with Perplexity API.",
    icon: "https://avatars.githubusercontent.com/tanigami",
    isOfficial: false,
    homepage: "https://github.com/tanigami/mcp-server-perplexity",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp-server-perplexity"],
      env: {
        PERPLEXITY_API_KEY: "<perplexity-api-key>",
      },
    },
    parameters: [
      {
        name: "PERPLEXITY_API_KEY",
        description: "Your Perplexity API key",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "tavily-ai-tavily-mcp",
    title: "Tavily MCP Server",
    description:
      "This server enables AI systems to integrate with Tavily's search and data extraction tools, providing real-time web information access and domain-specific searches.",
    icon: "https://avatars.githubusercontent.com/tavily-ai",
    isOfficial: true,
    homepage: "https://github.com/tavily-ai/tavily-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y tavily-mcp"],
      env: {
        TAVILY_API_KEY: "<tavily-api-key>",
      },
    },
    parameters: [
      {
        name: "TAVILY_API_KEY",
        description: "Your Tavily API key obtained from app.tavily.com/home",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "terryso-meta_tag_genie",
    title: "MetaTag Genie",
    description: "MetaTag Genie",
    icon: "https://avatars.githubusercontent.com/terryso",
    isOfficial: false,
    homepage: "https://github.com/terryso/meta_tag_genie",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y metatag-genie"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "terryso-tv-recommender-mcp-server",
    title: "tv-recommender-mcp-server",
    description: "tv-recommender-mcp-server",
    icon: "https://avatars.githubusercontent.com/terryso",
    isOfficial: false,
    homepage: "https://github.com/terryso/tv-recommender-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y tv-recommender-mcp-server"],
      env: {
        TMDB_API_KEY: "<tmdb-api-key>",
      },
    },
    parameters: [
      {
        name: "TMDB_API_KEY",
        description: "Your API key for The Movie Database (TMDb)",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "bhouston-mcp-server-text-editor",
    title: "mcp-server-text-editor",
    description:
      "An open source implementation of the Claude built-in text editor tool versions:\n\ntext\\_editor\\_20241022 (Claude 3.5 Sonnet)\ntext\\_editor\\_20250124 (Claude 3.7 Sonnet)",
    icon: "https://avatars.githubusercontent.com/bhouston",
    isOfficial: false,
    homepage: "https://github.com/bhouston/mcp-server-text-editor",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y mcp-server-text-editor"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "thedaviddias-mcp-llms-txt-explorer",
    title: "MCP LLMS.txt Explorer",
    description:
      "A server that helps discover and analyze websites implementing the llms.txt standard, allowing users to check if websites have llms.txt files and list known compliant websites.",
    icon: "https://avatars.githubusercontent.com/thedaviddias",
    isOfficial: false,
    homepage: "https://github.com/thedaviddias/mcp-llms-txt-explorer",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @thedaviddias/mcp-llms-txt-explorer"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "flight505-mcp-think-tank",
    title: "MCP Think Tank",
    description:
      "Provides AI assistants with enhanced reasoning capabilities through structured thinking, persistent knowledge graph memory, and intelligent tool orchestration for complex problem-solving.",
    icon: "https://avatars.githubusercontent.com/flight505",
    isOfficial: false,
    homepage: "https://github.com/flight505/mcp-think-tank",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y mcp-think-tank"],
      env: {
        AUTO_LINK: "<auto-link>",
        LOG_LEVEL: "<log-level>",
        MCP_DEBUG: "<mcp-debug>",
        TOOL_LIMIT: "<tool-limit>",
        EXA_API_KEY: "<exa-api-key>",
        MEMORY_PATH: "<memory-path>",
        MCP_LOG_FILE: "<mcp-log-file>",
        CACHE_CONTENT: "<cache-content>",
        MCP_LISTEN_PORT: "<mcp-listen-port>",
        TOOL_CACHE_SIZE: "<tool-cache-size>",
        CACHE_TOOL_CALLS: "<cache-tool-calls>",
        CONTENT_CACHE_TTL: "<content-cache-ttl>",
        CONTENT_CACHE_SIZE: "<content-cache-size>",
        MAX_OPERATION_TIME: "<max-operation-time>",
        MIN_SIMILARITY_SCORE: "<min-similarity-score>",
      },
    },
    parameters: [
      {
        name: "AUTO_LINK",
        description: "Enable automatic entity linking in knowledge graph",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "LOG_LEVEL",
        description: "Set logging level (debug, info, warn, error)",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MCP_DEBUG",
        description: "Enable debug logging",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "TOOL_LIMIT",
        description: "Maximum number of tool calls per session",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "EXA_API_KEY",
        description:
          "API key for Exa web search (required for exa_search and exa_answer tools)",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "MEMORY_PATH",
        description: "Path to the memory storage file",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MCP_LOG_FILE",
        description: "Enable/disable file logging",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "CACHE_CONTENT",
        description:
          "Enable/disable content-based caching for file/URL operations",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MCP_LISTEN_PORT",
        description: "Set custom port for MCP server",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "TOOL_CACHE_SIZE",
        description: "Maximum number of cached tool calls",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "CACHE_TOOL_CALLS",
        description: "Enable/disable duplicate tool call caching",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "CONTENT_CACHE_TTL",
        description: "Time-to-live for cached content in milliseconds",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "CONTENT_CACHE_SIZE",
        description: "Maximum number of items in content cache",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MAX_OPERATION_TIME",
        description: "Maximum time for batch operations in milliseconds",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MIN_SIMILARITY_SCORE",
        description: "Threshold for entity matching",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "cgize-claude-mcp-think-tool",
    title: "MCP Think Tool Server",
    description:
      "Implements Anthropic's 'think' tool for Claude, providing a dedicated space for structured reasoning during complex problem-solving tasks that improves performance in reasoning chains and policy adherence.",
    icon: "https://avatars.githubusercontent.com/cgize",
    isOfficial: false,
    homepage: "https://github.com/cgize/claude-mcp-think-tool",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @cgize/mcp-think-tool"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "superseoworld-mcp-spotify",
    title: "MCP Spotify Server",
    description:
      "Enables interaction with Spotify's music catalog via the Spotify Web API, supporting searches, artist information retrieval, playlist management, and automatic token handling.",
    icon: "https://avatars.githubusercontent.com/superseoworld",
    isOfficial: false,
    homepage: "https://github.com/superseoworld/mcp-spotify",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @thomaswawra/server-spotify"],
      env: {
        SPOTIFY_CLIENT_ID: "<spotify-client-id>",
        SPOTIFY_CLIENT_SECRET: "<spotify-client-secret>",
      },
    },
    parameters: [
      {
        name: "SPOTIFY_CLIENT_ID",
        description:
          "Your Spotify API Client ID obtained from the Spotify Developer Dashboard",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "SPOTIFY_CLIENT_SECRET",
        description:
          "Your Spotify API Client Secret obtained from the Spotify Developer Dashboard",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "tinybirdco-mcp-tinybird",
    title: "Tinybird MCP server",
    description:
      "An MCP server to interact with a Tinybird Workspace from any MCP client.",
    icon: "https://avatars.githubusercontent.com/tinybirdco",
    isOfficial: true,
    homepage: "https://github.com/tinybirdco/mcp-tinybird",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp-tinybird"],
      env: {
        TB_API_URL: "<tb-api-url>",
        TB_ADMIN_TOKEN: "<tb-admin-token>",
      },
    },
    parameters: [
      {
        name: "TB_API_URL",
        description: "Your Tinybird API URL",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "TB_ADMIN_TOKEN",
        description: "Your Tinybird Admin Token",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "manascb1344-together-mcp-server",
    title: "Image Generation MCP Server",
    description:
      "A Model Context Protocol server that enables high-quality image generation using the Flux.1 Schnell model via Together AI with customizable parameters.",
    icon: "https://avatars.githubusercontent.com/manascb1344",
    isOfficial: false,
    homepage: "https://github.com/manascb1344/together-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y together-mcp"],
      env: {
        TOGETHER_API_KEY: "<together-api-key>",
      },
    },
    parameters: [
      {
        name: "TOGETHER_API_KEY",
        description: "Your Together AI API key obtained from api.together.xyz",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "tokenizin-agency-mcp-nativewind",
    title: "mcp-nativewind",
    description: "Rransforms Tailwind components to NativeWind 4.",
    icon: "https://avatars.githubusercontent.com/tokenizin-agency",
    isOfficial: false,
    homepage: "https://github.com/tokenizin-agency/mcp-nativewind",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @tokenizin-com/mcp-server-nativewind"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "tornikegomareli-macos-tools-mcp-server",
    title: "macOS Tools MCP Server",
    description:
      "Provides advanced system monitoring and file search capabilities for macOS, allowing users to track performance metrics and perform enhanced file searches with content analysis and tagging features.",
    icon: "https://avatars.githubusercontent.com/tornikegomareli",
    isOfficial: false,
    homepage: "https://github.com/tornikegomareli/macos-tools-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @tgomareli/macos-tools-mcp"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "truss44-mcp-crypto-price",
    title: "Crypto Price & Market Analysis MCP Server",
    description:
      "A Model Context Protocol (MCP) server that provides comprehensive cryptocurrency analysis using the CoinCap API. This server offers real-time price data, market analysis, and historical trends through an easy-to-use interface.",
    icon: "https://avatars.githubusercontent.com/truss44",
    isOfficial: false,
    homepage: "https://github.com/truss44/mcp-crypto-price",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y mcp-crypto-price"],
      env: {
        COINCAP_API_KEY: "<coincap-api-key>",
      },
    },
    parameters: [
      {
        name: "COINCAP_API_KEY",
        description: "Optional CoinCap API key for higher rate limits",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "tumf-mcp-shell-server",
    title: "mcp-shell-server",
    description:
      "A secure shell command execution server implementing the Model Context Protocol (MCP). This server allows remote execution of whitelisted shell commands with support for stdin input.",
    icon: "https://avatars.githubusercontent.com/tumf",
    isOfficial: false,
    homepage: "https://github.com/tumf/mcp-shell-server",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp-shell-server"],
      env: {
        ALLOW_COMMANDS: "<allow-commands>",
        ALLOWED_COMMANDS: "<allowed-commands>",
      },
    },
    parameters: [
      {
        name: "ALLOW_COMMANDS",
        description:
          "Comma-separated list of commands that are allowed to be executed",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "ALLOWED_COMMANDS",
        description:
          "Alias for ALLOW_COMMANDS - comma-separated list of commands that are allowed to be executed",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "tumf-mcp-text-editor",
    title: "mcp-text-editor",
    description:
      "A line-oriented text file editor. Optimized for LLM tools with efficient partial file access to minimize token usage.",
    icon: "https://avatars.githubusercontent.com/tumf",
    isOfficial: false,
    homepage: "https://github.com/tumf/mcp-text-editor",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp-text-editor"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "turlockmike-apple-notifier-mcp",
    title: "apple-notifier-mcp",
    description:
      "A simple MCP server that can send notifications on mac devices.",
    icon: "https://avatars.githubusercontent.com/turlockmike",
    isOfficial: false,
    homepage: "https://github.com/turlockmike/apple-notifier-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y apple-notifier-mcp"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "turlockmike-mcp-rand",
    title: "MCP Rand",
    description:
      "Provides random number generation utilities, including a secure UUID generator powered by Node's crypto module.",
    icon: "https://avatars.githubusercontent.com/turlockmike",
    isOfficial: false,
    homepage: "https://github.com/turlockmike/mcp-rand",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y mcp-rand"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "umshere-uiflowchartcreator",
    title: "UIFlowchartCreator",
    description:
      "Enables users to create UI flowcharts by generating visualizations of user interfaces and interactions through an easy-to-use API within MCP-compatible systems.",
    icon: "https://avatars.githubusercontent.com/umshere",
    isOfficial: false,
    homepage: "https://github.com/umshere/uiflowchartcreator",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y uiflowchartcreator"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "utensils-mcp-nixos",
    title: "mcp-nixos",
    description:
      "MCP-NixOS is a Model Context Protocol server that provides real-time, accurate information about NixOS packages, options, Home Manager, and nix-darwin configurations, preventing AI assistants from hallucinating about NixOS resources and enabling them to deliver factual system configuration guidance.",
    icon: "https://avatars.githubusercontent.com/utensils",
    isOfficial: false,
    homepage: "https://github.com/utensils/mcp-nixos",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp-nixos"],
      env: {
        KEEP_TEST_CACHE: "<keep-test-cache>",
        ELASTICSEARCH_URL: "<elasticsearch-url>",
        MCP_NIXOS_LOG_FILE: "<mcp-nixos-log-file>",
        MCP_NIXOS_CACHE_DIR: "<mcp-nixos-cache-dir>",
        MCP_NIXOS_CACHE_TTL: "<mcp-nixos-cache-ttl>",
        MCP_NIXOS_LOG_LEVEL: "<mcp-nixos-log-level>",
        MCP_NIXOS_CLEANUP_ORPHANS: "<mcp-nixos-cleanup-orphans>",
      },
    },
    parameters: [
      {
        name: "KEEP_TEST_CACHE",
        description: "Keep test cache directory for debugging (dev-only)",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "ELASTICSEARCH_URL",
        description: "NixOS Elasticsearch API URL",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MCP_NIXOS_LOG_FILE",
        description: "Where to document said failures",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MCP_NIXOS_CACHE_DIR",
        description:
          "Where to store stuff you'll forget about. Default: OS-specific cache locations",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MCP_NIXOS_CACHE_TTL",
        description:
          "How long until cache invalidation ruins your day (in seconds, 24h default)",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MCP_NIXOS_LOG_LEVEL",
        description: "How much you want to know about your failures",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "MCP_NIXOS_CLEANUP_ORPHANS",
        description: "Whether to kill orphaned MCP processes on startup",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "vidhupv-x-mcp",
    title: "X(Twitter) MCP Server",
    description:
      "An MCP server that allows Claude to create, manage and publish X/Twitter posts directly through the chat interface.",
    icon: "https://avatars.githubusercontent.com/vidhupv",
    isOfficial: false,
    homepage: "https://github.com/vidhupv/x-mcp",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["x-mcp"],
      env: {
        TWITTER_API_KEY: "<twitter-api-key>",
        TWITTER_API_SECRET: "<twitter-api-secret>",
        TWITTER_ACCESS_TOKEN: "<twitter-access-token>",
        TWITTER_ACCESS_TOKEN_SECRET: "<twitter-access-token-secret>",
      },
    },
    parameters: [
      {
        name: "TWITTER_API_KEY",
        description: "Your X/Twitter API key (from X API Developer Portal)",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "TWITTER_API_SECRET",
        description: "Your X/Twitter API secret (from X API Developer Portal)",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "TWITTER_ACCESS_TOKEN",
        description:
          "Your X/Twitter access token (from X API Developer Portal)",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "TWITTER_ACCESS_TOKEN_SECRET",
        description:
          "Your X/Twitter access token secret (from X API Developer Portal)",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "vinsidious-whodis-mcp-server",
    title: "Whodis MCP Server",
    description:
      "A Model Context Protocol server that enables AI assistants to check domain name availability using WHOIS lookups.",
    icon: "https://avatars.githubusercontent.com/vinsidious",
    isOfficial: false,
    homepage: "https://github.com/vinsidious/whodis-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y whodis-mcp-server"],
      env: {
        DEBUG: "<debug>",
      },
    },
    parameters: [
      {
        name: "DEBUG",
        description: "Set to true to enable detailed debug logs",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "wazzan-mcp-coincap-jj",
    title: "mcp-coincap-jj",
    description:
      "A Model Context Protocol (MCP) server that provides comprehensive cryptocurrency analysis using the CoinCap API. This server offers real-time price data, market analysis, and historical trends through an easy-to-use interface. Updated to use Coin Cap API v3",
    icon: "https://avatars.githubusercontent.com/wazzan",
    isOfficial: false,
    homepage: "https://github.com/wazzan/mcp-coincap-jj",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @bujaayjaay/mcp-coincap-jj"],
      env: {
        COINCAP_API_KEY: "<coincap-api-key>",
      },
    },
    parameters: [
      {
        name: "COINCAP_API_KEY",
        description: "API key for the CoinCap API v3",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "modelcontextprotocol-servers-whois-mcp",
    title: "Whois MCP",
    description:
      "Enables AI agents to perform WHOIS lookups to retrieve domain registration details, including ownership, registration dates, and availability status without requiring browser searches.",
    icon: "https://avatars.githubusercontent.com/modelcontextprotocol-servers",
    isOfficial: false,
    homepage: "https://github.com/modelcontextprotocol-servers/whois-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @mcp-server/whois-mcp"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "winor30-mcp-server-datadog",
    title: "mcp-server-datadog",
    description:
      "The MCP server provides an interface to the Datadog API, enabling seamless management of incidents, monitoring, logs, dashboards, metrics, traces, and hosts. Its extensible design allows easy integration of additional Datadog APIs for future expansions.",
    icon: "https://avatars.githubusercontent.com/winor30",
    isOfficial: false,
    homepage: "https://github.com/winor30/mcp-server-datadog",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @winor30/mcp-server-datadog"],
      env: {
        DATADOG_SITE: "<datadog-site>",
        DATADOG_API_KEY: "<datadog-api-key>",
        DATADOG_APP_KEY: "<datadog-app-key>",
      },
    },
    parameters: [
      {
        name: "DATADOG_SITE",
        description: "The Datadog site (e.g. datadoghq.eu)",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "DATADOG_API_KEY",
        description: "Your Datadog API key",
        type: "string",
        password: false,
        required: true,
      },
      {
        name: "DATADOG_APP_KEY",
        description: "Your Datadog Application key",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "wopal-cn-mcp-hotnews-server",
    title: "@wopal/mcp-server-hotnews",
    description:
      "A Model Context Protocol server that provides real-time hot trending topics from major Chinese social platforms and news sites.",
    icon: "https://avatars.githubusercontent.com/wopal-cn",
    isOfficial: true,
    homepage: "https://github.com/wopal-cn/mcp-hotnews-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @wopal/mcp-server-hotnews"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "xiaok-etherscan-mcp",
    title: "Etherscan MCP",
    description:
      "An MCP server that provides access to Etherscan blockchain data APIs, allowing users to query Ethereum blockchain information through natural language.",
    icon: "https://avatars.githubusercontent.com/xiaok",
    isOfficial: false,
    homepage: "https://github.com/xiaok/etherscan-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y etherscan-mcp"],
      env: {
        ETHERSCAN_API_KEY: "<etherscan-api-key>",
      },
    },
    parameters: [
      {
        name: "ETHERSCAN_API_KEY",
        description: "Your Etherscan API key",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "xiaolaa2-ableton-copilot-mcp",
    title: "Ableton Copilot MCP",
    description:
      "A Model Context Protocol server that enables real-time interaction with Ableton Live, allowing AI assistants to control song creation, track management, clip operations, and audio recording workflows.",
    icon: "https://avatars.githubusercontent.com/xiaolaa2",
    isOfficial: false,
    homepage: "https://github.com/xiaolaa2/ableton-copilot-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y ableton-copilot-mcp"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "xiaolaa2-midi-file-mcp",
    title: "MIDI File MCP",
    description:
      "A powerful MCP tool for parsing and manipulating MIDI files that allows users to read, analyze, and modify MIDI files through natural language commands, supporting operations like reading file information, modifying tracks, adding notes, and setting tempo.",
    icon: "https://avatars.githubusercontent.com/xiaolaa2",
    isOfficial: false,
    homepage: "https://github.com/xiaolaa2/midi-file-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y midi-file-mcp"],
      env: {},
    },
    parameters: [],
  },
  {
    name: "yuna0x0-hackmd-mcp",
    title: "HackMD MCP Server",
    description:
      "A Model Context Protocol server that enables AI assistants to interact with the HackMD API for managing notes, including creating, reading, updating, and deleting notes.",
    icon: "https://avatars.githubusercontent.com/yuna0x0",
    isOfficial: false,
    homepage: "https://github.com/yuna0x0/hackmd-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y hackmd-mcp"],
      env: {
        HACKMD_API_URL: "<hackmd-api-url>",
        HACKMD_API_TOKEN: "<hackmd-api-token>",
      },
    },
    parameters: [
      {
        name: "HACKMD_API_URL",
        description: "HackMD API Endpoint URL",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "HACKMD_API_TOKEN",
        description: "Your HackMD API token obtained from HackMD settings",
        type: "string",
        password: false,
        required: true,
      },
    ],
  },
  {
    name: "dkmaker-mcp-rest-api",
    title: "mcp-rest-api",
    description:
      "A TypeScript-based MCP server that enables testing of REST APIs through Cline. This tool allows you to test and interact with any REST API endpoints directly from your development environment.",
    icon: "https://avatars.githubusercontent.com/dkmaker",
    isOfficial: false,
    homepage: "https://github.com/dkmaker/mcp-rest-api",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y dkmaker-mcp-rest-api"],
      env: {
        AUTH_BEARER: "<auth-bearer>",
        REST_BASE_URL: "<rest-base-url>",
        AUTH_APIKEY_VALUE: "<auth-apikey-value>",
        AUTH_BASIC_PASSWORD: "<auth-basic-password>",
        AUTH_BASIC_USERNAME: "<auth-basic-username>",
        REST_ENABLE_SSL_VERIFY: "<rest-enable-ssl-verify>",
        AUTH_APIKEY_HEADER_NAME: "<auth-apikey-header-name>",
        REST_RESPONSE_SIZE_LIMIT: "<rest-response-size-limit>",
      },
    },
    parameters: [
      {
        name: "AUTH_BEARER",
        description: "Bearer token for token-based authentication",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "REST_BASE_URL",
        description:
          "Base URL for the REST API (e.g., https://api.example.com)",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "AUTH_APIKEY_VALUE",
        description: "API key value for API key authentication",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "AUTH_BASIC_PASSWORD",
        description: "Password for Basic Authentication",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "AUTH_BASIC_USERNAME",
        description: "Username for Basic Authentication",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "REST_ENABLE_SSL_VERIFY",
        description:
          "Enable or disable SSL verification for self-signed certificates",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "AUTH_APIKEY_HEADER_NAME",
        description: "Header name for API key authentication (e.g., X-API-Key)",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "REST_RESPONSE_SIZE_LIMIT",
        description: "Maximum response size in bytes",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "zhiwei5576-excel-mcp-server",
    title: "Excel MCP Server",
    description:
      "Enables seamless reading, writing, and analyzing of Excel files through Model Context Protocol, with features for worksheet management, structure analysis, and automated caching.",
    icon: "https://avatars.githubusercontent.com/zhiwei5576",
    isOfficial: false,
    homepage: "https://github.com/zhiwei5576/excel-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y @zhiweixu/excel-mcp-server"],
      env: {
        LOG_PATH: "<log-path>",
        CACHE_MAX_AGE: "<cache-max-age>",
        LOG_RETENTION_DAYS: "<log-retention-days>",
        LOG_CLEANUP_INTERVAL: "<log-cleanup-interval>",
        CACHE_CLEANUP_INTERVAL: "<cache-cleanup-interval>",
      },
    },
    parameters: [
      {
        name: "LOG_PATH",
        description:
          "Log files storage path. If not set, logs will be stored in the 'logs' folder under the application root directory.",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "CACHE_MAX_AGE",
        description: "Cache expiration time in hours",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "LOG_RETENTION_DAYS",
        description: "Log retention period in days",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "LOG_CLEANUP_INTERVAL",
        description: "Log cleanup interval in hours",
        type: "string",
        password: false,
        required: false,
      },
      {
        name: "CACHE_CLEANUP_INTERVAL",
        description: "Cache cleanup interval in hours",
        type: "string",
        password: false,
        required: false,
      },
    ],
  },
  {
    name: "zwldarren-akshare-one-mcp",
    title: "akshare-one-mcp",
    description: "akshare-one-mcp",
    icon: "https://avatars.githubusercontent.com/zwldarren",
    isOfficial: false,
    homepage: "https://github.com/zwldarren/akshare-one-mcp",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["akshare-one-mcp"],
      env: {},
    },
    parameters: [],
  },
];
