import { describe, test } from "vitest";
import { SimpleClient } from "./simple-client";

describe("SimpleServer", () => {
  test("should create a server with a tool", async () => {
    // const server = new SimpleServer();
    const client = await SimpleClient.createAndConnectToStreamable(
      "http://localhost:3000/mcp",
    );

    console.log(await client.listTools());
  });
});
