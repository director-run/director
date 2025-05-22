import type { EntryCreateParams } from "../db/schema";

export function getSeedEntries(): EntryCreateParams[] {
  return [
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
}
