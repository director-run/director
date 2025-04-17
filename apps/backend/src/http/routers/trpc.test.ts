import http from "http";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PORT } from "../../config";
import { ProxyServerStore } from "../../services/proxy/ProxyServerStore";
import { startService } from "../../startService";
import type { AppRouter } from "./trpc";

describe("TRPC Router", () => {
  let proxyStore: ProxyServerStore;
  let directorService: http.Server | undefined;
  let trpcClient: ReturnType<typeof createTRPCClient<AppRouter>>;

  beforeAll(async () => {
    proxyStore = await ProxyServerStore.create();
    directorService = await startService({ proxyStore });

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
    await proxyStore.purge();
    if (directorService) {
      await new Promise<void>((resolve) => {
        directorService?.close(() => resolve());
      });
      directorService = undefined;
    }
  });

  describe("store endpoints", () => {
    it("should get all proxies", async () => {
      await proxyStore.purge();
      await proxyStore.create({
        name: "Test proxy",
      });
      await proxyStore.create({
        name: "Test proxy 2",
      });
      const proxies = await trpcClient.store.getAll.query();
      expect(proxies).toHaveLength(2);

      expect(proxies[0].id).toBe("test-proxy");
      expect(proxies[1].id).toBe("test-proxy-2");
    });

    it("should create a new proxy", async () => {
      await proxyStore.purge();
      await proxyStore.create({
        name: "Test proxy",
      });
      const proxy = await trpcClient.store.get.query({ proxyId: "test-proxy" });
      expect(proxy).toBeDefined();
      expect(proxy?.id).toBe("test-proxy");
      expect(proxy?.name).toBe("Test proxy");
    });

    it("should update a proxy", async () => {
      await proxyStore.purge();
      const prox = await proxyStore.create({
        name: "Test proxy",
        description: "Old description",
      });

      const newDescription = "Updated description";

      const updatedResponse = await trpcClient.store.update.mutate({
        proxyId: prox.id,
        attributes: {
          description: newDescription,
        },
      });
      expect(updatedResponse.description).toBe(newDescription);

      const proxy = await trpcClient.store.get.query({ proxyId: "test-proxy" });
      expect(proxy?.description).toBe(newDescription);
    });

    it("should delete a proxy", async () => {
      await proxyStore.purge();
      await proxyStore.create({
        name: "Test proxy",
      });
      await trpcClient.store.delete.mutate({ proxyId: "test-proxy" });

      expect(
        await trpcClient.store.get.query({ proxyId: "test-proxy" }),
      ).toBeUndefined();
      expect(await trpcClient.store.getAll.query()).toHaveLength(0);
    });
  });

  describe("repository endpoints", () => {
    it("should list all repository items", async () => {
      const items = await trpcClient.repository.list.query();
      expect(items).toBeDefined();
      expect(items.length).toBeGreaterThan(0);
      expect(items[0]).toHaveProperty("name");
      expect(items[0]).toHaveProperty("description");
    });
  });
});
