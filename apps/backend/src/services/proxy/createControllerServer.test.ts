import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { describe, expect, test } from "vitest";
import { createControllerServer } from "./createControllerServer";

describe("createControllerServer", () => {
  test("should create a controller server", async () => {
    const server = await createControllerServer();

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const client = new Client(
      {
        name: "test client",
        version: "1.0",
      },
      {
        capabilities: {
          sampling: {},
        },
        enforceStrictCapabilities: true,
      },
    );

    await Promise.all([
      client.connect(clientTransport),
      server.connect(serverTransport),
    ]);
    const tools = await client.listTools();

    expect(tools.tools).toHaveLength(2);
    expect(tools.tools[0].name).toBe("create_or_update_file");
    expect(tools.tools[1].name).toBe("search_repositories");
  });
});
