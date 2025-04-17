import http from "http";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PORT } from "../../config";
import { ProxyServerStore } from "../../services/proxy/ProxyServerStore";
import { startService } from "../../startService";
import type { AppRouter } from "./trpc";

describe("Repository Router", () => {
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

  it("should list all repository items", async () => {
    const items = await trpcClient.repository.list.query();
    expect(items).toBeDefined();
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]).toHaveProperty("name");
    expect(items[0]).toHaveProperty("description");
  });

  it("should get a single repository item", async () => {
    const items = await trpcClient.repository.list.query();
    const firstItem = items[0];
    const item = await trpcClient.repository.get.query({
      name: firstItem.name,
    });
    expect(item).toBeDefined();
    expect(item.name).toBe(firstItem.name);
    expect(item).toHaveProperty("config");
    expect(item).toHaveProperty("features");
    expect(item.config).toHaveProperty("mcpKey");
    expect(item.config).toHaveProperty("runtime");
    expect(item.config).toHaveProperty("args");
  });

  it("should throw an error for non-existent repository item", async () => {
    await expect(
      trpcClient.repository.get.query({ name: "non-existent" }),
    ).rejects.toThrow();
  });
});
