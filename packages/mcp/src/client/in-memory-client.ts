import {} from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import {} from "@modelcontextprotocol/sdk/client/auth.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { AbstractClient } from "./abstract-client";

const logger = getLogger("client/in-memory");

export class InMemoryClient extends AbstractClient {
  private server: Server;
  constructor(params: { name: string; server: Server }) {
    super(params.name);
    this.server = params.server;
  }

  public static async createAndConnectToServer(
    server: Server,
  ): Promise<InMemoryClient> {
    const client = new InMemoryClient({ name: "test client", server });
    await client.connectToTarget({ throwOnError: true });
    return client;
  }

  public async connectToTarget({ throwOnError }: { throwOnError: boolean }) {
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const client = new InMemoryClient({
      name: "test client",
      server: this.server,
    });

    await Promise.all([
      client.connect(clientTransport),
      this.server.connect(serverTransport),
    ]);
  }
}
