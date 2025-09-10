import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { makeKitchenSinkServer } from "../test/fixtures";
import {
  expectListToolsToReturnToolNames,
  expectToolCallToHaveResult,
} from "../test/helpers";
import { InMemoryClient } from "./in-memory-client";

describe("InMemoryClient", () => {
  let client: InMemoryClient;
  const server = makeKitchenSinkServer();
  beforeEach(() => {
    client = new InMemoryClient(
      {
        name: "test-client",
      },
      {
        server,
      },
    );
  });

  afterEach(async () => {
    await client.close();
  });

  describe("connectToTarget", () => {
    it("should update the client status to connected", async () => {
      expect(client.status).toBe("disconnected");
      expect(await client.connectToTarget({ throwOnError: true })).toBe(true);
      expect(client.status).toBe("connected");
      expect(client.isConnected()).toBe(true);
      expect(client.lastConnectedAt).toBeInstanceOf(Date);
      expect(client.lastErrorMessage).toBeUndefined();
    });
  });

  describe("tools", () => {
    it("should be able to list and call tools", async () => {
      await client.connectToTarget({ throwOnError: true });

      await expectListToolsToReturnToolNames(client, [
        "ping",
        "add",
        "subtract",
        "multiply",
      ]);

      await expectToolCallToHaveResult({
        client,
        toolName: "ping",
        arguments: {},
        expectedResult: { message: "pong" },
      });
    });
  });

  describe("disabled behaviour", () => {
    it("when the client is connected, it should disconnect when disabled", async () => {
      await client.connectToTarget({ throwOnError: true });
      expect(client.status).toBe("connected");
      expect(client.lastErrorMessage).toBeUndefined();
      expect(client.lastConnectedAt).toBeInstanceOf(Date);

      await client.setDisabled(true);
      expect(client.status).toBe("disconnected");
      expect(client.lastErrorMessage).toBeUndefined();
    });

    it("trying to connect a disabled client should not work", async () => {
      const client = new InMemoryClient(
        {
          name: "test-client",
          disabled: true,
        },
        {
          server,
        },
      );
      expect(await client.connectToTarget({ throwOnError: true })).toBe(false);
      expect(client.status).toBe("disconnected");
      expect(client.lastErrorMessage).toBeUndefined();
      expect(client.lastConnectedAt).toBeUndefined();
    });
  });
});
