import { describe, expect, it } from "vitest";
import {
  McpServerSchema,
  SseTransportSchema,
  StdioTransportSchema,
  configSchema,
  proxySchema,
} from "../src/schema";

describe("Schema Validation", () => {
  describe("StdioTransportSchema", () => {
    it("should validate a valid stdio transport", () => {
      const validTransport = {
        type: "stdio",
        command: "echo",
        args: ["hello"],
        env: ["PATH=/usr/bin"],
      };
      expect(() => StdioTransportSchema.parse(validTransport)).not.toThrow();
    });

    it("should validate stdio transport without optional fields", () => {
      const minimalTransport = {
        type: "stdio",
        command: "echo",
      };
      expect(() => StdioTransportSchema.parse(minimalTransport)).not.toThrow();
    });

    it("should reject invalid stdio transport", () => {
      const invalidTransport = {
        type: "stdio",
        command: 123, // invalid type
      };
      expect(() => StdioTransportSchema.parse(invalidTransport)).toThrow();
    });
  });

  describe("SseTransportSchema", () => {
    it("should validate a valid SSE transport", () => {
      const validTransport = {
        type: "sse",
        url: "http://example.com/events",
      };
      expect(() => SseTransportSchema.parse(validTransport)).not.toThrow();
    });

    it("should reject invalid SSE transport", () => {
      const invalidTransport = {
        type: "sse",
        url: 123, // invalid type
      };
      expect(() => SseTransportSchema.parse(invalidTransport)).toThrow();
    });
  });

  describe("McpServerSchema", () => {
    it("should validate a valid MCP server with stdio transport", () => {
      const validServer = {
        name: "test-server",
        transport: {
          type: "stdio",
          command: "echo",
        },
      };
      expect(() => McpServerSchema.parse(validServer)).not.toThrow();
    });

    it("should validate a valid MCP server with SSE transport", () => {
      const validServer = {
        name: "test-server",
        transport: {
          type: "sse",
          url: "http://example.com/events",
        },
      };
      expect(() => McpServerSchema.parse(validServer)).not.toThrow();
    });

    it("should reject invalid MCP server", () => {
      const invalidServer = {
        name: 123, // invalid type
        transport: {
          type: "invalid", // invalid transport type
        },
      };
      expect(() => McpServerSchema.parse(invalidServer)).toThrow();
    });
  });

  describe("proxySchema", () => {
    it("should validate a valid proxy", () => {
      const validProxy = {
        name: "test-proxy",
        description: "Test proxy",
        servers: [
          {
            name: "server1",
            transport: {
              type: "stdio",
              command: "echo",
            },
          },
        ],
      };
      expect(() => proxySchema.parse(validProxy)).not.toThrow();
    });

    it("should validate a proxy without description", () => {
      const minimalProxy = {
        name: "test-proxy",
        servers: [
          {
            name: "server1",
            transport: {
              type: "stdio",
              command: "echo",
            },
          },
        ],
      };
      expect(() => proxySchema.parse(minimalProxy)).not.toThrow();
    });

    it("should reject invalid proxy", () => {
      const invalidProxy = {
        name: 123, // invalid type
        servers: [], // empty servers array
      };
      expect(() => proxySchema.parse(invalidProxy)).toThrow();
    });
  });

  describe("configSchema", () => {
    it("should validate a valid config", () => {
      const validConfig = {
        proxies: [
          {
            name: "test-proxy",
            servers: [
              {
                name: "server1",
                transport: {
                  type: "stdio",
                  command: "echo",
                },
              },
            ],
          },
        ],
      };
      expect(() => configSchema.parse(validConfig)).not.toThrow();
    });

    it("should validate an empty config", () => {
      const emptyConfig = {
        proxies: [],
      };
      expect(() => configSchema.parse(emptyConfig)).not.toThrow();
    });

    it("should reject invalid config", () => {
      const invalidConfig = {
        proxies: "not an array", // invalid type
      };
      expect(() => configSchema.parse(invalidConfig)).toThrow();
    });
  });
});
