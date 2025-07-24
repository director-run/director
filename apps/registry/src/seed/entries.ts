import { type EntryCreateParams } from "../db/schema";

// All of these servers work. To add a new one, add it to this list.
// Please test it with bin/test-entry.ts before merging to main
export const entries: EntryCreateParams[] = [
  {
    name: "notion",
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
    name: "supabase",
    title: "Supabase",
    description: "Connect your AI tools to Supabase.",
    isOfficial: true,
    icon: "https://registry.director.run/supabase.svg",
    homepage: "https://github.com/supabase-community/supabase-mcp",
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
    name: "memory",
    title: "Memory",
    description:
      "Build and query persistent semantic networks for data management.",
    isOfficial: false,
    icon: "https://registry.director.run/mcp.svg",
    homepage:
      "https://github.com/modelcontextprotocol/servers/tree/HEAD/src/memory",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-memory"],
      env: {
        MEMORY_FILE_PATH: "<memory-file-path>",
      },
    },
    parameters: [
      {
        name: "memory-file-path",
        description: "The path to the memory file.",
        type: "string",
        required: false,
        password: false,
      },
    ],
  },
  {
    name: "time",
    title: "Time",
    description:
      "MCP server providing time and timezone conversion tools for AI assistants to handle localized time data and calculations.",
    isOfficial: false,
    icon: "https://registry.director.run/mcp.svg",
    homepage:
      "https://github.com/modelcontextprotocol/servers/tree/HEAD/src/time",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp-server-time"],
    },
    parameters: [],
  },
  {
    name: "mindsdb",
    title: "MindsDB",
    description:
      "MindsDB allows applications to answer questions over large-scale federated data—spanning databases, data warehouses, and SaaS applications.",
    isOfficial: true,
    icon: "https://avatars.githubusercontent.com/u/31035808?s=200&v=4",
    homepage: "https://github.com/mindsdb/mindsdb",
    transport: {
      type: "stdio",
      command: "docker",
      args: [
        "run",
        "--name mindsdb_container",
        "-e MINDSDB_APIS=http,mysql,mcp,a2a",
        "-p 47334:47334",
        "-p 47335:47335",
        "-p 47337:47337",
        "-p 47338:47338",
        "mindsdb/mindsdb",
      ],
    },
    parameters: [],
  },
  {
    name: "context-7",
    title: "Context7",
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
    name: "task-master",
    title: "Task Master",
    description:
      "Provides task management capabilities for development workflows with PRD parsing, task CRUD operations with dependency management, complexity analysis, and context-based organization across project phases.",
    isOfficial: false,
    icon: null,
    homepage: "https://github.com/eyaltoledano/claude-task-master",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "--package=task-master-ai", "task-master-ai"],
      env: {
        ANTHROPIC_API_KEY: "<anthropic-api-key>",
        PERPLEXITY_API_KEY: "<perplexity-api-key>",
        OPENAI_API_KEY: "<openai-api-key>",
        GOOGLE_API_KEY: "<google-api-key>",
        MISTRAL_API_KEY: "<mistral-api-key>",
        GROQ_API_KEY: "<groq-api-key>",
        OPENROUTER_API_KEY: "<openrouter-api-key>",
        XAI_API_KEY: "<xai-api-key>",
        AZURE_OPENAI_API_KEY: "<azure-openai-api-key>",
        OLLAMA_API_KEY: "<ollama-api-key>",
      },
    },
    parameters: [
      {
        name: "anthropic-api-key",
        description: "The API key for Anthropic.",
        type: "string",
        required: false,
        password: true,
      },
      {
        name: "perplexity-api-key",
        description: "The API key for Perplexity.",
        type: "string",
        required: false,
        password: true,
      },
      {
        name: "openai-api-key",
        description: "The API key for OpenAI.",
        type: "string",
        required: false,
        password: true,
      },
      {
        name: "google-api-key",
        description: "The API key for Google.",
        type: "string",
        required: false,
        password: true,
      },
      {
        name: "mistral-api-key",
        description: "The API key for Mistral.",
        type: "string",
        required: false,
        password: true,
      },
      {
        name: "groq-api-key",
        description: "The API key for Groq.",
        type: "string",
        required: false,
        password: true,
      },
      {
        name: "openrouter-api-key",
        description: "The API key for OpenRouter.",
        type: "string",
        required: false,
        password: true,
      },
      {
        name: "xai-api-key",
        description: "The API key for XAI.",
        type: "string",
        required: false,
        password: true,
      },
      {
        name: "azure-openai-api-key",
        description: "The API key for Azure OpenAI.",
        type: "string",
        required: false,
        password: true,
      },
      {
        name: "ollama-api-key",
        description: "The API key for Ollama.",
        type: "string",
        required: false,
        password: true,
      },
    ],
  },
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
    name: "repomix",
    title: "RepoMix",
    description:
      "Package codebases into AI-friendly single files with intelligent code structure preservation and token optimization.",
    isOfficial: false,
    icon: null,
    homepage: "https://github.com/yamadashy/repomix",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "repomix", "--mcp"],
    },
    parameters: [],
  },
  {
    name: "screenpipe",
    title: "Screenpipe",
    description:
      "Enable searching and retrieving screen recordings and associated data for productivity tracking, user behavior analysis, and workflow documentation.",
    isOfficial: true,
    icon: null,
    homepage:
      "https://github.com/mediar-ai/screenpipe/tree/HEAD/screenpipe-integrations/screenpipe-mcp",
    transport: {
      type: "stdio",
      command: "uv",
      args: [
        "--directory",
        "<absolute-path-to-screenpipe-mcp>",
        "run",
        "screenpipe-mcp",
      ],
    },
    parameters: [
      {
        name: "absolute-path-to-screenpipe-mcp",
        description: "The absolute path to the screenpipe-mcp directory.",
        type: "string",
        required: true,
        password: false,
      },
    ],
  },
  {
    name: "mastra-docs",
    title: "Mastra Docs",
    description:
      "Provides AI assistants with direct access to Mastra.ai's complete knowledge base.",
    isOfficial: true,
    icon: null,
    homepage:
      "https://github.com/mastra-ai/mastra/tree/HEAD/packages/mcp-docs-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@mastra/mcp-docs-server"],
    },
    parameters: [],
  },
  {
    name: "figma-context",
    title: "Figma Context",
    description:
      "Integrates with Figma's design platform API to enable AI-driven design operations, asset management, and team collaboration within Figma workflows.",
    isOfficial: false,
    icon: null,
    homepage: "https://github.com/glips/figma-context-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: [
        "-y",
        "figma-developer-mcp",
        "--figma-api-key=<figma-api-key>",
        "--stdio",
      ],
    },
    parameters: [
      {
        name: "figma-api-key",
        description: "The API key for Figma.",
        type: "string",
        required: true,
        password: true,
      },
    ],
  },
  {
    name: "cua-mcp-server",
    title: "CUA MCP Server",
    description:
      "Enables LLMs to run Computer-Use Agent (CUA) workflows on Apple Silicon macOS.",
    isOfficial: true,
    icon: "https://avatars.githubusercontent.com/u/191107687?s=200&v=4",
    homepage:
      "https://github.com/trycua/cua/blob/4674651770275e53f91a3f49a6430f48ac7918a1/libs/python/mcp-server/README.md",
    transport: {
      type: "stdio",
      command: "/bin/bash",
      args: ["~/.cua/start_mcp_server.sh"],
      env: {
        CUA_AGENT_LOOP: "<cua-agent-loop>",
        CUA_MODEL_PROVIDER: "<cua-model-provider>",
        CUA_MODEL_NAME: "<cua-model-name>",
        CUA_PROVIDER_API_KEY: "<cua-provider-api-key>",
      },
    },
    parameters: [
      {
        name: "cua-agent-loop",
        description: "The agent loop for CUA.",
        type: "string",
        required: true,
        password: false,
      },
      {
        name: "cua-model-provider",
        description: "The model provider for CUA.",
        type: "string",
        required: true,
        password: false,
      },
      {
        name: "cua-model-name",
        description: "The model name for CUA.",
        type: "string",
        required: true,
        password: false,
      },
      {
        name: "cua-provider-api-key",
        description: "The API key for CUA.",
        type: "string",
        required: true,
        password: true,
      },
    ],
  },
  {
    name: "skyvern",
    title: "Skyvern",
    description:
      "Control your browser with Skyvern's browser automation platform.",
    isOfficial: true,
    icon: "https://avatars.githubusercontent.com/u/141457985?s=200&v=4",
    homepage:
      "https://github.com/skyvern-ai/skyvern/tree/HEAD/integrations/mcp",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["skyvern", "run", "mcp"],
      env: {
        SKYVERN_API_KEY: "<skyvern-api-key>",
        SKYVERN_BASE_URL: "<skyvern-base-url>",
      },
    },
    parameters: [
      {
        name: "skyvern-api-key",
        description: "The API key for Skyvern.",
        type: "string",
        required: true,
        password: true,
      },
      {
        name: "skyvern-base-url",
        description: "The base URL for Skyvern.",
        type: "string",
        required: true,
        password: false,
      },
    ],
  },
  {
    name: "blender",
    title: "Blender",
    description:
      "Enables natural language control of Blender for 3D scene creation, manipulation, and rendering without requiring knowledge of Blender's interface or Python API.",
    isOfficial: false,
    icon: null,
    homepage: "https://github.com/ahujasid/blender-mcp",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["blender-mcp"],
    },
    parameters: [],
  },
  {
    name: "cognee",
    title: "Cognee",
    description:
      "AI-friendly database and knowledge-management capabilities via various database schemes.",
    isOfficial: false,
    icon: null,
    homepage: "https://github.com/topoteretes/cognee/tree/HEAD/cognee-mcp",
    transport: {
      type: "stdio",
      command: "sh",
      args: ["<absolute-path-to-cognee-mcp>/run-cognee.sh"],
    },
    parameters: [
      {
        name: "absolute-path-to-cognee-mcp",
        description: "The absolute path to the cognee-mcp directory.",
        type: "string",
        required: true,
        password: false,
      },
    ],
  },
  {
    name: "arize-phoenix",
    title: "Arize Phoenix",
    description:
      "Provides a unified interface to Arize Phoenix's capabilities for managing prompts, exploring datasets, and running experiments across different LLM providers",
    isOfficial: true,
    icon: "https://avatars.githubusercontent.com/u/59858760?s=200&v=4",
    homepage:
      "https://github.com/arize-ai/phoenix/tree/HEAD/js/packages/phoenix-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: [
        "-y",
        "@arizeai/phoenix-mcp@latest",
        "--baseUrl",
        "<arize-phoenix-base-url>",
        "--apiKey",
        "<arize-phoenix-api-key>",
      ],
    },
    parameters: [
      {
        name: "arize-phoenix-base-url",
        description: "The base URL for Arize Phoenix.",
        type: "string",
        required: true,
        password: false,
      },
      {
        name: "arize-phoenix-api-key",
        description: "The API key for Arize Phoenix.",
        type: "string",
        required: true,
        password: true,
      },
    ],
  },
  {
    name: "browser-tools",
    title: "Browser Tools",
    description:
      "Enables browser data capture and analysis with tools for retrieving console logs, monitoring network requests, capturing screenshots, selecting DOM elements, and running Lighthouse audits for web application debugging and performance optimization.",
    isOfficial: false,
    icon: null,
    homepage: "https://github.com/agentdeskai/browser-tools-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@agentdeskai/browser-tools-mcp@latest"],
    },
    parameters: [],
  },
  {
    name: "zen",
    title: "Zen",
    description:
      "Give your development workflow access to all state of the art AI models for enhanced code analysis, problem-solving, and collaborative development.",
    isOfficial: false,
    icon: null,
    homepage: "https://github.com/beehiveinnovations/zen-mcp-server",
    transport: {
      type: "stdio",
      command: "uvx",
      args: [
        "--from",
        "git+https://github.com/BeehiveInnovations/zen-mcp-server.git",
        "zen-mcp-server",
      ],
      env: {
        PATH: "/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin:~/.local/bin",
        OPENAI_API_KEY: "<openai-api-key>",
        GEMINI_API_KEY: "<gemini-api-key>",
        XAI_API_KEY: "<xai-api-key>",
        DIAL_API_KEY: "<dial-api-key>",
        OPENROUTER_API_KEY: "<openrouter-api-key>",
        CUSTOM_API_URL: "<custom-api-url>",
      },
    },
    parameters: [
      {
        name: "openai-api-key",
        description: "The API key for OpenAI.",
        type: "string",
        required: false,
        password: true,
      },
      {
        name: "gemini-api-key",
        description: "The API key for Gemini.",
        type: "string",
        required: false,
        password: true,
      },
      {
        name: "xai-api-key",
        description: "The API key for XAI.",
        type: "string",
        required: false,
        password: true,
      },
      {
        name: "dial-api-key",
        description: "The API key for Dial.",
        type: "string",
        required: false,
        password: true,
      },
      {
        name: "openrouter-api-key",
        description: "The API key for OpenRouter.",
        type: "string",
        required: false,
        password: true,
      },
      {
        name: "custom-api-url",
        description: "The URL for local models.",
        type: "string",
        required: false,
        password: false,
      },
    ],
  },
  {
    name: "jsondiffpatch",
    title: "JsonDiffPatch",
    description:
      "Compares and patches JSON objects with a compact delta format that captures additions, modifications, deletions, and array moves for efficient data synchronization and change visualization.",
    isOfficial: false,
    icon: null,
    homepage:
      "https://github.com/benjamine/jsondiffpatch/tree/HEAD/packages/diff-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "diff-mcp"],
    },
    parameters: [],
  },
  {
    name: "aws-bedrock-knowledge-base-retrieval",
    title: "AWS Bedrock Knowledge Base Retrieval",
    description: "Bridge to access Amazon Bedrock Knowledge Bases.",
    isOfficial: true,
    icon: "https://avatars.githubusercontent.com/u/3299148?s=200&v=4",
    homepage:
      "https://github.com/awslabs/mcp/tree/HEAD/src/bedrock-kb-retrieval-mcp-server",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["awslabs.bedrock-kb-retrieval-mcp-server@latest"],
      env: {
        AWS_PROFILE: "<aws-profile>",
        AWS_REGION: "<aws-region>",
        FASTMCP_LOG_LEVEL: "<fastmcp-log-level>",
        KB_INCLUSION_TAG_KEY: "<kb-inclusion-tag-key>",
        BEDROCK_KB_RERANKING_ENABLED: "<bedrock-kb-reranking-enabled>",
      },
    },
    parameters: [
      {
        name: "aws-profile",
        description: "The AWS profile to use.",
        type: "string",
        required: true,
        password: false,
      },
      {
        name: "aws-region",
        description: "The AWS region to use. (e.g. 'us-east-1')",
        type: "string",
        required: true,
        password: false,
      },
      {
        name: "fastmcp-log-level",
        description: "The log level for FastMCP. (e.g. 'ERROR')",
        type: "string",
        required: true,
        password: false,
      },
      {
        name: "kb-inclusion-tag-key",
        description: "The tag key for KB inclusion.",
        type: "string",
        required: false,
        password: false,
      },
      {
        name: "bedrock-kb-reranking-enabled",
        description: "The reranking enabled for Bedrock KB. (e.g. 'false')",
        type: "string",
        required: false,
        password: false,
      },
    ],
  },
  {
    name: "aws-cloud-development-kit",
    title: "AWS Cloud Development Kit",
    description:
      "Integration for AWS Cloud Development Kit (CDK) best practices, infrastructure as code patterns, and security compliance with CDK Nag.",
    isOfficial: true,
    icon: "https://avatars.githubusercontent.com/u/3299148?s=200&v=4",
    homepage: "https://github.com/awslabs/mcp/tree/HEAD/src/cdk-mcp-server",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["awslabs.cdk-mcp-server@latest"],
      env: {
        FASTMCP_LOG_LEVEL: "<fastmcp-log-level>",
      },
    },
    parameters: [
      {
        name: "fastmcp-log-level",
        description: "The log level for FastMCP. (e.g. 'ERROR')",
        type: "string",
        required: true,
        password: false,
      },
    ],
  },
  {
    name: "aws-cost-explorer",
    title: "AWS Cost Explorer",
    description:
      "Analyzing AWS costs and usage data through the AWS Cost Explorer API.",
    isOfficial: true,
    icon: "https://avatars.githubusercontent.com/u/3299148?s=200&v=4",
    homepage:
      "https://github.com/awslabs/mcp/tree/main/src/cost-explorer-mcp-server",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["awslabs.cost-explorer-mcp-server@latest"],
      env: {
        FASTMCP_LOG_LEVEL: "<fastmcp-log-level>",
        AWS_PROFILE: "<aws-profile>",
      },
    },
    parameters: [
      {
        name: "fastmcp-log-level",
        description: "The log level for FastMCP. (e.g. 'ERROR')",
        type: "string",
        required: true,
        password: false,
      },
      {
        name: "aws-profile",
        description: "The AWS profile to use.",
        type: "string",
        required: true,
        password: false,
      },
    ],
  },
  {
    name: "aws-documentation",
    title: "AWS Documentation",
    description:
      "Provides tools to access AWS documentation, search for content, and get recommendations.",
    isOfficial: true,
    icon: "https://avatars.githubusercontent.com/u/3299148?s=200&v=4",
    homepage:
      "https://github.com/awslabs/mcp/tree/HEAD/src/aws-documentation-mcp-server",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["awslabs.aws-documentation-mcp-server@latest"],
      env: {
        FASTMCP_LOG_LEVEL: "<fastmcp-log-level>",
        AWS_DOCUMENTATION_PARTITION: "<aws-documentation-partition>",
      },
    },
    parameters: [
      {
        name: "fastmcp-log-level",
        description: "The log level for FastMCP. (e.g. 'ERROR')",
        type: "string",
        required: true,
        password: false,
      },
      {
        name: "aws-documentation-partition",
        description: "The AWS partition to use. (e.g. 'aws')",
        type: "string",
        required: true,
        password: false,
      },
    ],
  },
  {
    name: "aws-nova-canvas",
    title: "AWS Nova Canvas",
    description: "Generate images using Amazon Nova Canvas.",
    isOfficial: true,
    icon: "https://avatars.githubusercontent.com/u/3299148?s=200&v=4",
    homepage:
      "https://github.com/awslabs/mcp/tree/HEAD/src/nova-canvas-mcp-server",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["awslabs.nova-canvas-mcp-server@latest"],
      env: {
        AWS_PROFILE: "<aws-profile>",
        AWS_REGION: "<aws-region>",
        FASTMCP_LOG_LEVEL: "<fastmcp-log-level>",
      },
    },
    parameters: [
      {
        name: "fastmcp-log-level",
        description: "The log level for FastMCP. (e.g. 'ERROR')",
        type: "string",
        required: true,
        password: false,
      },
      {
        name: "aws-profile",
        description: "The AWS profile to use.",
        type: "string",
        required: true,
        password: false,
      },
      {
        name: "aws-region",
        description: "The AWS region to use. (e.g. 'us-east-1')",
        type: "string",
        required: true,
        password: false,
      },
    ],
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
    name: "serena",
    title: "Serena",
    description:
      "Provides intelligent code analysis and manipulation across multiple programming languages through language server protocols, enabling developers to explore, understand, and refactor complex codebases.",
    isOfficial: false,
    icon: null,
    homepage: "https://github.com/oraios/serena",
    transport: {
      type: "stdio",
      command: "uvx",
      args: [
        "--from",
        "git+https://github.com/oraios/serena",
        "serena-mcp-server",
      ],
    },
    parameters: [],
  },
  {
    name: "mcp-playwright",
    title: "Playwright",
    description:
      "Automate web browsers for testing, scraping, and visual analysis.",
    isOfficial: false,
    icon: null,
    homepage: "https://github.com/executeautomation/mcp-playwright",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@executeautomation/playwright-mcp-server"],
    },
    parameters: [],
  },
  {
    name: "cli-desktop-commander",
    title: "CLI (Desktop Commander)",
    description:
      "Integrates terminal and filesystem capabilities for executing system commands, managing processes, and performing advanced file operations on the local system.",
    isOfficial: false,
    icon: null,
    homepage: "https://github.com/wonderwhy-er/desktopcommandermcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@wonderwhy-er/desktop-commander"],
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
    name: "cloudflare-dns-analytics",
    title: "Cloudflare DNS Analytics",
    description:
      "Integrates tools powered by the Cloudflare DNS Analytics API to provide insights on DNS analytics and optimization.",
    isOfficial: true,
    icon: "https://cdn.simpleicons.org/cloudflare",
    homepage:
      "https://github.com/cloudflare/mcp-server-cloudflare/tree/HEAD/apps/dns-analytics",
    transport: {
      url: "https://dns-analytics.mcp.cloudflare.com/sse",
      type: "http",
    },
    parameters: [],
  },
  {
    name: "n8n",
    title: "n8n",
    description:
      "Integrates with n8n workflow automation platform to provide conversational access to 525+ nodes including AI-capable nodes and triggers, enabling natural language workflow creation, validation, and management without requiring direct platform knowledge.",
    isOfficial: false,
    icon: null,
    homepage: "https://github.com/czlonkowski/n8n-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["n8n-mcp"],
      env: {
        MCP_MODE: "stdio",
        LOG_LEVEL: "<log-level>",
        DISABLE_CONSOLE_OUTPUT: "<disable-console-output>",
        N8N_API_URL: "<n8n-api-url>",
        N8N_API_KEY: "<n8n-api-key>",
      },
    },
    parameters: [
      {
        name: "log-level",
        description: "The log level for n8n-mcp. (e.g. 'error')",
        type: "string",
        required: true,
        password: false,
      },
      {
        name: "disable-console-output",
        description: "Whether to disable console output. (e.g. 'true')",
        type: "string",
        required: true,
        password: false,
      },
      {
        name: "n8n-api-url",
        description:
          "The URL of the n8n instance. (e.g. 'https://your-n8n-instance.com')",
        type: "string",
        required: false,
        password: false,
      },
      {
        name: "n8n-api-key",
        description: "The API key for the n8n instance. (e.g. 'your-api-key')",
        type: "string",
        required: false,
        password: true,
      },
    ],
  },
  {
    name: "firecrawl",
    title: "FireCrawl",
    description:
      "Integration with FireCrawl to provide advanced web scraping capabilities for extracting structured data from complex websites.",
    isOfficial: true,
    icon: "https://avatars.githubusercontent.com/u/135057108?s=200&v=4",
    homepage: "https://github.com/mendableai/firecrawl-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "firecrawl-mcp"],
      env: {
        FIRECRAWL_API_KEY: "<firecrawl-api-key>",
      },
    },
    parameters: [
      {
        name: "firecrawl-api-key",
        description: "The API key for FireCrawl.",
        type: "string",
        required: true,
        password: true,
      },
    ],
  },
  {
    name: "magic-21st.dev",
    title: "Magic (21st.dev)",
    description:
      "Create beautiful, modern UI components instantly through natural language descriptions.",
    isOfficial: true,
    icon: "https://avatars.githubusercontent.com/u/199367026?s=200&v=4",
    homepage: "https://github.com/21st-dev/magic-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@21st-dev/magic@latest", 'API_KEY="<magic-ui-api-key>"'],
    },
    parameters: [
      {
        name: "magic-ui-api-key",
        description: "The API key for Magic UI.",
        type: "string",
        required: true,
        password: true,
      },
    ],
  },
  {
    name: "vizro",
    title: "Vizro",
    description:
      "Enables creation and validation of data visualization dashboards through natural language by generating chart code, validating configurations, and producing interactive Vizro visualizations with PyCafe preview links.",
    isOfficial: false,
    icon: null,
    homepage: "https://github.com/mckinsey/vizro/tree/HEAD/vizro-mcp",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["vizro-mcp"],
    },
    parameters: [],
  },
  {
    name: "cloudflare-ai-gateway",
    title: "Cloudflare AI Gateway",
    description:
      "Cloudflare's AI Gateway allows you to gain visibility and control over your AI apps. By connecting your apps to AI Gateway, you can gather insights on how people are using your application.",
    isOfficial: true,
    icon: "https://cdn.simpleicons.org/cloudflare",
    homepage:
      "https://github.com/cloudflare/mcp-server-cloudflare/tree/HEAD/apps/ai-gateway",
    transport: {
      url: "https://ai-gateway.mcp.cloudflare.com/sse",
      type: "http",
    },
    parameters: [],
  },
  {
    name: "cloudflare-audit-logs",
    title: "Cloudflare Audit Logs",
    description:
      "Audit logs summarize the history of changes made within your Cloudflare account. Audit logs include account level actions like zone configuration changes.",
    isOfficial: true,
    icon: "https://cdn.simpleicons.org/cloudflare",
    homepage:
      "https://github.com/cloudflare/mcp-server-cloudflare/tree/HEAD/apps/auditlogs",
    transport: {
      url: "https://auditlogs.mcp.cloudflare.com/sse",
      type: "http",
    },
    parameters: [],
  },
  {
    name: "cloudflare-autorag",
    title: "Cloudflare AutoRAG",
    description:
      "Create fully-managed RAG pipelines to power your AI applications with accurate and up-to-date information.",
    isOfficial: true,
    icon: "https://cdn.simpleicons.org/cloudflare",
    homepage:
      "https://github.com/cloudflare/mcp-server-cloudflare/tree/HEAD/apps/autorag",
    transport: {
      url: "https://autorag.mcp.cloudflare.com/sse",
      type: "http",
    },
    parameters: [],
  },
  {
    name: "cloudflare-browser-rendering",
    title: "Cloudflare Browser Rendering",
    description:
      "Browser automation for Cloudflare Workers and quick browser actions.",
    isOfficial: true,
    icon: "https://cdn.simpleicons.org/cloudflare",
    homepage:
      "https://github.com/cloudflare/mcp-server-cloudflare/tree/HEAD/apps/browser-rendering",
    transport: {
      url: "https://browser.mcp.cloudflare.com/sse",
      type: "http",
    },
    parameters: [],
  },
  {
    name: "sandbox-container",
    title: "Sandbox Container",
    description:
      "Provides a secure, sandboxed environment for executing Python, Node.js, and shell commands in ephemeral containers with file management capabilities for code testing, visualization, and data analysis.",
    isOfficial: true,
    icon: "https://cdn.simpleicons.org/cloudflare",
    homepage:
      "https://github.com/cloudflare/mcp-server-cloudflare/tree/HEAD/apps/sandbox-container",
    transport: {
      url: "https://containers.mcp.cloudflare.com/sse",
      type: "http",
    },
    parameters: [],
  },
  {
    name: "cloudflare-dex-analysis",
    title: "Cloudflare Dex Analysis",
    description:
      "Digital Experience Monitoring (DEX) provides visibility into device, network, and application performance across your Zero Trust organization.",
    isOfficial: true,
    icon: "https://cdn.simpleicons.org/cloudflare",
    homepage:
      "https://github.com/cloudflare/mcp-server-cloudflare/tree/HEAD/apps/dex-analysis",
    transport: {
      url: "https://dex.mcp.cloudflare.com/sse",
      type: "http",
    },
    parameters: [],
  },

  {
    name: "cloudflare-documentation",
    title: "Cloudflare Documentation",
    description:
      "Connects AI systems to Cloudflare's documentation through Vectorize, enabling semantic search and retrieval of relevant content about Cloudflare products and services.",
    isOfficial: true,
    icon: "https://cdn.simpleicons.org/cloudflare",
    homepage:
      "https://github.com/cloudflare/mcp-server-cloudflare/tree/HEAD/apps/docs-vectorize",
    transport: {
      url: "https://docs.mcp.cloudflare.com/sse",
      type: "http",
    },
    parameters: [],
  },
  {
    name: "cloudflare-logpush",
    title: "Cloudflare Logpush",
    description:
      "Enables AI assistants to retrieve and manage Cloudflare Logpush jobs across multiple accounts, providing tools for monitoring and troubleshooting log delivery pipelines through conversational interfaces.",
    isOfficial: true,
    icon: "https://cdn.simpleicons.org/cloudflare",
    homepage:
      "https://github.com/cloudflare/mcp-server-cloudflare/tree/HEAD/apps/logpush",
    transport: {
      url: "https://logs.mcp.cloudflare.com/sse",
      type: "http",
    },
    parameters: [],
  },
  {
    name: "cloudflare-radar",
    title: "Cloudflare Radar",
    description: "Access to Cloudflare's data on global Internet traffic",
    isOfficial: true,
    icon: "https://cdn.simpleicons.org/cloudflare",
    homepage:
      "https://github.com/cloudflare/mcp-server-cloudflare/tree/HEAD/apps/radar",
    transport: {
      url: "https://radar.mcp.cloudflare.com/sse",
      type: "http",
    },
    parameters: [],
  },
  {
    name: "cloudflare-workers-via-bindings",
    title: "Cloudflare Workers (via Bindings)",
    description:
      "Integrates tools for managing resources in the Cloudflare Workers Platform.",
    isOfficial: true,
    icon: "https://cdn.simpleicons.org/cloudflare",
    homepage:
      "https://github.com/cloudflare/mcp-server-cloudflare/tree/HEAD/apps/workers-bindings",
    transport: {
      url: "https://bindings.mcp.cloudflare.com/sse",
      type: "http",
    },
    parameters: [],
  },
  {
    name: "cloudflare-workers-observability",
    title: "Cloudflare Workers Observability",
    description:
      "Understand how your Worker projects are performing via logs, traces, and other data sources.",
    isOfficial: true,
    icon: "https://cdn.simpleicons.org/cloudflare",
    homepage:
      "https://github.com/cloudflare/mcp-server-cloudflare/tree/HEAD/apps/workers-observability",
    transport: {
      url: "https://observability.mcp.cloudflare.com/sse",
      type: "http",
    },
    parameters: [],
  },
  {
    name: "demo-everything",
    title: "Demo (Everything)",
    description: "Test protocol features and tools for client compatibility.",
    isOfficial: false,
    icon: null,
    homepage:
      "https://github.com/modelcontextprotocol/servers/tree/HEAD/src/everything",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-everything"],
    },
    parameters: [],
  },
  {
    name: "lingo.dev-translation",
    title: "Lingo.dev (Translation)",
    description:
      "Enables multilingual content translation for app localization, website content, and text data through a translate tool accessible via npx command with Lingo.dev API key",
    isOfficial: true,
    icon: "https://avatars.githubusercontent.com/u/155387533?s=200&v=4",
    homepage: "https://github.com/lingodotdev/lingo.dev",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "lingo.dev", "mcp", "<lingo-api-key>"],
    },
    parameters: [
      {
        name: "lingo-api-key",
        description: "The API key for Lingo.dev.",
        type: "string",
        required: true,
        password: true,
      },
    ],
  },
  {
    name: "container-use",
    title: "Container Use",
    description:
      "Provides containerized development environments that persist state across interactions through git-based storage and Dagger's container runtime, enabling isolated environments with custom toolchains, background services, and the ability to checkpoint environments as publishable container images.",
    isOfficial: false,
    icon: null,
    homepage: "https://github.com/dagger/container-use",
    transport: {
      type: "stdio",
      command: "container-use",
      args: ["stdio"],
    },
    parameters: [],
  },
  {
    name: "atlassian-cloud",
    title: "Atlassian Cloud",
    description: "Access Confluence pages and Jira issues via Atlassian API.",
    isOfficial: false,
    icon: null,
    homepage: "https://github.com/sooperset/mcp-atlassian",
    transport: {
      type: "stdio",
      command: "docker",
      args: [
        "run",
        "-i",
        "--rm",
        "-e",
        "CONFLUENCE_URL",
        "-e",
        "CONFLUENCE_USERNAME",
        "-e",
        "CONFLUENCE_API_TOKEN",
        "-e",
        "JIRA_URL",
        "-e",
        "JIRA_USERNAME",
        "-e",
        "JIRA_API_TOKEN",
        "ghcr.io/sooperset/mcp-atlassian:latest",
      ],
      env: {
        CONFLUENCE_URL: "<confluence-url>",
        CONFLUENCE_USERNAME: "<confluence-username>",
        CONFLUENCE_API_TOKEN: "<confluence-api-token>",
        JIRA_URL: "<jira-url>",
        JIRA_USERNAME: "<jira-username>",
        JIRA_API_TOKEN: "<jira-api-token>",
      },
    },
    parameters: [
      {
        name: "confluence-url",
        description: "The URL of the Confluence instance.",
        type: "string",
        required: true,
        password: false,
      },
      {
        name: "confluence-username",
        description: "The username for the Confluence instance.",
        type: "string",
        required: true,
        password: false,
      },
      {
        name: "confluence-api-token",
        description: "The API token for the Confluence instance.",
        type: "string",
        required: true,
        password: true,
      },
      {
        name: "jira-url",
        description: "The URL of the Jira instance.",
        type: "string",
        required: true,
        password: false,
      },
      {
        name: "jira-username",
        description: "The username for the Jira instance.",
        type: "string",
        required: true,
        password: false,
      },
      {
        name: "jira-api-token",
        description: "The API token for the Jira instance.",
        type: "string",
        required: true,
        password: true,
      },
    ],
  },
  {
    name: "browserbase",
    title: "Browserbase",
    description: "Automate web browsers remotely on a cloud environment.",
    isOfficial: false,
    icon: null,
    homepage: "https://github.com/browserbase/mcp-server-browserbase",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["@browserbasehq/mcp"],
      env: {
        BROWSERBASE_API_KEY: "<browserbase-api-key>",
        BROWSERBASE_PROJECT_ID: "<browserbase-project-id>",
        GEMINI_API_KEY: "<gemini-api-key>",
      },
    },
    parameters: [
      {
        name: "browserbase-api-key",
        description: "The API key for the Browserbase instance.",
        type: "string",
        required: true,
        password: true,
      },
      {
        name: "browserbase-project-id",
        description: "The project ID for the Browserbase instance.",
        type: "string",
        required: true,
        password: false,
      },
      {
        name: "gemini-api-key",
        description: "The API key for the Gemini instance.",
        type: "string",
        required: true,
        password: true,
      },
    ],
  },
  {
    name: "apple-native-tools",
    title: "Apple Native Tools",
    description:
      "Integrates with Apple's native applications to enable searching contacts, managing notes, and sending messages within the macOS ecosystem.",
    isOfficial: false,
    icon: null,
    homepage: "https://github.com/supermemoryai/apple-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@dhravya/apple-mcp@latest"],
    },
    parameters: [],
  },
  {
    name: "xcodebuild",
    title: "XcodeBuild",
    description:
      "Enables building, running, and debugging iOS and macOS applications through Xcode with tools for project discovery, simulator management, app deployment, and UI automation testing.",
    isOfficial: false,
    icon: null,
    homepage: "https://github.com/cameroncooke/xcodebuildmcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "xcodebuildmcp@latest"],
    },
    parameters: [],
  },
  {
    name: "antv-chart-generator",
    title: "AntV Chart Generator",
    description:
      "Enables AI to generate data visualizations using AntV's charting capabilities, supporting various chart types from structured data without requiring direct knowledge of visualization libraries.",
    isOfficial: false,
    icon: null,
    homepage: "https://github.com/antvis/mcp-server-chart",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@antv/mcp-server-chart"],
    },
    parameters: [],
  },
  {
    name: "sourcebot",
    title: "Sourcebot",
    description:
      "Enables code search across multiple repository hosts including GitHub, GitLab, Gitea, Gerrit, and Bitbucket with advanced filtering options for exploring large codebases through natural language queries.",
    isOfficial: false,
    icon: null,
    homepage: "https://github.com/sourcebot-dev/sourcebot",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@sourcebot/mcp@latest"],
      env: {
        SOURCEBOT_HOST: "<sourcebot-host>",
      },
    },
    parameters: [
      {
        name: "sourcebot-host",
        description: "The host of the Sourcebot instance.",
        type: "string",
        required: false,
        password: false,
      },
    ],
  },
  {
    name: "exa-web-search",
    title: "Exa Web Search",
    description: "Query Exa API to retrieve structured search results.",
    isOfficial: false,
    icon: "https://avatars.githubusercontent.com/u/77906174?s=200&v=4",
    homepage: "https://github.com/exa-labs/exa-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "exa-mcp-server"],
      env: {
        EXA_API_KEY: "<exa-api-key>",
      },
    },
    parameters: [
      {
        name: "exa-api-key",
        description: "The API key for the Exa instance.",
        type: "string",
        required: true,
        password: true,
      },
    ],
  },
  {
    name: "postgrest-supabase",
    title: "PostgREST (Supabase)",
    description:
      "Connects to Supabase projects using PostgREST, or standalone PostgREST servers, enabling natural language querying and management of PostgreSQL data.",
    isOfficial: false,
    icon: null,
    homepage:
      "https://github.com/supabase-community/supabase-mcp/tree/HEAD/packages/mcp-server-postgrest",
    transport: {
      type: "stdio",
      command: "npx",
      args: [
        "-y",
        "@supabase/mcp-server-postgrest@latest",
        "--apiUrl",
        "<supabase-url>/rest/v1",
        "--apiKey",
        "<supabase-anon-key>",
        "--schema",
        "<database-schema>",
      ],
    },
    parameters: [
      {
        name: "supabase-url",
        description: "The URL of the Supabase instance.",
        type: "string",
        required: true,
        password: false,
      },
      {
        name: "supabase-anon-key",
        description: "The anonymous key of the Supabase instance.",
        type: "string",
        required: true,
        password: true,
      },
      {
        name: "database-schema",
        description: "The schema of the database. (e.g: 'public')",
        type: "string",
        required: false,
        password: false,
      },
    ],
  },
  {
    name: "ableton-live",
    title: "Ableton Live",
    description:
      "Enables control of Ableton Live music production software through a bidirectional communication system that supports track creation, MIDI editing, playback control, instrument loading, and library browsing for music composition and sound design workflows.",
    isOfficial: false,
    icon: null,
    homepage: "https://github.com/ahujasid/ableton-mcp",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["ableton-mcp"],
    },
    parameters: [],
  },
  {
    name: "excel-file-manipulation",
    title: "Excel File Manipulation",
    description:
      "Enables Excel file manipulation without Microsoft Excel installation using openpyxl, providing workbook operations, data validation detection, formatting, formulas, charts, pivot tables, and native Excel table support for automating spreadsheet workflows and report generation.",
    isOfficial: false,
    icon: null,
    homepage: "https://github.com/haris-musa/excel-mcp-server",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["excel-mcp-server", "stdio"],
    },
    parameters: [],
  },
  {
    name: "obsidian",
    title: "Obsidian",
    description: "Access and modify notes in Obsidian vaults via REST API.",
    isOfficial: false,
    icon: null,
    homepage: "https://github.com/markuspfundstein/mcp-obsidian",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp-obsidian"],
      env: {
        OBSIDIAN_API_KEY: "<obsidian-api-key>",
        OBSIDIAN_HOST: "<obsidian-host>",
        OBSIDIAN_PORT: "<obsidian-port>",
      },
    },
    parameters: [
      {
        name: "obsidian-api-key",
        description: "The API key for the Obsidian instance.",
        type: "string",
        required: true,
        password: true,
      },
      {
        name: "obsidian-host",
        description: "The host of the Obsidian instance.",
        type: "string",
        required: true,
        password: false,
      },
      {
        name: "obsidian-port",
        description: "The port of the Obsidian instance.",
        type: "string",
        required: true,
        password: false,
      },
    ],
  },
  {
    name: "clerk",
    title: "Clerk",
    description:
      "Manage Clerk's authentication and user management organization management, session handling, and authorization features.",
    isOfficial: true,
    icon: "https://cdn.simpleicons.org/clerk",
    homepage:
      "https://github.com/clerk/javascript/tree/HEAD/packages/agent-toolkit",
    transport: {
      type: "stdio",
      command: "npx",
      args: [
        "-y",
        "@clerk/agent-toolkit",
        "-p=local-mcp",
        "--tools=users",
        "--secret-key=<clerk-secret-key>",
      ],
    },
    parameters: [
      {
        name: "clerk-secret-key",
        description: "The secret key for the Clerk instance.",
        type: "string",
        required: true,
        password: true,
      },
    ],
  },
  {
    name: "mobile-device-control",
    title: "Mobile Device Control",
    description:
      "Enables remote control of Android and iOS devices through commands for screenshots, app management, screen interactions, and UI navigation, ideal for automated testing and demonstrations.",
    isOfficial: false,
    icon: null,
    homepage: "https://github.com/mobile-next/mobile-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@mobilenext/mobile-mcp@latest"],
    },
    parameters: [],
  },
  {
    name: "arxiv",
    title: "ArXiv",
    description:
      "Search and analyze academic papers from the arXiv repository.",
    isOfficial: false,
    icon: null,
    homepage: "https://github.com/blazickjp/arxiv-mcp-server",
    transport: {
      type: "stdio",
      command: "uv",
      args: [
        "tool",
        "run",
        "arxiv-mcp-server",
        "--storage-path",
        "<arxiv-storage-path>",
      ],
    },
    parameters: [
      {
        name: "arxiv-storage-path",
        description:
          "The path to the storage for the ArXiv instance. (e.g: '/path/to/paper/storage')",
        type: "string",
        required: true,
        password: false,
      },
    ],
  },
  {
    name: "perplexity",
    title: "Perplexity",
    description:
      "Connector for the Perplexity API, to enable web search without leaving the MCP ecosystem.",
    isOfficial: true,
    icon: "https://cdn.simpleicons.org/perplexity",
    homepage: "https://github.com/ppl-ai/modelcontextprotocol",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "server-perplexity-ask"],
      env: {
        PERPLEXITY_API_KEY: "<perplexity-api-key>",
      },
    },
    parameters: [
      {
        name: "perplexity-api-key",
        description: "The API key for the Perplexity instance.",
        type: "string",
        required: true,
        password: true,
      },
    ],
  },
  {
    name: "basic-memory",
    title: "Basic Memory",
    description:
      "Knowledge management system that builds a persistent semantic graph in markdown, locally.",
    isOfficial: false,
    icon: "https://avatars.githubusercontent.com/u/88632318?s=200&v=4",
    homepage: "https://github.com/basicmachines-co/basic-memory",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["basic-memory", "mcp"],
    },
    parameters: [],
  },
  {
    name: "mcp-installer",
    title: "MCP Installer",
    description: "Install and configure additional MCP servers dynamically.",
    isOfficial: false,
    icon: null,
    homepage: "https://github.com/anaisbetts/mcp-installer",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["@anaisbetts/mcp-installer"],
    },
    parameters: [],
  },
  {
    name: "opendia",
    title: "OpenDia",
    description:
      "Provides OpenDia diagram creation capabilities through a lightweight web server with WebSocket support and HTTP API endpoints for real-time collaborative diagram generation and editing.",
    isOfficial: false,
    icon: null,
    homepage: "https://github.com/aaronjmars/opendia",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["opendia"],
    },
    parameters: [],
  },
  {
    name: "grafana",
    title: "Grafana",
    description:
      "Integrates with Grafana to enable searching dashboards, fetching datasource information, querying Prometheus metrics, and managing incidents through both stdio and SSE transport modes.",
    isOfficial: true,
    icon: "https://cdn.simpleicons.org/grafana",
    homepage: "https://github.com/grafana/mcp-grafana",
    transport: {
      type: "stdio",
      command: "docker",
      args: [
        "run",
        "--rm",
        "-i",
        "-e",
        "GRAFANA_URL",
        "-e",
        "GRAFANA_API_KEY",
        "mcp/grafana",
        "-t",
        "stdio",
      ],
      env: {
        GRAFANA_URL: "<grafana-url>",
        GRAFANA_API_KEY: "<grafana-api-key>",
      },
    },
    parameters: [
      {
        name: "grafana-url",
        description: "The URL of the Grafana instance.",
        type: "string",
        required: true,
        password: false,
      },
      {
        name: "grafana-api-key",
        description: "The API key for the Grafana instance.",
        type: "string",
        required: true,
        password: true,
      },
    ],
  },
  {
    name: "web-ux-evaluator",
    title: "Web UX Evaluator",
    description:
      "Enables automated browser interactions for evaluating web application user experiences, capturing console logs and network requests to generate detailed usability reports and recommendations.",
    isOfficial: true,
    icon: "https://avatars.githubusercontent.com/u/201877089?s=200&v=4",
    homepage: "https://github.com/operative-sh/web-eval-agent",
    transport: {
      type: "stdio",
      command: "uvx",
      args: [
        "--refresh-package",
        "webEvalAgent",
        "--from",
        "git+https://github.com/Operative-Sh/web-eval-agent.git",
        "webEvalAgent",
      ],
      env: {
        OPERATIVE_API_KEY: "<operative-api-key>",
      },
    },
    parameters: [
      {
        name: "operative-api-key",
        description: "The API key for the Operative instance.",
        type: "string",
        required: true,
        password: true,
      },
    ],
  },
  {
    name: "figma",
    title: "Figma",
    description:
      "The Dev Mode MCP Server brings Figma directly into your workflow by providing important design information and context to AI agents generating code from Figma design files.",
    isOfficial: true,
    icon: "https://cdn.simpleicons.org/figma",
    homepage:
      "https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Dev-Mode-MCP-Server",
    transport: {
      type: "http",
      url: "http://127.0.0.1:3845/sse",
    },
    parameters: [],
  },
  {
    name: "linear",
    title: "Linear",
    description: "Access your Linear projects and tasks through MCP.",
    isOfficial: true,
    icon: "https://cdn.simpleicons.org/linear",
    homepage: "https://linear.app/docs/mcp.md",

    transport: {
      type: "http",
      url: "https://mcp.linear.app/sse",
    },
    parameters: [],
  },
  {
    name: "sentry",
    title: "Sentry",
    description: "Error tracking and monitoring platform.",
    isOfficial: true,
    icon: "https://cdn.simpleicons.org/sentry",
    homepage: "https://docs.sentry.io/product/sentry-mcp.md",
    transport: {
      type: "http",
      url: "https://mcp.sentry.dev/mcp",
    },
    parameters: [],
  },
  {
    name: "duckdb",
    title: "DuckDB",
    description:
      "interacts with DuckDB and MotherDuck databases, providing SQL analytics capabilities to AI Assistants and IDEs.",
    isOfficial: true,
    icon: "https://cdn.simpleicons.org/duckdb",
    homepage: "https://github.com/motherduckdb/mcp-server-motherduck",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["mcp-server-motherduck", "--db-path", "<duckdb-db-path>"],
    },
    parameters: [
      {
        name: "duckdb-db-path",
        description: "The path to the DuckDB database.",
        type: "string",
        required: true,
        password: false,
      },
    ],
  },
  {
    name: "posthog",
    title: "Posthog",
    description:
      "Enable querying analytics, errors, running SQL insights, and managing feature flags through natural language interactions",
    isOfficial: true,
    icon: "https://cdn.simpleicons.org/posthog",
    homepage: "https://github.com/PostHog/mcp",
    transport: {
      type: "http",
      url: "https://mcp.posthog.com/sse",
      headers: {
        Authorization: "Bearer <posthog-auth-header>",
      },
    },
    parameters: [
      {
        name: "posthog-auth-header",
        description: "The auth header for the Posthog instance.",
        type: "string",
        required: true,
        password: true,
      },
    ],
  },
  {
    name: "stripe",
    title: "Stripe",
    description:
      "Defines a set of tools that AI agents can use to interact with the Stripe API and search our knowledge base",
    isOfficial: true,
    icon: "https://cdn.simpleicons.org/stripe",
    homepage: "https://docs.stripe.com/mcp.md",
    transport: {
      type: "http",
      url: "https://mcp.stripe.com",
    },
    parameters: [],
  },
  {
    name: "paypal",
    title: "Paypal",
    description: "Integrate with PayPal APIs through function calling",
    isOfficial: true,
    icon: "https://cdn.simpleicons.org/paypal",
    homepage: "https://github.com/paypal/agent-toolkit",
    transport: {
      type: "stdio",
      command: "npx",
      args: [
        "-y",
        "@paypal/mcp",
        "--tools=all",
        "PAYPAL_ACCESS_TOKEN=<paypal-access-token>",
        "PAYPAL_ENVIRONMENT=<paypal-environment>",
      ],
    },
    parameters: [
      {
        name: "paypal-access-token",
        description: "The access token for the Paypal instance.",
        type: "string",
        required: true,
        password: true,
      },
      {
        name: "paypal-environment",
        description:
          "The environment for the Paypal instance. (e.g. 'SANDBOX')",
        type: "string",
        required: true,
        password: false,
      },
    ],
  },
  {
    name: "dbt-mcp",
    title: "dbt",
    description: "Integrate with PayPal APIs through function calling",
    isOfficial: true,
    icon: "https://cdn.simpleicons.org/dbt",
    homepage: "https://github.com/dbt-labs/dbt-mcp",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["--env-file", "<path-to-.env-file>", "dbt-mcp"],
    },
    parameters: [
      {
        name: "path-to-.env-file",
        description: "The path to the .env file.",
        type: "string",
        required: true,
        password: false,
      },
    ],
  },
  {
    name: "netlify",
    title: "Netlify",
    description: "Enable code agents to use the Netlify API and CLI",
    isOfficial: true,
    icon: "https://cdn.simpleicons.org/netlify",
    homepage: "https://github.com/netlify/netlify-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@netlify/mcp"],
    },
    parameters: [],
  },
  {
    name: "shopify",
    title: "Shopify",
    description: "Enable code agents to use the Shopify Dev.",
    isOfficial: true,
    icon: "https://cdn.simpleicons.org/shopify",
    homepage: "https://github.com/Shopify/dev-mcp",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@shopify/dev-mcp@latest"],
    },
    parameters: [],
  },
  {
    name: "snyk",
    title: "Snyk",
    description: "Enable code agents to use the Snyk API and CLI",
    isOfficial: true,
    icon: "https://registry.director.run/synk.svg",
    homepage:
      "https://docs.snyk.io/cli-ide-and-ci-cd-integrations/snyk-cli/developer-guardrails-for-agentic-workflows/snyk-mcp-early-access.md",
    transport: {
      type: "stdio",
      command: "synk",
      args: ["mcp", "-t", "stdio", "--experimental"],
    },
    parameters: [],
  },
  {
    name: "heroku",
    title: "Heroku",
    description: "Read, manage, and operate Heroku Platform resources",
    isOfficial: true,
    icon: "https://cdn.simpleicons.org/heroku",
    homepage: "https://github.com/heroku/heroku-mcp-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@heroku/mcp-server"],
      env: {
        HEROKU_API_KEY: "<heroku-api-key>",
      },
    },
    parameters: [
      {
        name: "heroku-api-key",
        description: "The API key for the Heroku instance.",
        type: "string",
        required: true,
        password: true,
      },
    ],
  },
  {
    name: "hugging-face",
    title: "Hugging Face",
    description:
      "Connect with AI assistants through the Model Context Protocol",
    isOfficial: true,
    icon: "https://cdn.simpleicons.org/huggingface",
    homepage: "https://github.com/evalstate/hf-mcp-server",
    transport: {
      type: "http",
      url: "https://hf.co/mcp",
      headers: {
        Authorization: "Bearer <hugging-face-api-key>",
      },
    },
    parameters: [
      {
        name: "hugging-face-api-key",
        description: "The API key for the Hugging Face instance.",
        type: "string",
        required: true,
        password: true,
      },
    ],
  },
  {
    name: "semgrep",
    title: "Semgrep",
    description: "Code security and linting tool",
    isOfficial: true,
    icon: "https://avatars.githubusercontent.com/u/29760937?s=200&v=4",
    homepage: "https://github.com/semgrep/mcp",
    transport: {
      type: "stdio",
      command: "uvx",
      args: ["semgrep-mcp"],
      env: {
        SEMGREP_APP_TOKEN: "<semgrep-app-token>",
      },
    },
    parameters: [
      {
        name: "semgrep-app-token",
        description: "The API key for the Semgrep instance.",
        type: "string",
        required: true,
        password: true,
      },
    ],
  },
];

