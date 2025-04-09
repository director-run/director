import fs from "fs";
import http from "http";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PORT, PROXY_DB_FILE_PATH } from "../../constants";
import { writeConfigFile } from "../../services/config";
import type { Config } from "../../services/config/schema";
import { startService } from "../../startService";
import type { AppRouter } from "./trpc";

// Test configuration to use for tests
const testConfig: Config = {
  proxies: [
    {
      id: "test-proxy",
      name: "test-proxy",
      servers: [
        {
          name: "Hackernews",
          transport: {
            type: "stdio",
            command: "uvx",
            args: [
              "--from",
              "git+https://github.com/erithwik/mcp-hn",
              "mcp-hn",
            ],
          },
        },
        {
          name: "Fetch",
          transport: {
            type: "stdio",
            command: "uvx",
            args: ["mcp-server-fetch"],
          },
        },
      ],
    },
  ],
};

describe("TRPC Router", () => {
  let proxyServer: http.Server | undefined;
  let trpcClient: ReturnType<typeof createTRPCProxyClient<AppRouter>>;

  beforeAll(async () => {
    await writeConfigFile(testConfig, PROXY_DB_FILE_PATH);
    proxyServer = await startService();

    // Create tRPC client
    trpcClient = createTRPCProxyClient<AppRouter>({
      links: [
        httpBatchLink({
          url: `http://localhost:${PORT}/trpc`,
          transformer: superjson,
        }),
      ],
    });
  });

  afterAll(async () => {
    fs.unlinkSync(PROXY_DB_FILE_PATH);
    if (proxyServer) {
      await new Promise<void>((resolve) => {
        proxyServer?.close(() => resolve());
      });
      proxyServer = undefined;
    }
  });

  describe("store endpoints", () => {
    it("should get all proxies", async () => {
      const proxies = await trpcClient.store.getAll.query();
      expect(proxies).toHaveLength(1);
      expect(proxies[0].name).toBe("test-proxy");
    });

    it("should get a specific proxy", async () => {
      const proxy = await trpcClient.store.get.query({ name: "test-proxy" });
      expect(proxy).toBeDefined();
      expect(proxy?.name).toBe("test-proxy");
    });

    it("should create a new proxy", async () => {
      const newProxy = {
        name: "new-test-proxy",
        servers: [
          {
            name: "Test Server",
            transport: {
              type: "stdio" as const,
              command: "uvx",
              args: ["test-server"],
            },
          },
        ],
      };

      const createdProxy = await trpcClient.store.create.mutate(newProxy);
      expect(createdProxy.name).toBe("new-test-proxy");
      expect(createdProxy.servers).toHaveLength(1);

      // Verify it was actually created
      const proxies = await trpcClient.store.getAll.query();
      expect(proxies).toHaveLength(2);
    });

    it("should update a proxy", async () => {
      const update = {
        name: "test-proxy",
        attributes: {
          description: "Updated description",
        },
      };

      const updatedProxy = await trpcClient.store.update.mutate(update);
      expect(updatedProxy.description).toBe("Updated description");

      // Verify the update
      const proxy = await trpcClient.store.get.query({ name: "test-proxy" });
      expect(proxy?.description).toBe("Updated description");
    });

    it("should delete a proxy", async () => {
      await trpcClient.store.delete.mutate({ name: "new-test-proxy" });

      // Verify it was deleted
      const proxies = await trpcClient.store.getAll.query();
      expect(proxies).toHaveLength(1);
      expect(proxies[0].name).toBe("test-proxy");
    });
  });

  describe("greeting endpoint", () => {
    it("should return a greeting with the provided name", async () => {
      const greeting = await trpcClient.greeting.query({ name: "Test User" });
      expect(greeting).toBe("Hello Test User");
    });
  });
});
