import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import type { McpServer } from "../db/schema";
import { ConnectedClient } from "./ConnectedClient";

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

    if (this.targetServer.transport.type === "sse") {
      this.transport = new SSEClientTransport(
        new URL(this.targetServer.transport.url),
      );
    } else {
      this.transport = new StdioClientTransport({
        command: this.targetServer.transport.command,
        args: this.targetServer.transport.args,
        env: this.targetServer.transport.env
          ? this.targetServer.transport.env.reduce(
              (_, v) => ({
                [v]: process.env[v] || "",
              }),
              {},
            )
          : undefined,
      });
    }

    if (!this.transport) {
      throw new Error(`Transport ${this.targetServer.name} not available.`);
    }

    this.client = new ConnectedClient(this.name);
  }

  async connect() {
    await this.client.connect(this.transport);
  }

  async close() {
    await this.client.close();
  }
}
