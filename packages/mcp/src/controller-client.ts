import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createControllerServer } from "./create-controller-server";
import type { ProxyServer } from "./proxy-server";
import { SimpleClient } from "./simple-client";

export class ControllerClient extends SimpleClient {
  private proxy: ProxyServer;

  constructor({ proxy }: { proxy: ProxyServer }) {
    super("controller");
    this.proxy = proxy;
  }

  async connect() {
    const server = createControllerServer({ proxy: this.proxy });
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    await Promise.all([
      super.connect(clientTransport),
      server.connect(serverTransport),
    ]);
  }
}
