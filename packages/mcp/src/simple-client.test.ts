import { ErrorCode } from "@director.run/utilities/error";
import { AppError } from "@director.run/utilities/error";
import { describe, expect, test } from "vitest";
import { SimpleClient } from "./simple-client";
import { makeEchoServer } from "./test/fixtures";
import { serveOverSSE, serveOverStreamable } from "./transport";

describe("SimpleClient", () => {
  describe("createAndConnectToHTTP", () => {
    describe("when connecting to a streamable server", () => {
      test("should connect properly", async () => {
        const instance = await serveOverStreamable(makeEchoServer(), 2345);
        const client = await SimpleClient.createAndConnectToHTTP(
          "http://localhost:2345/mcp",
        );

        const tools = await client.listTools();
        expect(tools.tools).toHaveLength(1);
        expect(tools.tools[0].name).toBe("echo");
        await instance.close();
      });
    });
    describe("when connecting to a sse server", () => {
      test("should connect properly", async () => {
        const instance = await serveOverSSE(makeEchoServer(), 2345);
        const client = await SimpleClient.createAndConnectToHTTP(
          "http://localhost:2345/sse",
        );

        const tools = await client.listTools();
        expect(tools.tools).toHaveLength(1);
        expect(tools.tools[0].name).toBe("echo");
        await instance.close();
      });
    });
    test("should fail properly", async () => {
      const error = await SimpleClient.createAndConnectToHTTP(
        "http://localhost/mcp",
      ).catch((e) => e);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toMatchObject({
        code: ErrorCode.CONNECTION_REFUSED,
        props: {
          url: "http://localhost/mcp",
        },
      });
    });
  });
});
