import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import type { McpServer } from "../db/schema";

export class ProxyClient {
  public client: Client;
  private transport: Transport;
  private target: McpServer;

  get name() {
    return this.target.name;
  }

  constructor(target: McpServer) {
    this.target = target;

    if (this.target.transport.type === "sse") {
      this.transport = new SSEClientTransport(
        new URL(this.target.transport.url),
      );
    } else {
      this.transport = new StdioClientTransport({
        command: this.target.transport.command,
        args: this.target.transport.args,
        env: this.target.transport.env
          ? this.target.transport.env.reduce(
              (o, v) => ({
                [v]: process.env[v] || "",
              }),
              {},
            )
          : undefined,
      });
    }

    if (!this.transport) {
      throw new Error(`Transport ${this.target.name} not available.`);
    }

    this.client = new Client(
      {
        name: "mcp-proxy-client",
        version: "1.0.0",
      },
      {
        capabilities: {
          prompts: {},
          resources: { subscribe: true },
          tools: {},
        },
      },
    );
  }

  async connect() {
    await this.client.connect(this.transport);
  }

  async close() {
    await this.client.close();
  }
}
