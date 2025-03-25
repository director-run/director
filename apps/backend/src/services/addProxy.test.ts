import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { addProxy } from "./addProxy";
import { listProxies } from "./listProxies";

// Create a real Prisma client for integration tests
const prisma = new PrismaClient();

describe("addProxy integration", () => {
  // Clean up the database before all tests
  beforeAll(async () => {
    await prisma.transport.deleteMany();
    await prisma.server.deleteMany();
    await prisma.proxy.deleteMany();
  });

  // Clean up after all tests
  afterAll(async () => {
    await prisma.transport.deleteMany();
    await prisma.server.deleteMany();
    await prisma.proxy.deleteMany();
    await prisma.$disconnect();
  });

  // Clean up between tests
  beforeEach(async () => {
    await prisma.transport.deleteMany();
    await prisma.server.deleteMany();
    await prisma.proxy.deleteMany();
  });

  test("should create a proxy with command-based transport servers", async () => {
    // Arrange
    const proxyData = {
      name: "test-command-proxy",
      servers: [
        {
          name: "Command Server",
          transport: {
            command: "uvx",
            args: ["--from", "git+https://github.com/example/repo", "example"],
          },
        },
      ],
    };

    // Act
    await addProxy(proxyData);

    // Assert - check that the proxy was created in the database
    const proxies = await listProxies();
    expect(proxies.length).toBe(1);
    expect(proxies[0].name).toBe("test-command-proxy");

    // Check that the server was created
    const servers = await prisma.server.findMany({
      where: { proxyId: proxies[0].id },
      include: { transport: true },
    });
    expect(servers.length).toBe(1);
    expect(servers[0].name).toBe("Command Server");

    // Check that the transport was created with correct data
    expect(servers[0].transport).not.toBeNull();
    expect(servers[0].transport?.command).toBe("uvx");
    expect(servers[0].transport?.args).toBe(JSON.stringify(["--from", "git+https://github.com/example/repo", "example"]));
  });

  test("should create a proxy with SSE transport servers", async () => {
    // Arrange
    const proxyData = {
      name: "test-sse-proxy",
      servers: [
        {
          name: "SSE Server",
          transport: {
            type: "sse" as const,
            url: "https://example.com/sse",
          },
        },
      ],
    };

    // Act
    await addProxy(proxyData);

    // Assert - check that the proxy was created in the database
    const proxies = await listProxies();
    expect(proxies.length).toBe(1);
    expect(proxies[0].name).toBe("test-sse-proxy");

    // Check that the server was created
    const servers = await prisma.server.findMany({
      where: { proxyId: proxies[0].id },
      include: { transport: true },
    });
    expect(servers.length).toBe(1);
    expect(servers[0].name).toBe("SSE Server");

    // Check that the transport was created with correct data
    expect(servers[0].transport).not.toBeNull();
    expect(servers[0].transport?.type).toBe("sse");
    expect(servers[0].transport?.url).toBe("https://example.com/sse");
  });

  test("should create a proxy with mixed transport types", async () => {
    // Arrange
    const proxyData = {
      name: "test-mixed-proxy",
      servers: [
        {
          name: "Command Server",
          transport: {
            command: "uvx",
            args: ["mcp-server-fetch"],
          },
        },
        {
          name: "SSE Server",
          transport: {
            type: "sse" as const,
            url: "https://example.com/sse",
          },
        },
      ],
    };

    // Act
    await addProxy(proxyData);

    // Assert - check that the proxy was created in the database
    const proxies = await listProxies();
    expect(proxies.length).toBe(1);
    expect(proxies[0].name).toBe("test-mixed-proxy");

    // Check that both servers were created
    const servers = await prisma.server.findMany({
      where: { proxyId: proxies[0].id },
      include: { transport: true },
      orderBy: { name: "asc" },
    });
    expect(servers.length).toBe(2);

    // Check the command-based server
    const commandServer = servers.find((s) => s.name === "Command Server");
    expect(commandServer).toBeDefined();
    expect(commandServer?.transport?.command).toBe("uvx");
    expect(commandServer?.transport?.args).toBe(JSON.stringify(["mcp-server-fetch"]));

    // Check the SSE-based server
    const sseServer = servers.find((s) => s.name === "SSE Server");
    expect(sseServer).toBeDefined();
    expect(sseServer?.transport?.type).toBe("sse");
    expect(sseServer?.transport?.url).toBe("https://example.com/sse");
  });
});
