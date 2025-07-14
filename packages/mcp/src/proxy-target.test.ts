import type { ProxyTargetAttributes } from "@director.run/utilities/schema";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProxyTarget } from "./proxy-target";

describe("ProxyTarget", () => {
  let mockAttributes: ProxyTargetAttributes;
  let proxyTarget: ProxyTarget;

  beforeEach(() => {
    mockAttributes = {
      name: "test-server",
      transport: {
        type: "stdio",
        command: "echo",
        args: ["hello"],
      },
    };
    proxyTarget = new ProxyTarget(mockAttributes);
  });

  describe("Status Management", () => {
    it("should initialize with disconnected status", () => {
      expect(proxyTarget.status).toBe("disconnected");
      expect(proxyTarget.lastError).toBeUndefined();
      expect(proxyTarget.connectedAt).toBeUndefined();
    });

    it("should update status correctly", () => {
      const beforeTime = new Date();
      proxyTarget.setStatus("starting");
      const afterTime = new Date();

      expect(proxyTarget.status).toBe("starting");
      expect(proxyTarget.lastAttemptAt).toBeDefined();
      expect(proxyTarget.lastAttemptAt?.getTime()).toBeGreaterThanOrEqual(
        beforeTime.getTime(),
      );
      expect(proxyTarget.lastAttemptAt?.getTime()).toBeLessThanOrEqual(
        afterTime.getTime(),
      );
    });

    it("should set error information when status fails", () => {
      const errorMessage = "Connection failed";
      const beforeTime = new Date();

      proxyTarget.setStatus("failed", errorMessage);
      const afterTime = new Date();

      expect(proxyTarget.status).toBe("failed");
      expect(proxyTarget.lastError).toBe(errorMessage);
      expect(proxyTarget.lastErrorAt).toBeDefined();
      expect(proxyTarget.lastErrorAt?.getTime()).toBeGreaterThanOrEqual(
        beforeTime.getTime(),
      );
      expect(proxyTarget.lastErrorAt?.getTime()).toBeLessThanOrEqual(
        afterTime.getTime(),
      );
    });

    it("should clear error when status becomes running", () => {
      // First set an error
      proxyTarget.setStatus("failed", "Some error");
      expect(proxyTarget.lastError).toBe("Some error");
      expect(proxyTarget.lastErrorAt).toBeDefined();

      // Then set to running
      const beforeTime = new Date();
      proxyTarget.setStatus("running");
      const afterTime = new Date();

      expect(proxyTarget.status).toBe("running");
      expect(proxyTarget.lastError).toBeUndefined();
      expect(proxyTarget.lastErrorAt).toBeUndefined();
      expect(proxyTarget.connectedAt).toBeDefined();
      expect(proxyTarget.connectedAt?.getTime()).toBeGreaterThanOrEqual(
        beforeTime.getTime(),
      );
      expect(proxyTarget.connectedAt?.getTime()).toBeLessThanOrEqual(
        afterTime.getTime(),
      );
    });

    it("should return complete status info", () => {
      proxyTarget.setStatus("failed", "Test error");

      const statusInfo = proxyTarget.getStatusInfo();

      expect(statusInfo).toMatchObject({
        status: "failed",
        lastError: "Test error",
        lastErrorAt: expect.any(Date),
        connectedAt: null,
        lastAttemptAt: null,
        errorCategory: expect.any(String),
        isRetryable: expect.any(Boolean),
        suggestedAction: expect.any(String),
        circuitBreakerState: null,
      });
    });
  });

  describe("Server Management", () => {
    it("should enable a disabled server", () => {
      proxyTarget.setStatus("disabled");
      expect(proxyTarget.status).toBe("disabled");

      proxyTarget.enable();
      expect(proxyTarget.status).toBe("disconnected");
    });

    it("should disable a server", () => {
      proxyTarget.setStatus("running");
      expect(proxyTarget.status).toBe("running");

      proxyTarget.disable();
      expect(proxyTarget.status).toBe("disabled");
    });

    it("should not enable if not disabled", () => {
      proxyTarget.setStatus("running");
      proxyTarget.enable();
      expect(proxyTarget.status).toBe("running");
    });
  });

  describe("Smart Connect", () => {
    it("should skip connection if disabled", async () => {
      proxyTarget.setStatus("disabled");

      await proxyTarget.smartConnect();

      expect(proxyTarget.status).toBe("disabled");
    });

    it("should set starting status when connecting", async () => {
      const connectSpy = vi
        .spyOn(proxyTarget, "connectToStdio")
        .mockRejectedValue(new Error("Mock error"));

      await proxyTarget.smartConnect();

      expect(connectSpy).toHaveBeenCalled();
      expect(proxyTarget.status).toBe("failed");
      expect(proxyTarget.lastError).toContain("Mock error");
    });

    it("should handle HTTP transport", async () => {
      const httpAttributes: ProxyTargetAttributes = {
        name: "http-server",
        transport: {
          type: "http",
          url: "http://localhost:3000",
        },
      };
      const httpTarget = new ProxyTarget(httpAttributes);

      const connectSpy = vi
        .spyOn(httpTarget, "connectToHTTP")
        .mockRejectedValue(new Error("HTTP error"));

      await httpTarget.smartConnect();

      expect(connectSpy).toHaveBeenCalledWith(
        "http://localhost:3000",
        undefined,
      );
      expect(httpTarget.status).toBe("failed");
    });

    it("should handle STDIO transport", async () => {
      const connectSpy = vi
        .spyOn(proxyTarget, "connectToStdio")
        .mockRejectedValue(new Error("STDIO error"));

      await proxyTarget.smartConnect();

      expect(connectSpy).toHaveBeenCalledWith(
        "echo",
        ["hello"],
        expect.any(Object),
      );
      expect(proxyTarget.status).toBe("failed");
    });

    it("should throw error when throwOnError is true", async () => {
      vi.spyOn(proxyTarget, "connectToStdio").mockRejectedValue(
        new Error("Connection failed"),
      );

      await expect(
        proxyTarget.smartConnect({ throwOnError: true }),
      ).rejects.toThrow("Connection failed");
    });
  });

  describe("Restart", () => {
    it("should close connection and reconnect", async () => {
      const closeSpy = vi.spyOn(proxyTarget, "close").mockResolvedValue();
      const connectSpy = vi
        .spyOn(proxyTarget, "smartConnect")
        .mockResolvedValue();

      await proxyTarget.restart();

      expect(closeSpy).toHaveBeenCalled();
      expect(connectSpy).toHaveBeenCalled();
      expect(proxyTarget.status).toBe("disconnected");
    });

    it("should handle close errors gracefully", async () => {
      const closeSpy = vi
        .spyOn(proxyTarget, "close")
        .mockRejectedValue(new Error("Close error"));
      const connectSpy = vi
        .spyOn(proxyTarget, "smartConnect")
        .mockResolvedValue();

      await proxyTarget.restart();

      expect(closeSpy).toHaveBeenCalled();
      expect(connectSpy).toHaveBeenCalled();
    });
  });

  describe("Enhanced Health Check", () => {
    it("should return unhealthy for disabled server", async () => {
      proxyTarget.setStatus("disabled");

      const result = await proxyTarget.enhancedHealthCheck();

      expect(result.isHealthy).toBe(false);
      expect(result.error).toBe("Server is disabled");
    });

    it("should update status based on health check result", async () => {
      proxyTarget.setStatus("running");

      // Create a proxy target with a failing transport to trigger health check failure
      const failingProxyTarget = new ProxyTarget({
        name: "failing-target",
        transport: {
          type: "http",
          url: "http://non-existent-server:9999",
        },
      });
      failingProxyTarget.setStatus("running");

      const result = await failingProxyTarget.enhancedHealthCheck();

      expect(result.isHealthy).toBe(false);
      expect(failingProxyTarget.status).toBe("failed");
    });
  });

  describe("Circuit Breaker Integration", () => {
    it("should use circuit breaker when available", async () => {
      const mockCircuitBreaker = {
        execute: vi.fn().mockResolvedValue(undefined),
        getState: vi.fn().mockReturnValue("closed"),
      };

      const targetWithCircuitBreaker = new ProxyTarget(
        mockAttributes,
        mockCircuitBreaker,
      );
      vi.spyOn(targetWithCircuitBreaker, "connectToStdio").mockResolvedValue();

      await targetWithCircuitBreaker.smartConnect();

      expect(mockCircuitBreaker.execute).toHaveBeenCalled();
      expect(targetWithCircuitBreaker.status).toBe("running");
    });

    it("should handle circuit breaker open state", async () => {
      const mockCircuitBreaker = {
        execute: vi
          .fn()
          .mockRejectedValue(new Error("Circuit breaker is OPEN")),
        getState: vi.fn().mockReturnValue("open"),
      };

      const targetWithCircuitBreaker = new ProxyTarget(
        mockAttributes,
        mockCircuitBreaker,
      );

      await targetWithCircuitBreaker.smartConnect();

      expect(targetWithCircuitBreaker.status).toBe("failed");
      expect(targetWithCircuitBreaker.lastError).toContain(
        "Circuit breaker is OPEN",
      );
    });

    it("should include circuit breaker state in status info", () => {
      const mockCircuitBreaker = {
        getState: vi.fn().mockReturnValue("half_open"),
        execute: vi.fn().mockImplementation((fn) => fn()),
      };

      const targetWithCircuitBreaker = new ProxyTarget(
        mockAttributes,
        mockCircuitBreaker,
      );
      const statusInfo = targetWithCircuitBreaker.getStatusInfo();

      expect(statusInfo.circuitBreakerState).toBe("half_open");
    });
  });
});
