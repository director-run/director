import path from "path";
import { describe, expect, test } from "vitest";
import { SimpleClient } from "./simple-client";
import { makeEchoServer } from "./test/fixtures";
import { serveOverSSE } from "./transport";
describe("transport", () => {
  describe("serveOverStdio", () => {
    test("should expose a server over stdio", async () => {
      const basePath = __dirname;
      const client = await SimpleClient.createAndConnectToStdio("bun", [
        "-e",
        `
            import { makeEchoServer } from '${path.join(basePath, "test/fixtures.ts")}'; 
            import { serveOverStdio } from '${path.join(basePath, "transport.ts")}'; 
            serveOverStdio(makeEchoServer());
        `,
      ]);
      const tools = await client.listTools();
      expect(tools.tools).toHaveLength(1);
      expect(tools.tools[0].name).toBe("echo");
    });
  });

  describe("serveOverSSE", () => {
    test("should expose a server over stdio", async () => {
      const server = makeEchoServer();
      const app = serveOverSSE(server, 3000);
      const client = await SimpleClient.createAndConnectToSSE(
        `http://localhost:3000/sse`,
      );
      const tools = await client.listTools();
      expect(tools.tools).toHaveLength(1);
      expect(tools.tools[0].name).toBe("echo");
    });
  });
});
