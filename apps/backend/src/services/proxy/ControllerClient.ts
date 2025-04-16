import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { ConnectedClient } from "./ConnectedClient";
import type { ProxyServer } from "./ProxyServer";
import { createControllerServer } from "./createControllerServer";

export class ControllerClient extends ConnectedClient {
  private proxy: ProxyServer;

  constructor({ proxy }: { proxy: ProxyServer }) {
    super("controller");
    this.proxy = proxy;
  }

  async connect(): Promise<void> {
    const server = await createControllerServer({ proxy: this.proxy });
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    await Promise.all([
      super.connect(clientTransport),
      server.connect(serverTransport),
    ]);
  }
}
