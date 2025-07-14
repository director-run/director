import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConnectionManager } from "./connection-manager";

describe("ConnectionManager", () => {
  let connectionManager: ConnectionManager;

  beforeEach(() => {
    connectionManager = new ConnectionManager({
      maxConnections: 5,
      connectionTTL: 100, // Fast for testing
      healthCheckInterval: 50,
      enableConnectionReuse: true,
    });
  });

  afterEach(() => {
    connectionManager.stop();
    vi.clearAllTimers();
  });

  describe("Connection Registration", () => {
    it("should register new connection", () => {
      const connectionId = connectionManager.registerConnection(
        "proxy1",
        "server1",
      );

      expect(connectionId).toBe("proxy1:server1");

      const connection = connectionManager.getConnection(connectionId);
      expect(connection).toMatchObject({
        id: "proxy1:server1",
        proxyId: "proxy1",
        serverName: "server1",
        connectionCount: 1,
        isHealthy: true,
      });
    });

    it("should reuse existing connection", () => {
      const connectionId1 = connectionManager.registerConnection(
        "proxy1",
        "server1",
      );
      const connectionId2 = connectionManager.registerConnection(
        "proxy1",
        "server1",
      );

      expect(connectionId1).toBe(connectionId2);

      const connection = connectionManager.getConnection(connectionId1);
      expect(connection?.connectionCount).toBe(2);
    });

    it("should update last used time on reuse", () => {
      const connectionId = connectionManager.registerConnection(
        "proxy1",
        "server1",
      );
      const firstConnection = connectionManager.getConnection(connectionId);
      const firstTime = firstConnection?.lastUsed;

      // Wait a bit
      setTimeout(() => {
        connectionManager.registerConnection("proxy1", "server1");
        const secondConnection = connectionManager.getConnection(connectionId);
        const secondTime = secondConnection?.lastUsed;

        expect(secondTime?.getTime()).toBeGreaterThan(
          firstTime?.getTime() || 0,
        );
      }, 10);
    });
  });

  describe("Connection Health Management", () => {
    it("should update connection health", () => {
      const connectionId = connectionManager.registerConnection(
        "proxy1",
        "server1",
      );

      connectionManager.updateConnectionHealth(connectionId, false);

      const connection = connectionManager.getConnection(connectionId);
      expect(connection?.isHealthy).toBe(false);
    });

    it("should update last used time when updating health", () => {
      const connectionId = connectionManager.registerConnection(
        "proxy1",
        "server1",
      );
      const firstConnection = connectionManager.getConnection(connectionId);
      const firstTime = firstConnection?.lastUsed;

      setTimeout(() => {
        connectionManager.updateConnectionHealth(connectionId, true);
        const secondConnection = connectionManager.getConnection(connectionId);
        const secondTime = secondConnection?.lastUsed;

        expect(secondTime?.getTime()).toBeGreaterThan(
          firstTime?.getTime() || 0,
        );
      }, 10);
    });

    it("should ignore health updates for non-existent connections", () => {
      connectionManager.updateConnectionHealth("non-existent", false);

      const connection = connectionManager.getConnection("non-existent");
      expect(connection).toBeUndefined();
    });
  });

  describe("Connection Removal", () => {
    it("should remove connection", () => {
      const connectionId = connectionManager.registerConnection(
        "proxy1",
        "server1",
      );

      const removed = connectionManager.removeConnection(connectionId);
      expect(removed).toBe(true);

      const connection = connectionManager.getConnection(connectionId);
      expect(connection).toBeUndefined();
    });

    it("should return false when removing non-existent connection", () => {
      const removed = connectionManager.removeConnection("non-existent");
      expect(removed).toBe(false);
    });
  });

  describe("Connection Queries", () => {
    beforeEach(() => {
      connectionManager.registerConnection("proxy1", "server1");
      connectionManager.registerConnection("proxy1", "server2");
      connectionManager.registerConnection("proxy2", "server1");
      connectionManager.updateConnectionHealth("proxy1:server2", false);
    });

    it("should get connections by proxy", () => {
      const connections = connectionManager.getConnectionsByProxy("proxy1");

      expect(connections).toHaveLength(2);
      expect(connections.map((c) => c.serverName)).toEqual(
        expect.arrayContaining(["server1", "server2"]),
      );
    });

    it("should get healthy connections", () => {
      const healthyConnections = connectionManager.getHealthyConnections();

      expect(healthyConnections).toHaveLength(2);
      expect(healthyConnections.every((c) => c.isHealthy)).toBe(true);
    });

    it("should return empty array for non-existent proxy", () => {
      const connections =
        connectionManager.getConnectionsByProxy("non-existent");
      expect(connections).toHaveLength(0);
    });
  });

  describe("Statistics", () => {
    beforeEach(() => {
      connectionManager.registerConnection("proxy1", "server1");
      connectionManager.registerConnection("proxy1", "server2");
      connectionManager.registerConnection("proxy2", "server1");
      connectionManager.updateConnectionHealth("proxy1:server2", false);
    });

    it("should provide accurate statistics", () => {
      const stats = connectionManager.getStats();

      expect(stats).toMatchObject({
        totalConnections: 3,
        healthyConnections: 2,
        unhealthyConnections: 1,
        maxConnections: 5,
        connectionsByProxy: {
          proxy1: 2,
          proxy2: 1,
        },
      });
    });
  });

  describe("Cleanup", () => {
    it("should clean up stale connections", async () => {
      const connectionId = connectionManager.registerConnection(
        "proxy1",
        "server1",
      );

      // Wait for TTL to expire
      await new Promise((resolve) => setTimeout(resolve, 150));

      connectionManager.cleanup();

      const connection = connectionManager.getConnection(connectionId);
      expect(connection).toBeUndefined();
    });

    it("should clean up unhealthy connections", () => {
      const connectionId = connectionManager.registerConnection(
        "proxy1",
        "server1",
      );
      connectionManager.updateConnectionHealth(connectionId, false);

      connectionManager.cleanup();

      const connection = connectionManager.getConnection(connectionId);
      expect(connection).toBeUndefined();
    });

    it("should not clean up healthy recent connections", () => {
      const connectionId = connectionManager.registerConnection(
        "proxy1",
        "server1",
      );

      connectionManager.cleanup();

      const connection = connectionManager.getConnection(connectionId);
      expect(connection).toBeDefined();
    });
  });

  describe("Automatic Health Checks", () => {
    it("should start health checks when enabled", async () => {
      const connectionId = connectionManager.registerConnection(
        "proxy1",
        "server1",
      );

      // Verify connection exists immediately
      const connection = connectionManager.getConnection(connectionId);
      expect(connection).toBeDefined();

      // Wait for health check interval (but not long enough for TTL to expire)
      await new Promise((resolve) => setTimeout(resolve, 60));

      // Connection should still exist if healthy and within TTL
      const connectionAfter = connectionManager.getConnection(connectionId);
      expect(connectionAfter).toBeDefined();
    });

    it("should not start health checks when disabled", () => {
      const disabledManager = new ConnectionManager({
        enableConnectionReuse: false,
      });

      // Should not have started interval
      expect(disabledManager["healthCheckInterval"]).toBeUndefined();

      disabledManager.stop();
    });
  });

  describe("Configuration Updates", () => {
    it("should update configuration", () => {
      connectionManager.updateConfig({
        maxConnections: 10,
        connectionTTL: 200,
      });

      const stats = connectionManager.getStats();
      expect(stats.config.maxConnections).toBe(10);
      expect(stats.config.connectionTTL).toBe(200);
    });

    it("should recreate cache when max connections changes", () => {
      const connectionId = connectionManager.registerConnection(
        "proxy1",
        "server1",
      );

      connectionManager.updateConfig({ maxConnections: 10 });

      // Connection should still exist after cache recreation
      const connection = connectionManager.getConnection(connectionId);
      expect(connection).toBeDefined();
    });

    it("should restart health checks when interval changes", () => {
      const stopSpy = vi.spyOn(connectionManager, "stop");

      connectionManager.updateConfig({ healthCheckInterval: 200 });

      // Should have restarted health checks
      expect(connectionManager["healthCheckInterval"]).toBeDefined();
    });
  });

  describe("Connection History", () => {
    it("should provide connection history for active connection", () => {
      const connectionId = connectionManager.registerConnection(
        "proxy1",
        "server1",
      );

      const history = connectionManager.getConnectionHistory(connectionId);

      expect(history.isActive).toBe(true);
      expect(history.connectionInfo).toBeDefined();
      expect(history.connectionInfo?.id).toBe(connectionId);
    });

    it("should provide connection history for inactive connection", () => {
      const history = connectionManager.getConnectionHistory("non-existent");

      expect(history.isActive).toBe(false);
      expect(history.connectionInfo).toBeUndefined();
    });
  });

  describe("Manual Operations", () => {
    it("should force health check", () => {
      const cleanupSpy = vi.spyOn(connectionManager, "cleanup");

      connectionManager.forceHealthCheck();

      expect(cleanupSpy).toHaveBeenCalled();
    });
  });

  describe("Lifecycle", () => {
    it("should stop cleanly", () => {
      connectionManager.registerConnection("proxy1", "server1");

      connectionManager.stop();

      const stats = connectionManager.getStats();
      expect(stats.totalConnections).toBe(0);
      expect(connectionManager["healthCheckInterval"]).toBeUndefined();
    });
  });

  describe("LRU Behavior", () => {
    it("should evict oldest connections when max is reached", () => {
      const manager = new ConnectionManager({ maxConnections: 2 });

      const id1 = manager.registerConnection("proxy1", "server1");
      const id2 = manager.registerConnection("proxy1", "server2");
      const id3 = manager.registerConnection("proxy1", "server3"); // Should evict id1

      expect(manager.getConnection(id1)).toBeUndefined();
      expect(manager.getConnection(id2)).toBeDefined();
      expect(manager.getConnection(id3)).toBeDefined();

      manager.stop();
    });
  });
});
