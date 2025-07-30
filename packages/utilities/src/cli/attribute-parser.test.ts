import { describe, expect, it } from "vitest";
import { parseKeyValueAttributes } from "./attribute-parser";

describe("parseKeyValueAttributes", () => {
  describe("string values", () => {
    it("should parse simple string values", () => {
      const result = parseKeyValueAttributes([
        "name=test",
        "description=my description",
      ]);
      expect(result).toEqual({
        name: "test",
        description: "my description",
      });
    });

    it("should handle quoted strings", () => {
      const result = parseKeyValueAttributes([
        "name='test value'",
        'description="quoted description"',
      ]);
      expect(result).toEqual({
        name: "test value",
        description: "quoted description",
      });
    });

    it("should handle values with equals signs", () => {
      const result = parseKeyValueAttributes([
        "url=https://example.com/path?param=value",
      ]);
      expect(result).toEqual({
        url: "https://example.com/path?param=value",
      });
    });
  });

  describe("boolean values", () => {
    it("should parse boolean true values", () => {
      const result = parseKeyValueAttributes([
        "enabled=true",
        "active=1",
        "featured=TRUE",
      ]);
      expect(result).toEqual({
        enabled: true,
        active: true,
        featured: true,
      });
    });

    it("should parse boolean false values", () => {
      const result = parseKeyValueAttributes([
        "enabled=false",
        "active=0",
        "featured=FALSE",
      ]);
      expect(result).toEqual({
        enabled: false,
        active: false,
        featured: false,
      });
    });
  });

  describe("array values", () => {
    it("should parse empty arrays", () => {
      const result = parseKeyValueAttributes(["disabledTools=[]"]);
      expect(result).toEqual({
        disabledTools: [],
      });
    });

    it("should parse arrays with quoted strings", () => {
      const result = parseKeyValueAttributes([
        "disabledTools=['tool1', 'tool2', 'tool3']",
      ]);
      expect(result).toEqual({
        disabledTools: ["tool1", "tool2", "tool3"],
      });
    });

    it("should parse arrays with double quotes", () => {
      const result = parseKeyValueAttributes([
        'disabledTools=["tool1", "tool2"]',
      ]);
      expect(result).toEqual({
        disabledTools: ["tool1", "tool2"],
      });
    });

    it("should parse arrays with unquoted strings", () => {
      const result = parseKeyValueAttributes([
        "disabledTools=[tool1, tool2, tool3]",
      ]);
      expect(result).toEqual({
        disabledTools: ["tool1", "tool2", "tool3"],
      });
    });

    it("should handle mixed quoted and unquoted strings", () => {
      const result = parseKeyValueAttributes([
        "disabledTools=['tool1', tool2, \"tool3\"]",
      ]);
      expect(result).toEqual({
        disabledTools: ["tool1", "tool2", "tool3"],
      });
    });

    it("should handle arrays with spaces", () => {
      const result = parseKeyValueAttributes([
        "disabledTools=['tool 1', 'tool 2']",
      ]);
      expect(result).toEqual({
        disabledTools: ["tool 1", "tool 2"],
      });
    });
  });

  describe("empty values", () => {
    it("should parse empty string values", () => {
      const result = parseKeyValueAttributes([
        "toolPrefix=''",
        'description=""',
        "name=",
      ]);
      expect(result).toEqual({
        toolPrefix: "",
        description: "",
        name: "",
      });
    });
  });

  describe("mixed value types", () => {
    it("should handle mixed string, boolean, and array values", () => {
      const result = parseKeyValueAttributes([
        "name=test",
        "enabled=true",
        "disabledTools=['tool1', 'tool2']",
        "description=my description",
      ]);
      expect(result).toEqual({
        name: "test",
        enabled: true,
        disabledTools: ["tool1", "tool2"],
        description: "my description",
      });
    });
  });

  describe("validation", () => {
    it("should throw error for invalid attribute format", () => {
      expect(() => parseKeyValueAttributes(["invalidformat"])).toThrow(
        "Invalid attribute format: invalidformat. Expected key=value",
      );
    });

    it("should handle malformed array as string", () => {
      const result = parseKeyValueAttributes(["disabledTools=[invalid"]);
      expect(result).toEqual({
        disabledTools: "[invalid",
      });
    });

    it("should validate allowed attributes when specified", () => {
      expect(() =>
        parseKeyValueAttributes(["name=test", "invalid=value"], {
          allowedAttributes: ["name", "description"],
        }),
      ).toThrow(
        "Attribute 'invalid' is not allowed. Allowed attributes: name, description",
      );
    });

    it("should allow all attributes when no allowedAttributes specified", () => {
      const result = parseKeyValueAttributes([
        "name=test",
        "custom=value",
        "another=123",
      ]);
      expect(result).toEqual({
        name: "test",
        custom: "value",
        another: "123",
      });
    });

    it("should allow specified attributes when allowedAttributes is provided", () => {
      const result = parseKeyValueAttributes(
        ["name=test", "description=my description"],
        { allowedAttributes: ["name", "description"] },
      );
      expect(result).toEqual({
        name: "test",
        description: "my description",
      });
    });
  });

  describe("edge cases", () => {
    it("should handle empty input array", () => {
      const result = parseKeyValueAttributes([]);
      expect(result).toEqual({});
    });

    it("should handle single quotes within double quotes", () => {
      const result = parseKeyValueAttributes(['description="It\'s a test"']);
      expect(result).toEqual({
        description: "It's a test",
      });
    });

    it("should handle double quotes within single quotes", () => {
      const result = parseKeyValueAttributes([
        "description='He said \"hello\"'",
      ]);
      expect(result).toEqual({
        description: 'He said "hello"',
      });
    });

    it("should handle arrays with empty strings", () => {
      const result = parseKeyValueAttributes(["tags=['', 'tag1', '']"]);
      expect(result).toEqual({
        tags: ["", "tag1", ""],
      });
    });

    it("should handle boolean values in arrays", () => {
      const result = parseKeyValueAttributes(["flags=[true, false, 'string']"]);
      expect(result).toEqual({
        flags: ["true", "false", "string"],
      });
    });
  });
});
