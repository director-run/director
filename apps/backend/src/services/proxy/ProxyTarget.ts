import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import type { McpServer } from "../db/schema";
import { ConnectedClient } from "./ConnectedClient";

export class ProxyTarget {
  public client: ConnectedClient;
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
    this.client = new ConnectedClient(this.name);
  }

  async connect(transport: Transport) {
    await this.client.connect(transport);
  }

  async close() {
    await this.client.close();
  }
}
