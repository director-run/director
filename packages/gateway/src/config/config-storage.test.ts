import fs from "fs";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";
import { WorkspaceSchema } from "../workspaces/workspace";
import { ConfigBase } from "./config-base";
import { InMemoryConfigStorage, YamlConfigStorage } from "./config-storage";

const configSchema = {
  "server.port": z.number().min(0).default(3673),
  "server.allowedOrigins": z
    .array(z.union([z.string(), z.instanceof(RegExp)]))
    .default([/^https?:\/\/localhost(:\d+)?$/]),
  "registry.url": z.string().default("https://registry.director.run"),
  "registry.apiKey": z.string().optional(),

  // "telemetry.writeKey": z.string().default(SEGMENT_PRODUCTION_WRITE_KEY),
  "telemetry.writeKey": z.string().default(""),
  "telemetry.enabled": z.boolean().default(false),
  oauth: z.object({
    storage: z.literal("disk").default("disk"),
    tokenDirectory: z.string().default("./tokens"),
  }),
  workspaces: z.array(WorkspaceSchema),
  version: z.string().default("1.0.0"),
};

describe("ConfigStorage implementations", () => {
  beforeEach(deleteTestFile);
  afterAll(deleteTestFile);

  [
    {
      name: "InMemoryConfigStorage",
      makeStorage: () => new InMemoryConfigStorage(),
    },
    {
      name: "YamlConfigStorage",
      makeStorage: () =>
        new YamlConfigStorage({
          filePath: "config.test.yaml",
          defaultData: {
            version: "1.0.0",
            workspaces: [],
          },
        }),
    },
  ].forEach(({ name, makeStorage }) => {
    describe(name, () => {
      it("should initialize and return empty data", async () => {
        const storage = makeStorage();
        await storage.init();
        expect(storage.getData()).toBeDefined();
      });

      it("should set and get data", async () => {
        const storage = makeStorage();
        await storage.init();
        storage.setData({ test: "value" });
        expect(storage.getData()).toMatchObject({ test: "value" });
      });

      it("should persist data", async () => {
        const storage = makeStorage();
        await storage.init();
        storage.setData({ test: "value" });
        await storage.persist();
        expect(storage.getData()).toMatchObject({ test: "value" });
      });

      it("should purge data", async () => {
        const storage = makeStorage();
        await storage.init();
        storage.setData({ test: "value" });
        await storage.purge();
        const data = storage.getData();
        expect(data.test).toBeUndefined();
      });

      it("should work with ConfigBase", async () => {
        const storage = makeStorage();
        const store = new ConfigBase({ schema: configSchema, storage });
        await store.init();

        expect(store.get("server.port")).toBe(3673);
        await store.set("server.port", 1234);
        await store.set("registry.url", "https://example.com");
        expect(store.get("server.port")).toBe(1234);
        expect(store.get("registry.url")).toBe("https://example.com");
      });
    });
  });
});

async function deleteTestFile() {
  if (fs.existsSync("config.test.yaml")) {
    await fs.promises.unlink("config.test.yaml");
  }
}
