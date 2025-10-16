import fs from "node:fs";
import path from "node:path";
import { ErrorCode } from "@director.run/utilities/error";
import { expectToThrowAppError } from "@director.run/utilities/test";
import { beforeEach } from "vitest";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { ConfigBase } from "./config-base";
import { InMemoryConfigStorage, YamlConfigStorage } from "./config-storage";

describe("ConfigBase array helpers", () => {
  const schema = {
    version: z.string().default("1.0.0"),
    "server.port": z.number(),
    "clients.cursor": z.array(z.string()).default([]),
    workspaces: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
        }),
      )
      .default([]),
  } as const;

  let config: ConfigBase<typeof schema>;

  beforeEach(async () => {
    const storage = new InMemoryConfigStorage();
    config = new ConfigBase({
      schema,
      storage,
      defaults: { server: { port: 3000 } },
    });
    await config.init();
  });

  describe("push", () => {
    it("appends to primitive array keys", async () => {
      await config.push("clients.cursor", "ws-1");
      await config.push("clients.cursor", "ws-2");
      expect(config.get("clients.cursor")).toEqual(["ws-1", "ws-2"]);
    });

    it("rejects non-array keys", async () => {
      await expect(config.push("server.port", 123)).rejects.toThrow(
        /not an array/,
      );
    });

    it("validates element type against schema", async () => {
      // number into string[] should throw
      await expect(config.push("clients.cursor", 123)).rejects.toThrow();
    });
  });

  describe("remove", () => {
    it("removes by value from primitive array", async () => {
      await config.push("clients.cursor", "ws-1");
      await config.push("clients.cursor", "ws-2");
      await config.push("clients.cursor", "ws-3");
      await config.remove("clients.cursor", "ws-2");
      expect(config.get("clients.cursor")).toEqual(["ws-1", "ws-3"]);
    });

    it("removes by selector from object array", async () => {
      await config.push("workspaces", { id: "a", name: "A" });
      await config.push("workspaces", { id: "b", name: "B" });
      await config.push("workspaces", { id: "c", name: "C" });
      await config.remove("workspaces", { id: "b" });
      expect(config.get("workspaces")).toEqual([
        { id: "a", name: "A" },
        { id: "c", name: "C" },
      ]);
    });

    it("rejects non-array keys", async () => {
      await expect(config.remove("server.port", { id: "x" })).rejects.toThrow(
        /not an array/,
      );
    });
  });
});

