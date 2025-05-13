import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import express from "express";
import { ProxyServer } from "./proxy-server";

export function serveOverSSE(server: Server, port: number) {
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
}

export async function serveOverStdio(server: Server) {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  process.on("SIGINT", async () => {
    await transport.close();
    await server.close();
    process.exit(0);
  });
}

export async function proxySSEToStdio(sseUrl: string) {
  try {
    const proxy = new ProxyServer({
      id: "sse2stdio",
      name: "sse2stdio",
      servers: [
        {
          name: "director-sse",
          transport: {
            type: "sse",
            url: sseUrl,
          },
        },
      ],
    });

    await proxy.connectTargets({ throwOnError: true });
    await serveOverStdio(proxy);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
