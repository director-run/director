import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { ConnectedClient } from "./ConnectedClient";
import type { ProxyServerStore } from "./ProxyServerStore";
import { createControllerServer } from "./createControllerServer";

export class ControllerClient extends ConnectedClient {
  private store: ProxyServerStore;

  constructor({ store }: { store: ProxyServerStore }) {
    super("controller");
    this.store = store;
  }

  async connect(): Promise<void> {
    const server = await createControllerServer({ store: this.store });
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    await Promise.all([
      super.connect(clientTransport),
      server.connect(serverTransport),
    ]);
  }
}
