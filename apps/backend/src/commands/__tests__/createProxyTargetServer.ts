import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import { z } from "zod";

export const createProxyTargetServer = async () => {
  const server = new McpServer({
    name: "test-sse-proxy-target",
    version: "1.0.0",
  });

  server.tool("echo", { message: z.string() }, async ({ message }) => ({
    content: [{ type: "text", text: `Tool echo: ${message}` }],
  }));

  const app = express();
  // Set up middleware before defining routes
  // app.use(express.json());

  let transport: SSEServerTransport;

  app.get("/sse", async (req, res) => {
    // Set proper content-type header for SSE
    // res.setHeader("Content-Type", "text/event-stream");
    // res.setHeader("Cache-Control", "no-cache");
    // res.setHeader("Connection", "keep-alive");

    transport = new SSEServerTransport("/message", res);

    res.write("event: ping\ndata: connected\n\n");

    await server.connect(transport);
  });

  app.post("/message", async (req, res) => {
    // app.use(express.json());

    await transport.handlePostMessage(req, res);
  });

  return app.listen(4520);
};
