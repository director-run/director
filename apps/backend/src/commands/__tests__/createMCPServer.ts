import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";

export const createMCPServer = async (
  port: number,
  callback: (server: McpServer) => void,
) => {
  const server = new McpServer({
    name: "test-sse-proxy-target",
    version: "1.0.0",
  });

  callback(server);

  const app = express();

  let transport: SSEServerTransport;

  app.get("/sse", async (req, res) => {
    transport = new SSEServerTransport("/message", res);
    await server.connect(transport);
  });

  app.post("/message", async (req, res) => {
    await transport.handlePostMessage(req, res);
  });

  const instance = app.listen(port);
  return instance;
};
