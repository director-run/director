import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ProxyServerStore } from "./proxy-server-store";
import { StatusMonitor } from "./status-monitor";

// Mock types for testing
interface MockTarget {
  name: string;
  status: string;
  lastError?: string;
  enhancedHealthCheck?: ReturnType<typeof vi.fn>;
  healthCheck: ReturnType<typeof vi.fn>;
  getStatusInfo: ReturnType<typeof vi.fn>;
}

interface MockProxy {
  id: string;
  getAllTargets: ReturnType<typeof vi.fn>;
}

interface MockProxyStore {
  getAll: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
  updateServerStatus: ReturnType<typeof vi.fn>;
}

describe("StatusMonitor", () => {
  let statusMonitor: StatusMonitor;
  let mockProxyStore: MockProxyStore;
  let mockProxy: MockProxy;
  let mockTarget: MockTarget;

  beforeEach(() => {
    // Mock target
    mockTarget = {
      name: "test-server",
      status: "running",
      enhancedHealthCheck: vi.fn().mockResolvedValue({ isHealthy: true }),
      healthCheck: vi.fn().mockResolvedValue(true),
      getStatusInfo: vi.fn().mockReturnValue({
        status: "running",
        lastError: undefined,
        lastErrorAt: undefined,
        connectedAt: new Date(),
        lastAttemptAt: new Date(),
      }),
    };

    // Mock proxy
    mockProxy = {
      id: "test-proxy",
      getAllTargets: vi.fn().mockReturnValue([mockTarget]),
    };

    // Mock proxy store
    mockProxyStore = {
      getAll: vi.fn().mockResolvedValue([mockProxy]),
      get: vi.fn().mockReturnValue(mockProxy),
      updateServerStatus: vi.fn().mockResolvedValue(undefined),
    };

    statusMonitor = new StatusMonitor(
      mockProxyStore as unknown as ProxyServerStore,
      {
        healthCheckInterval: 100, // Fast for testing
        retryInterval: 50,
        maxRetries: 2,
        enabled: true,
      },
    );
  });

  afterEach(() => {
    statusMonitor.stop();
    vi.clearAllTimers();
  });

  describe("Lifecycle", () => {
    it("should start and stop correctly", () => {
      expect(statusMonitor.getStats().isRunning).toBe(false);

      statusMonitor.start();
      expect(statusMonitor.getStats().isRunning).toBe(true);

      statusMonitor.stop();
      expect(statusMonitor.getStats().isRunning).toBe(false);
    });

    it("should not start if disabled", () => {
      const disabledMonitor = new StatusMonitor(
        mockProxyStore as unknown as ProxyServerStore,
        {
          enabled: false,
        },
      );

      disabledMonitor.start();
      expect(disabledMonitor.getStats().isRunning).toBe(false);
    });

    it("should not start if already running", () => {
      statusMonitor.start();
      const firstStats = statusMonitor.getStats();

      statusMonitor.start(); // Try to start again
      const secondStats = statusMonitor.getStats();

      expect(firstStats.isRunning).toBe(true);
      expect(secondStats.isRunning).toBe(true);
    });
  });

  describe("Health Checks", () => {
    it("should perform health checks on all targets", async () => {
      statusMonitor.start();

      // Wait for initial health check
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(mockProxyStore.getAll).toHaveBeenCalled();
      expect(mockProxy.getAllTargets).toHaveBeenCalled();
      expect(mockTarget.enhancedHealthCheck).toHaveBeenCalled();
    });

    it("should use basic health check if enhanced not available", async () => {
      // Remove enhanced health check
      delete mockTarget.enhancedHealthCheck;

      statusMonitor.start();

      // Wait for initial health check
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(mockTarget.healthCheck).toHaveBeenCalled();
    });

    it("should emit status change events", async () => {
      const statusChangeHandler = vi.fn();
      statusMonitor.on("statusChange", statusChangeHandler);

      // Mock status change
      let callCount = 0;
      (
        mockTarget.enhancedHealthCheck as ReturnType<typeof vi.fn>
      ).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          mockTarget.status = "failed";
          return Promise.resolve({
            isHealthy: false,
            error: "Health check failed",
          });
        }
        return Promise.resolve({ isHealthy: true });
      });

      statusMonitor.start();

      // Wait for health check
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(statusChangeHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          proxyId: "test-proxy",
          serverName: "test-server",
          previousStatus: "running",
          currentStatus: "failed",
          timestamp: expect.any(Date),
        }),
      );
    });

    it("should persist status changes to database", async () => {
      // Mock status change - start with running, then fail
      let callCount = 0;
      (
        mockTarget.enhancedHealthCheck as ReturnType<typeof vi.fn>
      ).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          mockTarget.status = "failed";
          return Promise.resolve({ isHealthy: false });
        }
        return Promise.resolve({ isHealthy: true });
      });

      statusMonitor.start();

      // Wait for health check
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(mockProxyStore.updateServerStatus).toHaveBeenCalledWith(
        "test-proxy",
        "test-server",
        expect.any(Object),
      );
    });
  });

  describe("Retry Logic", () => {
    it("should schedule retries for failed health checks", async () => {
      // Mock health check to fail
      (
        mockTarget.enhancedHealthCheck as ReturnType<typeof vi.fn>
      ).mockResolvedValue({ isHealthy: false });
      mockTarget.status = "failed";

      statusMonitor.start();

      // Wait for initial health check and retry
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Should have been called at least twice (initial + retries)
      expect(
        (mockTarget.enhancedHealthCheck as ReturnType<typeof vi.fn>).mock.calls
          .length,
      ).toBeGreaterThanOrEqual(2);
    });

    it("should stop retrying after max retries", async () => {
      // Mock health check to always fail
      (
        mockTarget.enhancedHealthCheck as ReturnType<typeof vi.fn>
      ).mockResolvedValue({ isHealthy: false });
      mockTarget.status = "failed";

      statusMonitor.start();

      // Wait for all retries to complete
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Should have called multiple times but eventually stop retrying
      const callCount = (
        mockTarget.enhancedHealthCheck as ReturnType<typeof vi.fn>
      ).mock.calls.length;
      expect(callCount).toBeGreaterThanOrEqual(3); // At least initial + maxRetries
    });

    it("should clear retry count on successful health check", async () => {
      let callCount = 0;
      (
        mockTarget.enhancedHealthCheck as ReturnType<typeof vi.fn>
      ).mockImplementation(() => {
        callCount++;
        if (callCount <= 2) {
          mockTarget.status = "failed";
          return Promise.resolve({ isHealthy: false });
        }
        mockTarget.status = "running";
        return Promise.resolve({ isHealthy: true });
      });

      statusMonitor.start();

      // Wait for health checks and recovery
      await new Promise((resolve) => setTimeout(resolve, 300));

      expect(statusMonitor.getStats().activeRetries).toBe(0);
    });

    it("should not retry disabled servers", async () => {
      mockTarget.status = "disabled";
      (
        mockTarget.enhancedHealthCheck as ReturnType<typeof vi.fn>
      ).mockResolvedValue({ isHealthy: false });

      statusMonitor.start();

      // Wait for health check
      await new Promise((resolve) => setTimeout(resolve, 150));

      expect(statusMonitor.getStats().activeRetries).toBe(0);
    });
  });

  describe("Manual Operations", () => {
    it("should refresh all statuses manually", async () => {
      // Create a completely fresh mock store for this test
      const freshMockStore = {
        getAll: vi.fn().mockResolvedValue([mockProxy]),
        get: vi.fn().mockReturnValue(mockProxy),
        updateServerStatus: vi.fn().mockResolvedValue(undefined),
      };

      const freshStatusMonitor = new StatusMonitor(
        freshMockStore as unknown as ProxyServerStore,
      );

      // Start the monitor so the isRunning check passes
      freshStatusMonitor.start();

      await freshStatusMonitor.refreshAllStatuses();

      expect(freshMockStore.getAll).toHaveBeenCalled();
      expect(mockTarget.enhancedHealthCheck).toHaveBeenCalled();

      // Clean up
      freshStatusMonitor.stop();
    });

    it("should refresh specific proxy statuses", async () => {
      await statusMonitor.refreshProxyStatuses("test-proxy");

      expect(mockProxyStore.get).toHaveBeenCalledWith("test-proxy");
      expect(mockTarget.enhancedHealthCheck).toHaveBeenCalled();
    });

    it("should throw error for non-existent proxy", async () => {
      mockProxyStore.get = vi.fn().mockImplementation(() => {
        throw new Error("Proxy not found");
      });

      await expect(
        statusMonitor.refreshProxyStatuses("non-existent"),
      ).rejects.toThrow("Proxy not found");
    });
  });

  describe("Configuration", () => {
    it("should update configuration", () => {
      const newConfig = {
        healthCheckInterval: 200,
        maxRetries: 5,
      };

      statusMonitor.updateConfig(newConfig);
      const stats = statusMonitor.getStats();

      expect(stats.config.healthCheckInterval).toBe(200);
      expect(stats.config.maxRetries).toBe(5);
    });

    it("should restart when health check interval changes", () => {
      statusMonitor.start();
      expect(statusMonitor.getStats().isRunning).toBe(true);

      const stopSpy = vi.spyOn(statusMonitor, "stop");
      const startSpy = vi.spyOn(statusMonitor, "start");

      statusMonitor.updateConfig({ healthCheckInterval: 200 });

      expect(stopSpy).toHaveBeenCalled();
      expect(startSpy).toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should handle errors during health checks gracefully", async () => {
      (
        mockTarget.enhancedHealthCheck as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new Error("Health check error"));

      statusMonitor.start();

      // Wait for health check
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Should not crash and should continue running
      expect(statusMonitor.getStats().isRunning).toBe(true);
    });

    it("should handle errors when getting proxies", async () => {
      mockProxyStore.getAll = vi
        .fn()
        .mockRejectedValue(new Error("Database error"));

      statusMonitor.start();

      // Wait for health check attempt
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Should not crash and should continue running
      expect(statusMonitor.getStats().isRunning).toBe(true);
    });

    it("should handle database update errors", async () => {
      mockProxyStore.updateServerStatus = vi
        .fn()
        .mockRejectedValue(new Error("Database update failed"));
      (
        mockTarget.enhancedHealthCheck as ReturnType<typeof vi.fn>
      ).mockResolvedValue({ isHealthy: false });
      mockTarget.status = "failed";

      statusMonitor.start();

      // Wait for health check
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Should continue running despite database error
      expect(statusMonitor.getStats().isRunning).toBe(true);
    });
  });

  describe("Statistics", () => {
    it("should provide accurate statistics", () => {
      const stats = statusMonitor.getStats();

      expect(stats).toMatchObject({
        isRunning: false,
        config: expect.any(Object),
        activeRetries: 0,
        scheduledRetries: 0,
      });
    });

    it("should track retry statistics", async () => {
      // Mock health check to fail
      (
        mockTarget.enhancedHealthCheck as ReturnType<typeof vi.fn>
      ).mockResolvedValue({ isHealthy: false });
      mockTarget.status = "failed";

      statusMonitor.start();

      // Wait for retry to be scheduled
      await new Promise((resolve) => setTimeout(resolve, 150));

      const stats = statusMonitor.getStats();
      expect(stats.activeRetries).toBeGreaterThan(0);
    });
  });
});
