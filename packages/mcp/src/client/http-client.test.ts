import { Server } from "http";
import { ErrorCode } from "@director.run/utilities/error";
import { expectToThrowAppError } from "@director.run/utilities/test";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { OAuthProviderFactory } from "../oauth/oauth-provider-factory";
import { makeEchoServer } from "../test/fixtures";
import { serveOverStreamable } from "../transport";
import { serveOverSSE } from "../transport";
import { HTTPClient } from "./http-client";

const STREAMABLE_PORT = 2345;
const SSE_PORT = STREAMABLE_PORT + 1;

describe("HTTPClient", () => {
  let streamableInstance: Server;
  let sseInstance: Server;

  beforeAll(async () => {
    streamableInstance = await serveOverStreamable(
      makeEchoServer(),
      STREAMABLE_PORT,
    );
    sseInstance = await serveOverSSE(makeEchoServer(), SSE_PORT);
  });

  afterAll(async () => {
    await streamableInstance.close();
    await sseInstance.close();
  });

  describe("disabled behaviour", () => {
    test("when the client is connected, it should disconnect when disabled", async () => {
      const client = new HTTPClient({
        name: "test-client",
        url: `http://localhost:${STREAMABLE_PORT}/mcp`,
      });
      await client.connectToTarget({ throwOnError: true });
      expect(client.status).toBe("connected");
      expect(client.isConnected()).toBe(true);
      expect(client.lastErrorMessage).toBeUndefined();
      expect(client.lastConnectedAt).toBeInstanceOf(Date);

      await client.setDisabled(true);
      expect(client.status).toBe("disconnected");
      expect(client.lastErrorMessage).toBeUndefined();
    });

    test("trying to connect a disabled client should not work", async () => {
      const client = new HTTPClient({
        name: "test-client",
        url: `http://localhost:${STREAMABLE_PORT}/mcp`,
        disabled: true,
      });
      expect(await client.connectToTarget({ throwOnError: true })).toBe(false);
      expect(client.status).toBe("disconnected");
      expect(client.lastErrorMessage).toBeUndefined();
      expect(client.lastConnectedAt).toBeUndefined();
    });
  });

  describe("connectToTarget", () => {
    test("should connect to a streamable server", async () => {
      const client = new HTTPClient({
        name: "test-client",
        url: `http://localhost:${STREAMABLE_PORT}/mcp`,
      });
      await client.connectToTarget({ throwOnError: true });

      expect(client.status).toBe("connected");
      expect(client.lastErrorMessage).toBeUndefined();
      expect(client.lastConnectedAt).toBeInstanceOf(Date);

      const tools = await client.listTools();
      expect(tools.tools).toHaveLength(1);
      expect(tools.tools[0].name).toBe("echo");
    });

    test("should connect to an sse server", async () => {
      const client = new HTTPClient({
        name: "test-client",
        url: `http://localhost:${SSE_PORT}/sse`,
      });
      await client.connectToTarget({ throwOnError: true });

      expect(client.status).toBe("connected");
      expect(client.lastErrorMessage).toBeUndefined();
      expect(client.lastConnectedAt).toBeInstanceOf(Date);

      const tools = await client.listTools();
      expect(tools.tools).toHaveLength(1);
      expect(tools.tools[0].name).toBe("echo");
    });

    describe("error handling", () => {
      test("oauth unauthorized", async () => {
        const client = new HTTPClient(
          {
            name: "test-client",
            url: "https://mcp.notion.com/mcp",
          },
          {
            oAuthHandler: new OAuthProviderFactory({
              storage: "memory",
              baseCallbackUrl: "http://localhost:8999",
            }),
          },
        );

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
