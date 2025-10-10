import fs from "fs";
import { beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";
import { WorkspaceSchema } from "../workspaces/workspace";
import { InMemoryTypedStore, YAMLTypedStore } from "./typed-store";

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

describe("InMemoryTypedStore", () => {
  it("should set and get valid values", async () => {
    const store = new InMemoryTypedStore({ schema: configSchema });
    expect(store.get("server.port")).toBe(3673);
    await store.set("server.port", 1234);
    await store.set("registry.url", "https://example.com");
    expect(store.get("server.port")).toBe(1234);
    expect(store.get("registry.url")).toBe("https://example.com");
  });

  it("should return undefined for non-existent keys", () => {
    const store = new InMemoryTypedStore({ schema: configSchema });

    expect(store.get("workspaces")).toBeUndefined();
  });

  it("should load existing data from constructor", () => {
    const seedData = {
      server: {
        port: 3333,
        allowedOrigins: ["https://example.com"],
      },
      registry: {
        url: "https://example.com",
      },
    };
    const store = new InMemoryTypedStore({
      schema: configSchema,
      data: seedData,
    });

    expect(store.get("server.port")).toBe(3333);
    expect(store.get("registry.url")).toBe("https://example.com");
    expect(store.data).toMatchObject(seedData);
  });

  it("should throw validation error for invalid values", async () => {
    const store = new InMemoryTypedStore({ schema: configSchema });
    await expect(store.set("server.port", -5)).rejects.toThrow();
  });

  it("should not return default values in data when no data is set", () => {
    const store = new InMemoryTypedStore({ schema: configSchema });
    expect(store.data).toMatchObject({});
  });

  it("should not return default", () => {
    const store = new InMemoryTypedStore({ schema: configSchema });
    expect(store.get("server.port")).toBe(3673);
  });

  it("should set data", async () => {
    const store = new InMemoryTypedStore({ schema: configSchema });
    await store.set("server.port", 1234);
    expect(store.data).toMatchObject({ server: { port: 1234 } });
  });

  it("should throw validation error for invalid data in constructor", async () => {
    const invalidData = {
      server: {
        port: -5, // Invalid: port must be >= 0
      },
    };
    await expect(
      () => new InMemoryTypedStore({ schema: configSchema, data: invalidData }),
    ).toThrow(/Invalid data for key "server\.port"/);
  });

  it("should throw validation error for wrong type in constructor", () => {
    const invalidData = {
      server: {
        port: "not a number", // Invalid: port must be a number
      },
    };
    expect(
      () => new InMemoryTypedStore({ schema: configSchema, data: invalidData }),
    ).toThrow(/Invalid data for key "server\.port"/);
  });
});

describe("YAMLTypedStore", () => {
  beforeAll(async () => {
    if (fs.existsSync("test.yaml")) {
      await fs.promises.unlink("test.yaml");
    }
  });

  it("should set and get valid values", async () => {
    const store = new YAMLTypedStore({
      schema: configSchema,
      filePath: "test.yaml",
      defaultData: {
        version: "1.0.0",
        workspaces: [],
      },
    });
    await store.init();

    expect(store.get("server.port")).toBe(3673);
    await store.set("server.port", 1234);
    await store.set("registry.url", "https://example.com");
    expect(store.get("server.port")).toBe(1234);
    expect(store.get("registry.url")).toBe("https://example.com");
  });
});
