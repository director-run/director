import type { Server } from "node:http";
import { beforeAll, describe, test } from "vitest";
import { SimpleClient } from "./simple-client";
import { serveOverStreamable } from "./streamable";
import { makeEchoServer } from "./test/fixtures";

describe("SimpleServer", () => {
  let server: Server;

  beforeAll(async () => {
    server = await serveOverStreamable(makeEchoServer(), 3000);
  });

  test("should create a server with a tool", async () => {
    // const server = new SimpleServer();
    const client = await SimpleClient.createAndConnectToStreamable(
      "http://localhost:3000/mcp",
    );

    console.log(await client.listTools());
  });
});
