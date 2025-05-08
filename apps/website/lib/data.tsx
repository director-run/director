import type { ServerType } from "./types"

export const servers: ServerType[] = [
  {
    id: "stripe",
    name: "stripe",
    description:
      "Interact with the Stripe API. This server supports various tools to interact with different Stripe services.",
    verified: true,
    provider: "Stripe, Inc.",
    providerVerified: true,
    createdDate: "Nov 11, 2024",
    runtime: "Node",
    license: "MIT",
    sourceUrl: "https://github.com/stripe/stripe-mcp",
    tools: [
      {
        name: "create_customer",
        description: "This tool will create a customer in Stripe.",
        arguments: ["name (str): The name of the customer.", "email (str, optional): The email of the customer."],
        inputs: [
          {
            name: "name",
            type: "string",
            required: true,
            description: "The name of the customer",
          },
          {
            name: "email",
            type: "string",
            description: "The email of the customer",
          },
        ],
      },
      {
        name: "list_customers",
        description: "This tool will fetch a list of Customers from Stripe.",
        arguments: [],
        inputs: [
          {
            name: "limit",
            type: "integer",
            description:
              "A limit on the number of objects to be returned. Limit can range between 1 and 100, and the default is 10.",
          },
          {
            name: "email",
            type: "string",
            description:
              "A case-sensitive filter on the list based on the customer's email field. The value must be a string.",
          },
        ],
      },
      {
        name: "create_product",
        description: "This tool will create a product in Stripe.",
        arguments: [
          "name (str): The name of the product.",
          "description (str, optional): The description of the product.",
        ],
        inputs: [
          {
            name: "name",
            type: "string",
            required: true,
            description: "The name of the product.",
          },
          {
            name: "description",
            type: "string",
            description: "The description of the product.",
          },
        ],
      },
    ],
    parameters: [
      {
        name: "STRIPE_API_KEY",
        description: "Your Stripe API key.",
        required: true,
      },
    ],
    readme: "Stripe Model Context Protocol",
  },
  {
    id: "firecrawl",
    name: "Firecrawl",
    description:
      "A Model Context Protocol (MCP) server implementation that integrates with various data sources for efficient crawling.",
    verified: true,
    provider: "Firecrawl, Inc.",
    createdDate: "Oct 15, 2024",
    runtime: "Python",
    license: "Apache 2.0",
    sourceUrl: "https://github.com/firecrawl/mcp-server",
  },
  {
    id: "artemis",
    name: "Artemis Analytics",
    description:
      "Pull the latest fundamental crypto data from Artemis natively into your favorite tools and workflows.",
    verified: true,
    provider: "Artemis Labs",
    createdDate: "Dec 3, 2024",
    runtime: "Node",
    license: "MIT",
    sourceUrl: "https://github.com/artemis-labs/analytics-mcp",
  },
  {
    id: "aws-kb",
    name: "AWS Knowledge Base",
    description:
      "Retrieval from AWS Knowledge Base using Bedrock Agent Runtime. A Model Context Protocol implementation.",
    verified: false,
    provider: "AWS",
    createdDate: "Sep 22, 2024",
    runtime: "Node",
    license: "Apache 2.0",
  },
  {
    id: "brave-search",
    name: "Brave Search (reference)",
    description:
      "Web and local search using Brave's Search API. A Model Context Protocol implementation for real-time web search.",
    verified: false,
    provider: "Brave Software",
    createdDate: "Aug 17, 2024",
    runtime: "Node",
    license: "MPL 2.0",
    sourceUrl: "https://github.com/brave/search-mcp",
  },
  {
    id: "browserbase",
    name: "Browserbase",
    description: "Automate browser interactions in the cloud (e.g. web navigation, data extraction, form filling).",
    verified: true,
    provider: "Browserbase, Inc.",
    createdDate: "Jan 5, 2025",
    runtime: "Node",
    license: "MIT",
    sourceUrl: "https://github.com/browserbase/mcp-server",
  },
  {
    id: "everart",
    name: "EverArt",
    description:
      "AI image generation using various models using EverArt. A Model Context Protocol implementation for creative workflows.",
    verified: false,
    provider: "EverArt AI",
    createdDate: "Nov 30, 2024",
    runtime: "Python",
    license: "MIT",
  },
  {
    id: "everything",
    name: "Everything",
    description:
      "This MCP server attempts to exercise all the features of the MCP protocol. It is not intended for production use.",
    verified: false,
    provider: "MCP Community",
    createdDate: "Jul 12, 2024",
    runtime: "Node",
    license: "MIT",
    sourceUrl: "https://github.com/mcp-community/everything",
  },
  {
    id: "exa-search",
    name: "Exa Search",
    description:
      "This setup allows AI models to get real-time web information in a safe and efficient manner through semantic search.",
    verified: true,
    provider: "Exa",
    createdDate: "Oct 8, 2024",
    runtime: "Node",
    license: "MIT",
    sourceUrl: "https://github.com/exa-ai/exa-mcp",
  },
  {
    id: "fetch",
    name: "Fetch",
    description:
      "Web content fetching and conversion for efficient LLM usage. A Model Context Protocol implementation.",
    verified: false,
    provider: "Fetch Labs",
    createdDate: "Aug 29, 2024",
    runtime: "Node",
    license: "MIT",
  },
  {
    id: "filesystem",
    name: "Filesystem",
    description:
      "Local filesystem access with configurable allowed paths. A Model Context Protocol implementation for file operations.",
    verified: false,
    provider: "MCP Community",
    createdDate: "Jul 15, 2024",
    runtime: "Node",
    license: "MIT",
    sourceUrl: "https://github.com/mcp-community/filesystem",
  },
  {
    id: "google-drive",
    name: "Google Drive (reference)",
    description:
      "File access and search capabilities for Google Drive. A Model Context Protocol implementation for cloud storage.",
    verified: false,
    provider: "Google",
    createdDate: "Dec 20, 2024",
    runtime: "Node",
    license: "Apache 2.0",
  },
]
