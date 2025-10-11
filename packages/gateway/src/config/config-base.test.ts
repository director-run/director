import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { ConfigBase } from "./config-base";
import { InMemoryConfigStorage, YamlConfigStorage } from "./config-storage";

describe("ConfigBase", () => {
  it("should set and get valid values", async () => {
    const configSchema = {
      "server.port": z.number().min(0).default(3673),
      "registry.url": z.string().default("https://registry.director.run"),
    };
    const storage = new InMemoryConfigStorage();
    const configBase = new ConfigBase({ schema: configSchema, storage });
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
    await expect(configBase.init()).rejects.toThrow(
      /Invalid data for key "registry\.apiKey"/,
    );
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

  it("should not return default values in data when no data is set", async () => {
    const configSchema = {
      "server.port": z.number().min(0).default(3673),
    };
    const storage = new InMemoryConfigStorage();
    const configBase = new ConfigBase({ schema: configSchema, storage });
    await configBase.init();
    expect(configBase.data).toMatchObject({});
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
    await expect(configBase.init()).rejects.toThrow(
      /Invalid data for key "server\.port"/,
    );
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
    await expect(configBase.init()).rejects.toThrow(
      /Invalid data for key "server\.port"/,
    );
  });

  describe("with file storage", () => {
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