describe("ConfigBase", () => {
  it("should set and get valid values", async () => {
    const configSchema = {
      "server.port": z.number().min(0),
      "registry.url": z.string(),
    };
    const storage = new InMemoryConfigStorage();
    const configBase = new ConfigBase({
      schema: configSchema,
      storage,
      defaults: {
        server: {
          port: 3673,
        },
        registry: {
          url: "https://registry.director.run",
        },
      },
    });
    await configBase.init();
    expect(configBase.get("server.port")).toBe(3673);
    await configBase.set("server.port", 1234);
    await configBase.set("registry.url", "https://example.com");
    expect(configBase.get("server.port")).toBe(1234);
    expect(configBase.get("registry.url")).toBe("https://example.com");
  });

  it("should return undefined for non-existent keys", async () => {
    const configSchema = {
      "registry.apiKey": z.string().optional(),
    };
    const storage = new InMemoryConfigStorage();
    const configBase = new ConfigBase({ schema: configSchema, storage });
    await configBase.init();

    expect(configBase.get("registry.apiKey")).toBeUndefined();
  });

  it("should throw an error if a required key is not set in the storage", async () => {
    const configBase = new ConfigBase({
      schema: {
        "registry.apiKey": z.string(),
      },
      storage: new InMemoryConfigStorage(),
    });
    await expectToThrowAppError(() => configBase.init(), {
      code: ErrorCode.INVALID_CONFIGURATION,
      props: { key: "registry.apiKey" },
    });
  });

  it("should not throw an error if a required key is not set in the storage but a default is provided", async () => {
    const configBase = new ConfigBase({
      schema: {
        "registry.apiKey": z.string(),
      },
      storage: new InMemoryConfigStorage(),
      defaults: {
        "registry.apiKey": "1234567890",
      },
    });
    await configBase.init();
    expect(configBase.get("registry.apiKey")).toEqual("1234567890");
  });

  it("should load existing data from storage", async () => {
    const configSchema = {
      "server.port": z.number().min(0).default(3673),
      "registry.url": z.string().default("https://registry.director.run"),
    };
    const seedData = {
      server: {
        port: 3333,
        allowedOrigins: ["https://example.com"],
      },
      registry: {
        url: "https://example.com",
      },
    };
    const storage = new InMemoryConfigStorage({ data: seedData });
    const configBase = new ConfigBase({
      schema: configSchema,
      storage,
    });
    await configBase.init();

    expect(configBase.get("server.port")).toBe(3333);
    expect(configBase.get("registry.url")).toBe("https://example.com");
    expect(configBase.data).toMatchObject(seedData);
  });

  it("should throw validation error for invalid values", async () => {
    const configSchema = {
      "server.port": z.number().min(0).default(3673),
    };
    const storage = new InMemoryConfigStorage();
    const configBase = new ConfigBase({ schema: configSchema, storage });
    await configBase.init();
    await expect(configBase.set("server.port", -5)).rejects.toThrow();
  });

  it("should not write default values to storage", async () => {
    const configSchema = {
      "server.port": z.number().min(0),
      "registry.url": z.string(),
    };
    const storage = new InMemoryConfigStorage();
    const configBase = new ConfigBase({
      schema: configSchema,
      storage,
      defaults: {
        server: {
          port: 3673,
        },
        registry: {
          url: "https://registry.director.run",
        },
      },
    });
    await configBase.init();
    expect(storage.getData()).toMatchObject({});
    await configBase.set("server.port", 1234);
    expect(storage.getData()).toEqual({ server: { port: 1234 } });
  });

  describe("with defaults", () => {
    it("should throw an error if default is invalid", async () => {
      const configSchema = {
        "server.port": z.number().min(0).default(3673),
      };
      const storage = new InMemoryConfigStorage();
      const configBase = new ConfigBase({
        schema: configSchema,
        storage,
        defaults: {
          server: {
            port: "default description",
          },
        },
      });
      await expectToThrowAppError(() => configBase.init(), {
        code: ErrorCode.INVALID_CONFIGURATION,
        props: { key: "server.port", value: "default description" },
      });
    });
  });

  it("should return default value when key is not set", async () => {
    const configSchema = {
      "server.port": z.number().min(0).default(3673),
    };
    const storage = new InMemoryConfigStorage();
    const configBase = new ConfigBase({ schema: configSchema, storage });
    await configBase.init();
    expect(configBase.get("server.port")).toBe(3673);
  });

  it("should set data", async () => {
    const configSchema = {
      "server.port": z.number().min(0).default(3673),
    };
    const storage = new InMemoryConfigStorage();
    const configBase = new ConfigBase({ schema: configSchema, storage });
    await configBase.init();
    await configBase.set("server.port", 1234);
    expect(configBase.data).toMatchObject({ server: { port: 1234 } });
  });

  it("should throw validation error for invalid data in storage", async () => {
    const configSchema = {
      "server.port": z.number().min(0).default(3673),
    };
    const invalidData = {
      server: {
        port: -5, // Invalid: port must be >= 0
      },
    };
    const storage = new InMemoryConfigStorage({ data: invalidData });
    const configBase = new ConfigBase({ schema: configSchema, storage });
    await expectToThrowAppError(() => configBase.init(), {
      code: ErrorCode.INVALID_CONFIGURATION,
      props: { key: "server.port", value: -5 },
    });
  });

  it("should throw validation error for wrong type in storage", async () => {
    const configSchema = {
      "server.port": z.number().min(0).default(3673),
    };
    const invalidData = {
      server: {
        port: "not a number", // Invalid: port must be a number
      },
    };
    const storage = new InMemoryConfigStorage({ data: invalidData });
    const configBase = new ConfigBase({ schema: configSchema, storage });
    await expectToThrowAppError(() => configBase.init(), {
      code: ErrorCode.INVALID_CONFIGURATION,
      props: { key: "server.port", value: "not a number" },
    });
  });

  describe("with file storage", () => {
    it("should work with a blank file", async () => {
      const filePath = path.join(__dirname, "./new-db.test.json");

      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }

      expect(fs.existsSync(filePath)).toBe(false);
      fs.writeFileSync(filePath, "");
      expect(fs.existsSync(filePath)).toBe(true);

      const configBase = new ConfigBase({
        schema: {
          "server.port": z.number().min(0).default(3673),
          "some.key": z.string(),
        },
        storage: new YamlConfigStorage({
          filePath,
        }),
        defaults: {
          "some.key": "default value",
        },
      });
      await configBase.init();
      await configBase.set("server.port", 1234);

      expect(fs.readFileSync(filePath, "utf8")).toBe(
        JSON.stringify({
          server: {
            port: 1234,
          },
        }),
      );
    });

    it("should create a new database file if it doesn't exist", async () => {
      const configSchema = {
        "server.port": z.number().min(0).default(3673),
      };
      const newDbPath = path.join(__dirname, "./new-db.test.json");

      // Ensure the file doesn't exist
      if (fs.existsSync(newDbPath)) {
        await fs.promises.unlink(newDbPath);
      }

      expect(fs.existsSync(newDbPath)).toBe(false);

      const storage = new YamlConfigStorage({
        filePath: newDbPath,
      });

      const configBase = new ConfigBase({ schema: configSchema, storage });
      await configBase.init();

      expect(fs.existsSync(newDbPath)).toBe(false);

      await configBase.set("server.port", 1234);
      expect(fs.existsSync(newDbPath)).toBe(true);

      // Clean up
      await fs.promises.unlink(newDbPath);
    });
  });
});
