import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { ConnectedClient } from "./connected-client";
import { createControllerServer } from "./create-controller-server";
import type { ProxyServer } from "./proxy-server";

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
