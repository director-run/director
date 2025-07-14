import { describe, expect, it, vi } from "vitest";
import type { ProxyServerStore } from "./proxy-server-store";
import { getStatus } from "./status";

describe("getStatus", () => {
  it("should return basic status without proxy store", async () => {
    const status = await getStatus();

    expect(status).toHaveProperty("platform");
    expect(status).toHaveProperty("dependencies");
    expect(status).toHaveProperty("clients");
    expect(status).not.toHaveProperty("servers");
  });

  it("should include server status when proxy store is provided", async () => {
    const mockTarget = {
      name: "test-server",
      getStatusInfo: vi.fn().mockReturnValue({
        status: "running",
        lastError: null,
        lastErrorAt: null,
        connectedAt: new Date(),
        lastAttemptAt: new Date(),
      }),
    };

    const mockProxy = {
      id: "test-proxy",
      attributes: { name: "Test Proxy" },
      getAllTargets: vi.fn().mockReturnValue([mockTarget]),
    };

    const mockProxyStore = {
      getAll: vi.fn().mockReturnValue([mockProxy]),
    } as unknown as ProxyServerStore;

    const status = await getStatus(mockProxyStore);

    expect(status).toHaveProperty("platform");
    expect(status).toHaveProperty("dependencies");
    expect(status).toHaveProperty("clients");
    expect(status).toHaveProperty("servers");

    // Type assertion since we know servers should exist when proxyStore is provided
    const statusWithServers = status as typeof status & { servers: unknown[] };
    expect(statusWithServers.servers).toHaveLength(1);
    expect(statusWithServers.servers[0]).toMatchObject({
      proxyId: "test-proxy",
      proxyName: "Test Proxy",
      serverName: "test-server",
      status: "running",
    });
  });

  it("should handle multiple proxies and servers", async () => {
    const mockTarget1 = {
      name: "server-1",
      getStatusInfo: vi.fn().mockReturnValue({
        status: "running",
        lastError: null,
      }),
    };

    const mockTarget2 = {
      name: "server-2",
      getStatusInfo: vi.fn().mockReturnValue({
        status: "failed",
        lastError: "Connection failed",
      }),
    };

    const mockProxy1 = {
      id: "proxy-1",
      attributes: { name: "Proxy 1" },
      getAllTargets: vi.fn().mockReturnValue([mockTarget1]),
    };

    const mockProxy2 = {
      id: "proxy-2",
      attributes: { name: "Proxy 2" },
      getAllTargets: vi.fn().mockReturnValue([mockTarget2]),
    };

    const mockProxyStore = {
      getAll: vi.fn().mockReturnValue([mockProxy1, mockProxy2]),
    } as unknown as ProxyServerStore;

    const status = await getStatus(mockProxyStore);

    // Type assertion since we know servers should exist when proxyStore is provided
    const statusWithServers = status as typeof status & { servers: unknown[] };
    expect(statusWithServers.servers).toHaveLength(2);
    expect(statusWithServers.servers[0]).toMatchObject({
      proxyId: "proxy-1",
      serverName: "server-1",
      status: "running",
    });
    expect(statusWithServers.servers[1]).toMatchObject({
      proxyId: "proxy-2",
      serverName: "server-2",
      status: "failed",
      lastError: "Connection failed",
    });
  });
});
