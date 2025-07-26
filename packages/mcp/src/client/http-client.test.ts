import { ErrorCode } from "@director.run/utilities/error";
import { expectToThrowAppError } from "@director.run/utilities/test";
import { describe, expect, test } from "vitest";
import { OAuthHandler } from "../oauth/oauth-provider-factory";
import { makeEchoServer } from "../test/fixtures";
import { serveOverStreamable } from "../transport";
import { serveOverSSE } from "../transport";
import { HTTPClient } from "./http-client";

describe("HTTPClient", () => {
  describe("connectToTarget", () => {
    test("should connect to a streamable server", async () => {
      const instance = await serveOverStreamable(makeEchoServer(), 2345);
      const client = new HTTPClient({
        name: "test-client",
        url: "http://localhost:2345/mcp",
      });
      await client.connectToTarget({ throwOnError: true });

      expect(client.status).toBe("connected");
      expect(client.lastErrorMessage).toBeUndefined();
      expect(client.lastConnectedAt).toBeInstanceOf(Date);

      const tools = await client.listTools();
      expect(tools.tools).toHaveLength(1);
      expect(tools.tools[0].name).toBe("echo");
      await instance.close();
    });

    test("should connect to an sse server", async () => {
      const instance = await serveOverSSE(makeEchoServer(), 2345);

      const client = new HTTPClient({
        name: "test-client",
        url: "http://localhost:2345/sse",
      });
      await client.connectToTarget({ throwOnError: true });

      expect(client.status).toBe("connected");
      expect(client.lastErrorMessage).toBeUndefined();
      expect(client.lastConnectedAt).toBeInstanceOf(Date);

      const tools = await client.listTools();
      expect(tools.tools).toHaveLength(1);
      expect(tools.tools[0].name).toBe("echo");
      await instance.close();
    });

    describe("error handling", () => {
      test("oauth unauthorized", async () => {
        const client = new HTTPClient({
          name: "test-client",
          url: "https://mcp.notion.com/mcp",
          oAuthHandler: OAuthHandler.createMemoryBackedHandler({
            baseCallbackUrl: "http://localhost:8999",
          }),
        });

        const result = await client.connectToTarget({
          throwOnError: false,
        });

        expect(result).toBe(false);
        expect(client.status).toBe("unauthorized");
        expect(client.lastConnectedAt).toBeUndefined();
        expect(client.lastErrorMessage).toBe(
          "unauthorized, please re-authenticate",
        );
      });

      test("throwOnError = true", async () => {
        const client = new HTTPClient({
          name: "test-client",
          url: "http://localhost/mcp",
        });

        await expectToThrowAppError(
          () => client.connectToTarget({ throwOnError: true }),
          {
            code: ErrorCode.CONNECTION_REFUSED,
            props: {
              url: "http://localhost/mcp",
            },
          },
        );

        expect(client.status).toBe("error");
        expect(client.lastErrorMessage).toBe("connection refused");
        expect(client.lastConnectedAt).toBeUndefined();
      });

      test("throwOnError = false", async () => {
        const client = new HTTPClient({
          name: "test-client",
          url: "http://localhost/mcp",
        });

        await client.connectToTarget({ throwOnError: false });

        expect(client.status).toBe("error");
        expect(client.lastErrorMessage).toBe("connection refused");
        expect(client.lastConnectedAt).toBeUndefined();
      });
    });
  });
});
