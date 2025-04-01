import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import { z } from "zod";

export const createProxyTargetServer = async (port: number) => {
  const server = new McpServer({
    name: "test-sse-proxy-target",
    version: "1.0.0",
  });

  server.tool("echo", { message: z.string() }, async ({ message }) => ({
    content: [{ type: "text", text: `Tool echo: ${message}` }],
  }));

  const app = express();
  // app.use(express.json());

  let transport: SSEServerTransport;

  app.get("/sse", async (req, res) => {
    // // This is critical - SSE requires text/event-stream content type
    // res.writeHead(200, {
    //   "Content-Type": "text/event-stream",
    //   "Cache-Control": "no-cache",
    //   Connection: "keep-alive",
    //   "Access-Control-Allow-Origin": "*",
    // });

    transport = new SSEServerTransport("/message", res);

    // Send initial ping
    // res.write("event: ping\ndata: connected\n\n");

    await server.connect(transport);
  });

  app.post("/message", async (req, res) => {
    // app.use(express.json());

    await transport.handlePostMessage(req, res);
  });

  const instance = app.listen(port);
  return instance;
};
