import http from "http";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PORT } from "../../config";
import { db } from "../../services/db";
import { startService } from "../../startService";
import type { AppRouter } from "./trpc";

describe("TRPC Router", () => {
  let proxyServer: http.Server | undefined;
  let trpcClient: ReturnType<typeof createTRPCClient<AppRouter>>;

  beforeAll(async () => {
    await db.purge();
    await db.addProxy({
      name: "Test proxy",
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
    });
    proxyServer = await startService();

    trpcClient = createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: `http://localhost:${PORT}/trpc`,
          transformer: superjson,
        }),
      ],
    });
  });

  afterAll(async () => {
    await db.purge();
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
      expect(proxies[0].name).toBe("Test proxy");
      expect(proxies[0].id).toBe("test-proxy");
    });

    it("should get a specific proxy", async () => {
      const proxy = await trpcClient.store.get.query({ proxyId: "test-proxy" });
      expect(proxy).toBeDefined();
      expect(proxy?.id).toBe("test-proxy");
      expect(proxy?.name).toBe("Test proxy");
    });

    it("should create a new proxy", async () => {
      const newProxy = {
        name: "New test proxy",
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
      expect(createdProxy.name).toBe("New test proxy");
      expect(createdProxy.id).toBe("new-test-proxy");
      expect(createdProxy.servers).toHaveLength(1);

      // Verify it was actually created
      const proxies = await trpcClient.store.getAll.query();
      expect(proxies).toHaveLength(2);
    });

    it("should update a proxy", async () => {
      const update = {
        proxyId: "test-proxy",
        attributes: {
          description: "Updated description",
        },
      };

      const updatedProxy = await trpcClient.store.update.mutate(update);
      expect(updatedProxy.description).toBe("Updated description");

      // Verify the update
      const proxy = await trpcClient.store.get.query({ proxyId: "test-proxy" });
      expect(proxy?.description).toBe("Updated description");
    });

    it("should delete a proxy", async () => {
      await trpcClient.store.delete.mutate({ proxyId: "new-test-proxy" });

      // Verify it was deleted
      const proxies = await trpcClient.store.getAll.query();
      expect(proxies).toHaveLength(1);
      expect(proxies[0].name).toBe("Test proxy");
      expect(proxies[0].id).toBe("test-proxy");
    });
  });
});
