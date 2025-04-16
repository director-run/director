import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { ConnectedClient } from "./ConnectedClient";
import { createControllerServer } from "./createControllerServer";

export class ControllerClient extends ConnectedClient {
  constructor() {
    super("controller");
  }

  async connect(): Promise<void> {
    const server = await createControllerServer();
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    await Promise.all([
      super.connect(clientTransport),
      server.connect(serverTransport),
    ]);
  }
}
