import { describe, expect, it } from "vitest";

import { isNumber } from "./is";

describe("isNumber", () => {
  it("should return true for valid numbers", () => {
    expect(isNumber(42)).toBe(true);
    expect(isNumber(0)).toBe(true);
    expect(isNumber(-1)).toBe(true);
    expect(isNumber(3.14)).toBe(true);
  });

  it("should return true for special number values", () => {
    expect(isNumber(NaN)).toBe(true);
    expect(isNumber(Infinity)).toBe(true);
    expect(isNumber(-Infinity)).toBe(true);
  });

  it("should return false for non-number values", () => {
    expect(isNumber("42")).toBe(false);
    expect(isNumber("")).toBe(false);
    expect(isNumber(null)).toBe(false);
    expect(isNumber(undefined)).toBe(false);
    expect(isNumber({})).toBe(false);
    expect(isNumber([])).toBe(false);
    expect(isNumber(true)).toBe(false);
    expect(isNumber(false)).toBe(false);
    expect(isNumber(() => {})).toBe(false);
    expect(isNumber(Symbol())).toBe(false);
  });
});
