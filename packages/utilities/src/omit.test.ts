import { describe, expect, it } from "vitest";

import { omit } from "@/omit";

describe("omit", () => {
  it("should omit a single key from an object", () => {
    const obj = { foo: "bar", baz: "qux" };
    expect(omit(obj, "baz")).toEqual({ foo: "bar" });
  });

  it("should omit multiple keys from an object", () => {
    const obj = { foo: "bar", baz: "qux", quux: "corge" };
    expect(omit(obj, "baz", "quux")).toEqual({ foo: "bar" });
  });

  it("should omit keys when provided as an array", () => {
    const obj = { foo: "bar", baz: "qux", quux: "corge" };
    expect(omit(obj, ["baz", "quux"])).toEqual({ foo: "bar" });
  });

  it("should return empty object when all keys are omitted", () => {
    const obj = { foo: "bar", baz: "qux" };
    expect(omit(obj, "foo", "baz")).toEqual({});
  });

  it("should handle non-existent keys gracefully", () => {
    const obj = { foo: "bar", baz: "qux" } as const;
    // @ts-expect-error Testing non-existent key
    expect(omit(obj, "nonexistent")).toEqual(obj);
  });

  it("should handle nested objects", () => {
    const obj = { foo: "bar", nested: { baz: "qux" } } as const;
    expect(omit(obj, "nested")).toEqual({ foo: "bar" });
  });

  it("should handle null and undefined values", () => {
    const obj = { foo: null, bar: undefined, baz: "qux" } as const;
    expect(omit(obj, "baz")).toEqual({ foo: null, bar: undefined });
  });

  it("should handle empty object", () => {
    const obj = {} as const;
    // @ts-expect-error Testing empty object
    expect(omit(obj, "foo")).toEqual({});
  });
});
