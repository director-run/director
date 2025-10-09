import { describe, expect, it } from "vitest";
import { TypedStore } from "./typed-store";

describe("TypedStore", () => {
  it("should set and get valid values", () => {
    const store = new TypedStore({});

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
    const store = new TypedStore({});

    expect(store.get("user.name")).toBeUndefined();
    expect(store.get("user.age")).toBeUndefined();
  });

  it("should load existing data from constructor", () => {
    const store = new TypedStore({
      user: {
        name: "Bob",
        age: 30,
      },
    });

    expect(store.get("user.name")).toBe("Bob");
    expect(store.get("user.age")).toBe(30);
  });

  it("should throw validation error for invalid values", () => {
    const store = new TypedStore({});

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
    const store = new TypedStore({});

    store.set("user.name", "Alice");
    expect(store.get("user.name")).toBe("Alice");

    store.set("user.name", "Bob");
    expect(store.get("user.name")).toBe("Bob");
  });
});
