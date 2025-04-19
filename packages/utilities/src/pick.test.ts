import { describe, expect, it } from "vitest";

import { pick } from "./pick";

describe("pick", () => {
  it("should pick a single key from an object", () => {
    const obj = { foo: "bar", baz: "qux" };
    expect(pick(obj, "baz")).toEqual({ baz: "qux" });
  });

  it("should pick multiple keys from an object", () => {
    const obj = { foo: "bar", baz: "qux", quux: "corge" };
    expect(pick(obj, "baz", "quux")).toEqual({ baz: "qux", quux: "corge" });
  });

  it("should pick keys when provided as an array", () => {
    const obj = { foo: "bar", baz: "qux", quux: "corge" };
    expect(pick(obj, ["baz", "quux"])).toEqual({ baz: "qux", quux: "corge" });
  });

  it("should return empty object when no keys are picked", () => {
    const obj = { foo: "bar", baz: "qux" };
    expect(pick(obj, [])).toEqual({});
  });

  it("should handle non-existent keys gracefully", () => {
    const obj = { foo: "bar", baz: "qux" } as const;
    // @ts-expect-error Testing non-existent key
    expect(pick(obj, "nonexistent")).toEqual({});
  });

  it("should handle nested objects", () => {
    const obj = { foo: "bar", nested: { baz: "qux" } } as const;
    expect(pick(obj, "nested")).toEqual({ nested: { baz: "qux" } });
  });

  it("should handle null and undefined values", () => {
    const obj = { foo: null, bar: undefined, baz: "qux" } as const;
    expect(pick(obj, "foo", "bar")).toEqual({ foo: null, bar: undefined });
  });

  it("should handle empty object", () => {
    const obj = {} as const;
    // @ts-expect-error Testing empty object
    expect(pick(obj, "foo")).toEqual({});
  });
});
