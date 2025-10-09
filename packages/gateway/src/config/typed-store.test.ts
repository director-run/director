import { describe, expect, it } from "vitest";
import { z } from "zod";
import { TypedStore } from "./typed-store";

const allowedSchema = {
  "user.name": z.string(),
  "user.age": z.number().min(0),
  "settings.theme": z.enum(["light", "dark"]),
  "config.maxItems": z.number().int().positive(),
} as const;

describe("TypedStore", () => {
  it("should set and get valid values", () => {
    const store = new TypedStore({ schema: allowedSchema });

    store.set("user.name", "Alice");
    store.set("user.age", 25);
    store.set("settings.theme", "dark");
    store.set("config.maxItems", 100);

    expect(store.get("user.name")).toBe("Alice");
    expect(store.get("user.age")).toBe(25);
    expect(store.get("settings.theme")).toBe("dark");
    expect(store.get("config.maxItems")).toBe(100);
  });

  it("should return undefined for non-existent keys", () => {
    const store = new TypedStore({ schema: allowedSchema });

    expect(store.get("user.name")).toBeUndefined();
    expect(store.get("user.age")).toBeUndefined();
  });

  it("should load existing data from constructor", () => {
    const store = new TypedStore({
      schema: allowedSchema,
      data: {
        user: {
          name: "Bob",
          age: 30,
        },
      },
    });

    expect(store.get("user.name")).toBe("Bob");
    expect(store.get("user.age")).toBe(30);
  });

  it("should throw validation error for invalid values", () => {
    const store = new TypedStore({ schema: allowedSchema });

    // Negative age should fail
    expect(() => store.set("user.age", -5)).toThrow();

    // Non-positive maxItems should fail
    expect(() => store.set("config.maxItems", 0)).toThrow();
    expect(() => store.set("config.maxItems", -10)).toThrow();

    // Invalid theme value should fail
    // @ts-expect-error - Testing invalid enum value
    expect(() => store.set("settings.theme", "blue")).toThrow();
  });

  it("should update existing values", () => {
    const store = new TypedStore({ schema: allowedSchema });

    store.set("user.name", "Alice");
    expect(store.get("user.name")).toBe("Alice");

    store.set("user.name", "Bob");
    expect(store.get("user.name")).toBe("Bob");
  });

  it("should return default values from schema when no data is set", () => {
    const schemaWithDefaults = {
      "user.name": z.string().default("Bob"),
      "user.age": z.number().min(0).default(18),
      "settings.theme": z.enum(["light", "dark"]).default("light"),
      "config.maxItems": z.number().int().positive(),
    } as const;

    const store = new TypedStore({ schema: schemaWithDefaults });

    // Should return defaults for fields with defaults
    expect(store.get("user.name")).toBe("Bob");
    expect(store.get("user.age")).toBe(18);
    expect(store.get("settings.theme")).toBe("light");

    // Should return undefined for fields without defaults
    expect(store.get("config.maxItems")).toBeUndefined();
  });

  it("should override defaults when values are set", () => {
    const schemaWithDefaults = {
      "user.name": z.string().default("Bob"),
      "user.age": z.number().min(0).default(18),
    } as const;

    const store = new TypedStore({ schema: schemaWithDefaults });

    // Initially should return defaults
    expect(store.get("user.name")).toBe("Bob");
    expect(store.get("user.age")).toBe(18);

    // After setting values, should return the set values
    store.set("user.name", "Alice");
    store.set("user.age", 25);

    expect(store.get("user.name")).toBe("Alice");
    expect(store.get("user.age")).toBe(25);
  });
});
