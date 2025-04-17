export const apps = [
  {
    name: "Fetch",
    description:
      "This app enables Claude to retrieve and process content from web pages, converting HTML to markdown for easier consumption.",
    sourceUrl:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/fetch",
    config: {
      mcpKey: "fetch",
      runtime: "uvx",
      args: ["mcp-server-fetch"],
    },
    features: [
      {
        name: "Process web pages",
        description: "Extract and analyze information from web pages",
        prompt: "Get the top article from nytimes.com and summarize it",
      },
      {
        name: "Convert HTML to markdown",
        description: "Transform web page HTML into readable markdown format",
        prompt:
          "Fetch this documentation page and convert it to markdown for me",
      },
    ],
    setup: [],
  },
  {
    name: "Memory",
    description:
      "This app lets Claude remember information about the user across chats.",
    icon: {
      type: "url",
      url: {
        light:
          "https://raw.githubusercontent.com/fleuristes/app-registry/refs/heads/main/assets/memory-light.svg",
        dark: "https://raw.githubusercontent.com/fleuristes/app-registry/refs/heads/main/assets/memory-dark.svg",
      },
    },
    category: "Utilities",
    price: "Free",
    developer: "MCP",
    sourceUrl:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/memory",
    config: {
      mcpKey: "memory",
      runtime: "npx",
      args: ["-y", "@modelcontextprotocol/server-memory"],
    },
    features: [
      {
        name: "Remember user information",
        description:
          "Store and recall information about the user across conversations",
        prompt: "Remember that John likes to play soccer",
      },
      {
        name: "Recall previous conversations",
        description: "Access information from past interactions with the user",
        prompt: "What did John tell me about his job last time we talked?",
      },
    ],
    setup: [],
  },
  {
    name: "Github",
    description:
      "This app lets Claude use the GitHub API, enabling file operations, repository management, search functionality, and more.",
    icon: {
      type: "url",
      url: {
        light:
          "https://raw.githubusercontent.com/fleuristes/app-registry/refs/heads/main/assets/github-light.svg",
        dark: "https://raw.githubusercontent.com/fleuristes/app-registry/refs/heads/main/assets/github-dark.svg",
      },
    },
    category: "Utilities",
    price: "Free",
    developer: "MCP",
    sourceUrl:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/github",
    config: {
      mcpKey: "github",
      runtime: "npx",
      args: ["-y", "@modelcontextprotocol/server-github"],
    },
    features: [
      {
        name: "Create or update files",
        description: "Create or update a file in a GitHub repository",
        prompt:
          "Create a README file for my project and push it to my repository at github.com/username/repo",
      },
      {
        name: "Summarize open issues",
        description:
          "Fetch and summarize all open issues in a GitHub repository",
        prompt:
          "Summarize all open issues in my repository at github.com/username/repo",
      },
    ],
    setup: [
      {
        label: "Create a GitHub Personal Access Token",
        value:
          "Create a personal access token for your account: [https://github.com/settings/tokens](https://github.com/settings/tokens)",
        type: "text",
      },
      {
        label: "GitHub Personal Access Token",
        type: "input",
        placeholder: "Enter your GitHub Personal Access Token",
        value: "Enter your GitHub Personal Access Token",
        key: "GITHUB_PERSONAL_ACCESS_TOKEN",
      },
    ],
  },
  {
    name: "Linear",
    description: "Allows Claude to interact with Linear",
    sourceUrl: "https://github.com/vinayak-mehta/linear-mcp",
    icon: {
      type: "url",
      url: {
        light:
          "https://raw.githubusercontent.com/fleuristes/app-registry/refs/heads/main/assets/linear-dark.svg",
        dark: "https://raw.githubusercontent.com/fleuristes/app-registry/refs/heads/main/assets/linear-light.svg",
      },
    },
    category: "Productivity",
    price: "Free",
    developer: "Linear",
    config: {
      mcpKey: "linear",
      runtime: "uvx",
      args: ["mcp-linear"],
    },
    features: [
      {
        name: "Ask Claude about your Linear issues",
        description: "Ask Claude about your Linear issues",
        prompt: "What are the most important issues in my Linear board?",
      },
      {
        name: "Create a new issue in Linear",
        description: "Create a new issue in Linear",
        prompt: "Create a new issue in Linear titled...",
      },
    ],
    setup: [
      {
        label: "Create an API Key",
        value:
          "Create or get a Personal API key for your account: [https://linear.app/settings/account/security](https://linear.app/settings/account/security)",
        type: "text",
      },
      {
        label: "Linear API Key",
        type: "input",
        placeholder: "Enter your Linear API key",
        value: "Enter your Linear API key",
        key: "LINEAR_API_KEY",
      },
    ],
  },
  {
    name: "Slack",
    description: "Allows Claude to interact with Slack",
    sourceUrl:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/slack",
    icon: {
      type: "url",
      url: {
        light:
          "https://raw.githubusercontent.com/fleuristes/app-registry/refs/heads/main/assets/slack.svg",
        dark: "https://raw.githubusercontent.com/fleuristes/app-registry/refs/heads/main/assets/slack.svg",
      },
    },
    category: "Communication",
    price: "Free",
    developer: "Slack",
    config: {
      mcpKey: "slack",
      runtime: "npx",
      args: ["-y", "@modelcontextprotocol/server-slack"],
    },
    features: [
      {
        name: "Ask Claude about your Slack issues",
        description: "Ask Claude about your Slack issues",
        prompt:
          "What are the most important issues in my customer Slack channels?",
      },
      {
        name: "Get a tldr of a Slack conversation",
        description: "Get a tldr of a Slack conversation",
        prompt: "Give me a tldr of this thread in Slack...",
      },
    ],
    setup: [
      {
        label: "Slack Bot Token",
        type: "input",
        placeholder: "Enter your Slack bot token",
        value: "Enter your Slack bot token",
        key: "SLACK_BOT_TOKEN",
      },
      {
        label: "Slack Team ID",
        type: "input",
        placeholder: "Enter your Slack team ID",
        value: "Enter your Slack team ID",
        key: "SLACK_TEAM_ID",
      },
    ],
  },
  {
    name: "Obsidian",
    description:
      "Allows Claude to interact with your Obsidian vault, search notes, and retrieve content",
    sourceUrl: "https://github.com/MarkusPfundstein/mcp-obsidian",
    icon: {
      type: "url",
      url: {
        light:
          "https://raw.githubusercontent.com/fleuristes/app-registry/refs/heads/main/assets/obsidian.svg",
        dark: "https://raw.githubusercontent.com/fleuristes/app-registry/refs/heads/main/assets/obsidian.svg",
      },
    },
    category: "Productivity",
    price: "Free",
    developer: "Markus Pfundstein",
    config: {
      mcpKey: "obsidian",
      runtime: "uvx",
      args: ["mcp-obsidian"],
    },
    features: [
      {
        name: "Search Obsidian notes",
        description: "Search for notes in your Obsidian vault",
        prompt: "Find notes in my Obsidian vault about...",
      },
      {
        name: "Retrieve note content",
        description:
          "Get the content of specific notes from your Obsidian vault",
        prompt: "Show me my Obsidian note about...",
      },
    ],
    setup: [
      {
        type: "text",
        label: "Install the Obsidian REST API plugin",
        value:
          "Open the plugin settings in Obsidian and install the [Local REST API](obsidian://show-plugin?id=obsidian-local-rest-api) plugin",
      },
      {
        label: "Obsidian API Key",
        type: "input",
        placeholder: "Enter your Obsidian API key",
        value: "Enter your Obsidian API key",
        key: "OBSIDIAN_API_KEY",
      },
    ],
  },
  {
    name: "Rember",
    description:
      "Allow Claude to create flashcards for you with the official MCP for Rember. Rember helps you study and remember anything you care about by scheduling spaced repetition reviews.\n\nSign up at [rember.com](https://www.rember.com/)",
    icon: {
      type: "url",
      url: {
        light:
          "https://raw.githubusercontent.com/fleuristes/app-registry/refs/heads/main/assets/rember.png",
        dark: "https://raw.githubusercontent.com/fleuristes/app-registry/refs/heads/main/assets/rember.png",
      },
    },
    category: "Flashcards",
    price: "Free",
    developer: "Rember",
    sourceUrl: "https://github.com/rember/rember-mcp",
    config: {
      mcpKey: "rember",
      runtime: "npx",
      args: ["-y", "@getrember/mcp"],
    },
    features: [
      {
        name: "Create flashcards from your chats",
        description: "Create flashcards from your chats",
        prompt: "... I like your answer, help me remember it",
      },
      {
        name: "Create flashcards from your PDFs",
        description: "Create flashcards from your PDFs",
        prompt: "Create flashcards from chapter 2 of this PDF",
      },
    ],
    setup: [
      {
        label: "Get an API Key",
        value:
          "You can find your Rember API key in [Settings > MCP & API](https://www.rember.com/settings/mcp-api).",
        type: "text",
      },
      {
        label: "Rember API Key",
        type: "input",
        placeholder: "Enter your Rember API key",
        value: "Enter your Rember API key",
        key: "REMBER_API_KEY",
      },
    ],
  },
  {
    name: "Browser",
    description:
      "This is a browser app that allows Claude to navigate to any website, take screenshots, and interact with the page.",
    icon: {
      type: "url",
      url: {
        light:
          "https://raw.githubusercontent.com/fleuristes/app-registry/refs/heads/main/assets/browser-light.svg",
        dark: "https://raw.githubusercontent.com/fleuristes/app-registry/refs/heads/main/assets/browser-dark.svg",
      },
    },
    category: "Utilities",
    price: "Free",
    developer: "Google LLC",
    sourceUrl:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer",
    config: {
      mcpKey: "puppeteer",
      runtime: "npx",
      args: ["-y", "@modelcontextprotocol/server-puppeteer", "--debug"],
    },
    features: [
      {
        name: "Navigate to any website",
        description: "Navigate to any URL in the browser",
        prompt: "Navigate to the URL google.com and...",
      },
      {
        name: "Interact with any website - search, click, scroll, screenshot, etc.",
        description: "Click elements on the page",
        prompt: "Go to google.com and search for...",
      },
    ],
    setup: [],
  },
  {
    name: "Hacker News",
    description:
      "Hacker News MCP which allows Claude to get the top stories on Hacker News and summarize discussion threads.",
    sourceUrl: "https://github.com/erithwik/mcp-hn",
    icon: {
      type: "url",
      url: {
        light:
          "https://raw.githubusercontent.com/fleuristes/app-registry/refs/heads/main/assets/yc.svg",
        dark: "https://raw.githubusercontent.com/fleuristes/app-registry/refs/heads/main/assets/yc.svg",
      },
    },
    category: "Social",
    price: "Free",
    developer: "Y Combinator",
    config: {
      mcpKey: "hn",
      runtime: "uvx",
      args: ["mcp-hn"],
    },
    features: [
      {
        name: "Get the top stories on Hacker News",
        description: "Get the top stories on Hacker News",
        prompt: "What are the top stories on Hacker News?",
      },
      {
        name: "Summarize discussion threads on Hacker News",
        description: "Summarize discussion threads on Hacker News",
        prompt: "Summarize the discussion thread on Hacker News titled...",
      },
    ],
    setup: [],
  },
  {
    name: "Stripe",
    description:
      "Allows Claude to interact with Stripe for payment processing and managing financial data.",
    icon: {
      type: "url",
      url: {
        light:
          "https://raw.githubusercontent.com/fleuristes/app-registry/refs/heads/main/assets/stripe.svg",
        dark: "https://raw.githubusercontent.com/fleuristes/app-registry/refs/heads/main/assets/stripe.svg",
      },
    },
    category: "Finance",
    price: "Free",
    developer: "Stripe",
    sourceUrl: "https://github.com/stripe/stripe-mcp",
    config: {
      mcpKey: "stripe",
      runtime: "npx",
      args: ["-y", "@stripe/mcp", "--tools=all", "--api-key=${STRIPE_API_KEY}"],
    },
    features: [
      {
        name: "View payment information",
        description:
          "Retrieve and analyze payment data from your Stripe account",
        prompt: "Show me recent payments in my Stripe account",
      },
      {
        name: "Manage customers and invoices",
        description: "View and manage customer information and invoices",
        prompt: "Create a new invoice for customer X in Stripe",
      },
    ],
    setup: [
      {
        label: "Get an API Key",
        value:
          "You can find your Stripe API key in the [Stripe Dashboard](https://dashboard.stripe.com/apikeys) under Developers > API keys.",
        type: "text",
      },
      {
        label: "Stripe API Key",
        type: "input",
        placeholder: "Enter your Stripe API key",
        value: "Enter your Stripe API key",
        key: "STRIPE_API_KEY",
      },
    ],
  },
  {
    name: "Brave Search",
    description: "This app allows Claude to search the web using Brave Search.",
    sourceUrl:
      "https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search",
    icon: {
      type: "url",
      url: {
        light:
          "https://raw.githubusercontent.com/fleuristes/app-registry/refs/heads/main/assets/brave.svg",
        dark: "https://raw.githubusercontent.com/fleuristes/app-registry/refs/heads/main/assets/brave.svg",
      },
    },
    category: "Search",
    price: "Free",
    developer: "Anthropic",
    config: {
      mcpKey: "brave-search",
      runtime: "npx",
      args: ["-y", "@modelcontextprotocol/server-brave-search"],
    },
    features: [
      {
        name: "Search the web",
        description: "Search the web using Brave Search",
        prompt: "Search for the latest news about artificial intelligence",
      },
    ],
    setup: [
      {
        label: "Brave Search API Key",
        type: "input",
        placeholder: "Enter your Brave Search API key",
        value: "Enter your Brave Search API key",
        key: "BRAVE_SEARCH_API_KEY",
      },
    ],
  },
  {
    name: "Browser Use",
    description: "Allows Claude to run agentic tasks using a Chromium browser.",
    icon: {
      type: "url",
      url: {
        light:
          "https://raw.githubusercontent.com/fleuristes/app-registry/refs/heads/main/assets/chromium.svg",
        dark: "https://raw.githubusercontent.com/fleuristes/app-registry/refs/heads/main/assets/chromium.svg",
      },
    },
    category: "Utilities",
    price: "Free",
    developer: "MCP",
    sourceUrl: "https://github.com/vinayak-mehta/mcp-browser-use",
    config: {
      mcpKey: "browser-use",
      runtime: "uvx",
      args: ["mcp-browser-use"],
    },
    features: [
      {
        name: "Run agentic tasks using a Chromium browser",
        description: "Run agentic tasks using a Chromium browser",
        prompt: "Go to google.com and search for...",
      },
    ],
    setup: [],
  },
];
