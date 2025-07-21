import {} from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import {} from "@modelcontextprotocol/sdk/client/auth.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { AbstractClient } from "./abstract-client";

const logger = getLogger("client/in-memory");

export class InMemoryClient extends AbstractClient {
  private server: Server;
  private serverTransport: InMemoryTransport;
  private clientTransport: InMemoryTransport;

  constructor(params: {
    name: string;
    server: Server;
  }) {
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    super(params.name);
    this.server = params.server;
    this.serverTransport = serverTransport;
    this.clientTransport = clientTransport;
  }

  public static async createAndConnectToServer(
    server: Server,
  ): Promise<InMemoryClient> {
    const client = new InMemoryClient({
      name: "test client",
      server,
    });

    await client.connectToTarget({ throwOnError: true });

    return client;
  }

  public async connectToTarget({ throwOnError }: { throwOnError: boolean }) {
    await Promise.all([
      this.connect(this.clientTransport),
      this.server.connect(this.serverTransport),
    ]);
  }
}
