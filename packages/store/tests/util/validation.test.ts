import { describe, expect, it } from "vitest";
import {
  optionalStringSchema,
  requiredStringSchema,
} from "../../src/util/validation";

describe("validation", () => {
  describe("requiredStringSchema", () => {
    it("should validate non-empty strings", () => {
      expect(requiredStringSchema.safeParse("hello").success).toBe(true);
      expect(requiredStringSchema.safeParse(" hello ").success).toBe(true);
    });

    it("should reject empty strings", () => {
      expect(requiredStringSchema.safeParse("").success).toBe(false);
      expect(requiredStringSchema.safeParse("   ").success).toBe(false);
    });

    it("should reject non-string values", () => {
      expect(requiredStringSchema.safeParse(null).success).toBe(false);
      expect(requiredStringSchema.safeParse(undefined).success).toBe(false);
      expect(requiredStringSchema.safeParse(123).success).toBe(false);
      expect(requiredStringSchema.safeParse({}).success).toBe(false);
    });
  });

  describe("optionalStringSchema", () => {
    it("should validate non-empty strings", () => {
      expect(optionalStringSchema.safeParse("hello").success).toBe(true);
      expect(optionalStringSchema.safeParse(" hello ").success).toBe(true);
    });

    it("should validate null and undefined", () => {
      expect(optionalStringSchema.safeParse(null).success).toBe(true);
      expect(optionalStringSchema.safeParse(undefined).success).toBe(true);
    });

    it("should reject non-string values except null/undefined", () => {
      expect(optionalStringSchema.safeParse(123).success).toBe(false);
      expect(optionalStringSchema.safeParse({}).success).toBe(false);
      expect(optionalStringSchema.safeParse([]).success).toBe(false);
    });
  });
});
