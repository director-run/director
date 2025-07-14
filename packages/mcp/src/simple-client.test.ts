import { ErrorCode } from "@director.run/utilities/error";
import { expectToThrowAppError } from "@director.run/utilities/test";
import { beforeEach, describe, expect, it, test, vi } from "vitest";
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
      await expectToThrowAppError(
        () => SimpleClient.createAndConnectToHTTP("http://localhost/mcp"),
        {
          code: ErrorCode.CONNECTION_REFUSED,
          props: {
            url: "http://localhost/mcp",
          },
        },
      );
    });
  });

  describe("Connection State Tracking", () => {
    let client: SimpleClient;

    beforeEach(() => {
      client = new SimpleClient("test-client");
    });

    it("should initialize as disconnected", () => {
      expect(client.isConnected).toBe(false);
      expect(client.connectionStartTime).toBeUndefined();
    });

    it("should track connection state on HTTP connect", async () => {
      // Mock the parent connect method to succeed
      vi.spyOn(client, "connect").mockResolvedValue();

      const beforeTime = new Date();
      await client.connectToHTTP("http://localhost:3000");
      const afterTime = new Date();

      expect(client.isConnected).toBe(true);
      expect(client.connectionStartTime).toBeDefined();
      expect(client.connectionStartTime?.getTime()).toBeGreaterThanOrEqual(
        beforeTime.getTime(),
      );
      expect(client.connectionStartTime?.getTime()).toBeLessThanOrEqual(
        afterTime.getTime(),
      );
    });

    it("should reset connection state on close", async () => {
      // First connect
      vi.spyOn(client, "connect").mockResolvedValue();
      await client.connectToHTTP("http://localhost:3000");
      expect(client.isConnected).toBe(true);

      // Mock parent close method
      const parentCloseSpy = vi
        .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(client)), "close")
        .mockResolvedValue(undefined);

      // Then close
      await client.close();

      expect(client.isConnected).toBe(false);
      expect(client.connectionStartTime).toBeUndefined();
      expect(parentCloseSpy).toHaveBeenCalled();
    });
  });

  describe("Health Check", () => {
    let client: SimpleClient;

    beforeEach(() => {
      client = new SimpleClient("test-client");
    });

    it("should return false when not connected", async () => {
      expect(client.isConnected).toBe(false);

      const result = await client.healthCheck();

      expect(result).toBe(false);
    });

    it("should return true when ping succeeds", async () => {
      // Set up connected state
      client["_isConnected"] = true;
      client["_connectionStartTime"] = new Date();

      // Mock ping to succeed
      vi.spyOn(client, "ping").mockResolvedValue({});

      const result = await client.healthCheck();

      expect(result).toBe(true);
      expect(client.isConnected).toBe(true);
    });

    it("should return false and disconnect when ping fails", async () => {
      // Set up connected state
      client["_isConnected"] = true;
      client["_connectionStartTime"] = new Date();

      // Mock ping to fail
      vi.spyOn(client, "ping").mockRejectedValue(new Error("Ping failed"));

      const result = await client.healthCheck();

      expect(result).toBe(false);
      expect(client.isConnected).toBe(false);
    });
  });

  describe("Detailed Health Check", () => {
    let client: SimpleClient;

    beforeEach(() => {
      client = new SimpleClient("test-client");
    });

    it("should return detailed health info when healthy", async () => {
      // Set up connected state
      client["_isConnected"] = true;
      client["_connectionStartTime"] = new Date();

      // Mock ping to succeed
      vi.spyOn(client, "ping").mockResolvedValue({});

      const beforeTime = Date.now();
      const result = await client.detailedHealthCheck({});
      const afterTime = Date.now();

      expect(result.isHealthy).toBe(true);
      expect(result.responseTime).toBeGreaterThanOrEqual(0);
      expect(result.responseTime).toBeLessThanOrEqual(afterTime - beforeTime);
      expect(result.error).toBeUndefined();
    });

    it("should return detailed health info when unhealthy", async () => {
      expect(client.isConnected).toBe(false);

      const result = await client.detailedHealthCheck({});

      expect(result.isHealthy).toBe(false);
      expect(result.error).toBe("Connection health check failed");
      expect(result.responseTime).toBeGreaterThanOrEqual(0);
    });
  });
});
