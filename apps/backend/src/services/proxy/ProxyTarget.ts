import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { ConnectedClient } from "./ConnectedClient";

export class ProxyTarget {
  public client: ConnectedClient;

  get name() {
    return this.client.name;
  }

  public toPlainObject() {
    return this.client.toPlainObject();
  }

  constructor(name: string) {
    this.client = new ConnectedClient(name);
  }

  async connect(transport: Transport) {
    await this.client.connect(transport);
  }

  async close() {
    await this.client.close();
  }
}
