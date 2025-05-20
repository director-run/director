import type { Server } from "node:http";
import { afterAll, beforeAll, describe, test } from "vitest";
import { SimpleClient } from "./simple-client";
import { SimpleServer } from "./simple-server";
import { serveOverStreamable } from "./streamable";
import { makeEchoServer } from "./test/fixtures";

describe("SimpleServer", () => {
  let httpServer: Server;
  let mcpServer: SimpleServer;

  beforeAll(async () => {
    mcpServer = makeEchoServer();
    httpServer = await serveOverStreamable(mcpServer, 3000);
  });

  afterAll(async () => {
    await httpServer.close();
    await mcpServer.close();
  });

  test("should create a server with a tool", async () => {
    const client = await SimpleClient.createAndConnectToStreamable(
      "http://localhost:3000/mcp",
    );

    console.log(await client.listTools());
  });
});
