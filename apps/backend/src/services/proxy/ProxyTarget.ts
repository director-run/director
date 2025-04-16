import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import type { McpServer } from "../db/schema";
import { ConnectedClient } from "./ConnectedClient";

function getTransport(targetServer: McpServer): Transport {
  if (targetServer.transport.type === "sse") {
    return new SSEClientTransport(new URL(targetServer.transport.url));
  } else if (targetServer.transport.type === "stdio") {
    return new StdioClientTransport({
      command: targetServer.transport.command,
      args: targetServer.transport.args,
      env: targetServer.transport.env
        ? targetServer.transport.env.reduce(
            (_, v) => ({
              [v]: process.env[v] || "",
            }),
            {},
          )
        : undefined,
    });
  } else {
    throw new Error(`Transport ${targetServer.name} not available.`);
  }
}

export class ProxyTarget {
  public client: ConnectedClient;
  private transport: Transport;
  private targetServer: McpServer;

  get name() {
    return this.targetServer.name;
  }

  public toPlainObject() {
    return {
      ...this.targetServer,
    };
  }

  constructor(targetServer: McpServer) {
    this.targetServer = targetServer;
    this.transport = getTransport(targetServer);

    this.client = new ConnectedClient(this.name);
  }

  async connect() {
    await this.client.connect(this.transport);
  }

  async close() {
    await this.client.close();
  }
}