// Remaining top pulse servers
//   {
//     name: "markdownify",
//     title: "Markdownify",
//     description:
//       "Converts diverse file types and web content to Markdown format using specialized tools for PDFs, images, audio, web pages, and more.",
//     isOfficial: false,
//     icon: null,
//     homepage: "https://github.com/zcaceres/markdownify-mcp",
//     transport: {
//       url: "http://example.com",
//       type: "http",
//     },
//     parameters: [],
//   },
//   {
//     name: "devdocs",
//     title: "DevDocs",
//     description:
//       "Free, private, UI-based software documentation context management server. Designed with software developers in mind.",
//     isOfficial: false,
//     icon: null,
//     homepage: "https://github.com/cyberagiinc/devdocs",
//     transport: {
//       url: "http://example.com",
//       type: "http",
//     },
//     parameters: [],
//   },
//   {
//     name: "solana-agent-kit",
//     title: "Solana Agent Kit",
//     description:
//       "Integrates with Solana blockchain to enable token deployment, NFT creation, DeFi operations, and cross-chain transfers via Wormhole directly within conversation interfaces.",
//     isOfficial: false,
//     icon: null,
//     homepage: "https://github.com/sendaifun/solana-agent-kit",
//     transport: {
//       url: "http://example.com",
//       type: "http",
//     },
//     parameters: [],
//   },
//   {
//     name: "crawl4ai-rag",
//     title: "Crawl4AI RAG",
//     description:
//       "Integrates web crawling with RAG functionality to enable website content retrieval, storage in vector databases, and semantic searching over crawled data for enhanced knowledge access",
//     isOfficial: false,
//     icon: null,
//     homepage: "https://github.com/coleam00/mcp-crawl4ai-rag",
//     transport: {
//       url: "http://example.com",
//       type: "http",
//     },
//     parameters: [],
//   },
//   {
//     name: "supermemory",
//     title: "Supermemory",
//     description:
//       "Personal knowledge platform that helps collect, organize, and recall information from various sources with end-to-end encryption and optional self-hosting.",
//     isOfficial: true,
//     icon: "https://avatars.githubusercontent.com/u/171979587?s=200&v=4",
//     homepage: "https://github.com/supermemoryai/supermemory-mcp",
//     transport: {
//       url: "http://example.com",
//       type: "http",
//     },
//     parameters: [],
//   },
//   {
//     name: "grafbase",
//     title: "Grafbase",
//     description:
//       "Command-line tool for managing GraphQL APIs with features for local development, federation, and deployment across various connectors including GraphQL, OpenAPI, and MongoDB.",
//     isOfficial: true,
//     icon: "https://avatars.githubusercontent.com/u/62072752?s=200&v=4",
//     homepage: "https://github.com/grafbase/grafbase",
//     transport: {
//       url: "http://example.com",
//       type: "http",
//     },
//     parameters: [],
//   },
//   {
//     name: "notte-browser",
//     title: "Notte Browser",
//     description:
//       "Provides a bridge between AI and Notte's cloud browser technology, enabling web automation, scraping, and autonomous task completion on websites without direct browser management.",
//     isOfficial: false,
//     icon: null,
//     homepage: "https://github.com/nottelabs/notte/tree/HEAD/packages/notte-mcp",
//     transport: {
//       url: "http://example.com",
//       type: "http",
//     },
//     parameters: [],
//   },
//   {
//     name: "devdb",
//     title: "DevDB",
//     description:
//       "Exposes database tables and schemas via HTTP endpoints, allowing tools to query database structure without direct database access for security-conscious development.",
//     isOfficial: false,
//     icon: null,
//     homepage: "https://github.com/damms005/devdb-vscode",
//     transport: {
//       url: "http://example.com",
//       type: "http",
//     },
//     parameters: [],
//   },
//   {
//     name: "wechat-summarizer",
//     title: "WeChat Summarizer",
//     description:
//       "Hook into your WeChat history and pull summaries of conversations.",
//     isOfficial: false,
//     icon: null,
//     homepage: "https://github.com/chatmcp/mcp-server-chatsum",
//     transport: {
//       url: "http://example.com",
//       type: "http",
//     },
//     parameters: [],
//   },
//   {
//     name: "azure-cloud-manager",
//     title: "Azure Cloud Manager",
//     description:
//       "Enables AI to manage Azure cloud resources through a .NET-based command-line interface, providing operations for Cosmos DB, Storage, App Configuration, and Monitor services.",
//     isOfficial: false,
//     icon: null,
//     homepage: "https://github.com/azure/azure-mcp",
//     transport: {
//       url: "http://example.com",
//       type: "http",
//     },
//     parameters: [],
//   },
//   {
//     name: "graphiti",
//     title: "Graphiti",
//     description:
//       "Provides a temporal knowledge graph system for storing, retrieving, and reasoning about relationships between entities with persistent memory across conversations",
//     isOfficial: false,
//     icon: null,
//     homepage: "https://github.com/getzep/graphiti/tree/HEAD/mcp_server",
//     transport: {
//       url: "http://example.com",
//       type: "http",
//     },
//     parameters: [],
//   },
//   {
//     name: "python-sandbox",
//     title: "Python Sandbox",
//     description:
//       "Provides a browser-compatible Python execution environment with package management capabilities for running code snippets safely without requiring a backend Python installation.",
//     isOfficial: false,
//     icon: null,
//     homepage:
//       "https://github.com/pydantic/pydantic-ai/tree/HEAD/mcp-run-python",
//     transport: {
//       url: "http://example.com",
//       type: "http",
//     },
//     parameters: [],
//   },
//   {
//     name: "pipedream",
//     title: "Pipedream",
//     description:
//       "Access hosted MCP servers or deploy your own for 2,500+ APIs like Slack, GitHub, Notion, Google Drive, and more, all with built-in auth and 10k tools.",
//     isOfficial: false,
//     icon: null,
//     homepage:
//       "https://github.com/pipedreamhq/pipedream/tree/HEAD/modelcontextprotocol",
//     transport: {
//       url: "http://example.com",
//       type: "http",
//     },
//     parameters: [],
//   },
//   {
//     name: "toolbox-for-databases",
//     title: "Toolbox for Databases",
//     description:
//       "Provides a secure, configurable interface for executing pre-defined queries against multiple database systems including PostgreSQL, MySQL, SQL Server, Neo4j, Dgraph, and Spanner through a YAML-based configuration system.",
//     isOfficial: true,
//     icon: null,
//     homepage: "https://github.com/googleapis/genai-toolbox",
//     transport: {
//       url: "http://example.com",
//       type: "http",
//     },
//     parameters: [],
//   },
//   {
//     name: "ghidra",
//     title: "Ghidra",
//     description: "Decompile and analyze binaries in Ghidra.",
//     isOfficial: false,
//     icon: null,
//     homepage: "https://github.com/lauriewired/ghidramcp",
//     transport: {
//       url: "http://example.com",
//       type: "http",
//     },
//     parameters: [],
//   },
//   {
//     name: "paddleocr",
//     title: "PaddleOCR",
//     description:
//       "Integrates with PaddleOCR and PP-StructureV3 to extract text from images and PDFs with confidence scores and bounding boxes, plus parse complex documents into structured markdown with embedded images, tables, and formulas.",
//     isOfficial: false,
//     icon: null,
//     homepage: "https://github.com/paddlepaddle/paddleocr/tree/HEAD/mcp_server",
//     transport: {
//       url: "http://example.com",
//       type: "http",
//     },
//     parameters: [],
//   },
//   {
//     name: "talk-to-figma",
//     title: "Talk to Figma",
//     description:
//       "Enables bidirectional communication with Figma designs through a plugin and WebSocket server, allowing creation and manipulation of design elements directly from conversations.",
//     isOfficial: false,
//     icon: null,
//     homepage: "https://github.com/sonnylazuardi/cursor-talk-to-figma-mcp",
//     transport: {
//       url: "http://example.com",
//       type: "http",
//     },
//     parameters: [],
//   },
//   {
//     name: "whatsapp-bridge",
//     title: "WhatsApp Bridge",
//     description:
//       "Provides a secure bridge to your WhatsApp account, enabling message search, contact management, and sending capabilities while keeping all data stored locally on your device.",
//     isOfficial: false,
//     icon: null,
//     homepage: "https://github.com/lharries/whatsapp-mcp",
//     transport: {
//       url: "http://example.com",
//       type: "http",
//     },
//     parameters: [],
//   },
//   {
//     name: "chrome-browser-automation",
//     title: "Chrome Browser Automation",
//     description:
//       "Provides browser automation and semantic search capabilities through Chrome extension integration, enabling intelligent web element interaction, form filling, screenshot capture, and vector-based content indexing with transformer models for cross-platform web automation workflows.",
//     isOfficial: false,
//     icon: null,
//     homepage: "https://github.com/hangwin/mcp-chrome",
//     transport: {
//       url: "http://example.com",
//       type: "http",
//     },
//     parameters: [],
//   },
//   {
//     name: "gitmcp-github-to-mcp",
//     title: "GitMCP (GitHub to MCP)",
//     description:
//       "Transform any GitHub project (repositories or GitHub pages) into a documentation hub. Allows AI tools like Cursor to access up-to-date documentation and code, ending hallucinations.",
//     isOfficial: false,
//     icon: null,
//     homepage: "https://github.com/idosal/git-mcp",
//     transport: {
//       url: "http://example.com",
//       type: "http",
//     },
//     parameters: [],
//   },
//   {
//     name: "ida-pro",
//     title: "IDA Pro",
//     description: "Automated reverse engineering with IDA Pro.",
//     isOfficial: false,
//     icon: null,
//     homepage: "https://github.com/mrexodia/ida-pro-mcp",
//     transport: {
//       url: "http://example.com",
//       type: "http",
//     },
//     parameters: [],
//   },
//   {
//     name: "genkit",
//     title: "Genkit",
//     description: "Consume MCP resources or expose Genkit tools as server.",
//     isOfficial: false,
//     icon: null,
//     homepage: "https://github.com/firebase/genkit/tree/HEAD/js/plugins/mcp",
//     transport: {
//       url: "http://example.com",
//       type: "http",
//     },
//     parameters: [],
//   },
//   {
//     name: "unity",
//     title: "Unity",
//     description: "Allow MCP clients to perform Unity Editor actions.",
//     isOfficial: false,
//     icon: null,
//     homepage: "https://github.com/justinpbarnett/unity-mcp",
//     transport: {
//       url: "http://example.com",
//       type: "http",
//     },
//     parameters: [],
//   },
//   {
//     name: "tianji",
//     title: "Tianji",
//     description:
//       "Bridges AI assistants with the Tianji platform to enable survey management, including querying results, retrieving detailed information, and listing workspace surveys without navigating the Tianji interface.",
//     isOfficial: false,
//     icon: null,
//     homepage: "https://github.com/msgbyte/tianji",
//     transport: {
//       url: "http://example.com",
//       type: "http",
//     },
//     parameters: [],
//   },
