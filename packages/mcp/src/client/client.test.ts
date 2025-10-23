import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { z } from "zod";
import { InMemoryClient } from "../client/in-memory-client";
import { SimpleServer } from "../simple-server";

export function makeTestServer() {
  const server = new SimpleServer("echo-server");
  server
    .tool("echo")
    .description("Echo a message")
    .schema(z.object({ message: z.string() }))
    .handle(async ({ message }) => {
      return await { message };
    });

  server
    .tool("foo")
    .description("Foo a message")
    .schema(z.object({ message: z.string() }))
    .handle(async ({ message }) => {
      return await { message };
    });

  server
    .tool("bar")
    .description("Foo a message")
    .schema(z.object({ message: z.string() }))
    .handle(async ({ message }) => {
      return await { message };
    });
  return server;
}

describe("client integration tests", () => {
  let client: InMemoryClient;

  beforeEach(async () => {
    const testServer = makeTestServer();
    client = new InMemoryClient(
      {
        name: "test-client",
      },
      {
        server: testServer,
      },
    );
    await client.connectToTarget({ throwOnError: true });
  });

  afterEach(async () => {
    await client.close();
  });

  describe("excluded tools", () => {
    beforeEach(() => {
      client.tools = { exclude: ["echo", "foo"] };
    });

    afterEach(() => {
      client.tools = undefined;
    });

    describe("callTool", () => {
      test("should not call disabled tools", async () => {
        await expect(
          client.callTool({
            name: "echo",
            arguments: { message: "Hello, world!" },
          }),
        ).rejects.toThrow(McpError);
      });

      test("should call enabled tools", async () => {
        const result = (await client.callTool({
          name: "bar",
          arguments: { message: "Hello, world!" },
        })) as CallToolResult;
        expect(result.content?.[0].text).toContain("Hello, world!");
      });

      test("should work with tool prefix", async () => {
        client.tools = { exclude: ["echo", "foo"], prefix: "prefix__" };
        await expect(
          client.callTool({
            name: "bar",
            arguments: { message: "Hello, world!" },
          }),
        ).rejects.toThrow(McpError);

        await expect(
          client.callTool({
            name: "prefix__echo",
            arguments: { message: "Hello, world!" },
          }),
        ).rejects.toThrow(McpError);

        const result = (await client.callTool({
          name: "prefix__bar",
          arguments: { message: "Hello, world!" },
        })) as CallToolResult;
        expect(result.content?.[0].text).toContain("Hello, world!");
      });
    });

    describe("originalListTools", () => {
      test("should return all tools", async () => {
        const result3 = await client.originalListTools();
        expect(result3.tools.map((t) => t.name)).toEqual([
          "echo",
          "foo",
          "bar",
        ]);
      });
    });

    describe("listTools", () => {
      test("should not return excluded tools", async () => {
        const result = await client.listTools();
        expect(result.tools.map((t) => t.name)).toEqual(["bar"]);
      });

      test("should not return excluded tools when tool prefix is set", async () => {
        client.tools = { exclude: ["echo", "foo"], prefix: "prefix__" };
        const result = await client.listTools();
        expect(result.tools.map((t) => t.name)).toEqual(["prefix__bar"]);
      });

      test("should return all tools when tools config is undefined", async () => {
        client.tools = undefined;
        const result2 = await client.listTools();
        expect(result2.tools.map((t) => t.name)).toEqual([
          "echo",
          "foo",
          "bar",
        ]);
      });
    });
  });

  describe("tool prefixing", () => {
    const toolPrefix = "echo-service__";

    beforeEach(() => {
      client.tools = { prefix: toolPrefix };
    });

    afterEach(() => {
      client.tools = undefined;
    });

    describe("originalCallTool", () => {
      test("should call original tools", async () => {
        const result = (await client.originalCallTool({
          name: "echo",
          arguments: {
            message: "Hello, world!",
          },
        })) as CallToolResult;
        expect(result.content?.[0].text).toContain("Hello, world!");
      });
    });

    describe("originalListTools", () => {
      test("should return original tools", async () => {
        const tools = await client.originalListTools();
        expect(tools.tools.map((t) => t.name)).toEqual(["echo", "foo", "bar"]);
      });
    });

    describe("callTool", () => {
      test("should fail if using original tool name when using a tool prefix", async () => {
        await expect(
          client.callTool({
            name: "echo",
            arguments: {
              message: "Hello, world!",
            },
          }),
        ).rejects.toThrow(McpError);
      });

      test("should call prefixed tools", async () => {
        const result = (await client.callTool({
          name: `${toolPrefix}echo`,
          arguments: {
            message: "Hello, world!",
          },
        })) as CallToolResult;

        expect(result.content?.[0].text).toContain("Hello, world!");
      });

      test("should call original tools when tool prefix is undefined", async () => {
        client.tools = undefined;
        const result2 = (await client.callTool({
          name: "echo",
          arguments: {
            message: "Hello, world!",
          },
        })) as CallToolResult;
        expect(result2.content?.[0].text).toContain("Hello, world!");
      });
    });

    describe("listTools", () => {
      test("should return prefixed tools", async () => {
        const tools = await client.listTools();

        expect(tools.tools).toHaveLength(3);
        expect(tools.tools.map((t) => t.name).sort()).toEqual([
          `${toolPrefix}bar`,
          `${toolPrefix}echo`,
          `${toolPrefix}foo`,
        ]);
      });

      test("should return original tools when tool prefix is undefined", async () => {
        client.tools = undefined;
        const tools = await client.listTools();
        expect(tools.tools.map((t) => t.name)).toEqual(["echo", "foo", "bar"]);
      });
    });
  });

  describe("included tools", () => {
    beforeEach(() => {
      client.tools = { include: ["echo", "foo"] };
    });

    afterEach(() => {
      client.tools = undefined;
    });

    describe("callTool", () => {
      test("should call included tools", async () => {
        const result1 = (await client.callTool({
          name: "echo",
          arguments: { message: "Hello, world!" },
        })) as CallToolResult;
        expect(result1.content?.[0].text).toContain("Hello, world!");

        const result2 = (await client.callTool({
          name: "foo",
          arguments: { message: "Hello, world!" },
        })) as CallToolResult;
        expect(result2.content?.[0].text).toContain("Hello, world!");
      });

      test("should not call non-included tools", async () => {
        await expect(
          client.callTool({
            name: "bar",
            arguments: { message: "Hello, world!" },
          }),
        ).rejects.toThrow(McpError);
      });

      test("should work with tool prefix", async () => {
        client.tools = { include: ["echo", "foo"], prefix: "prefix__" };
        const result = (await client.callTool({
          name: "prefix__echo",
          arguments: { message: "Hello, world!" },
        })) as CallToolResult;
        expect(result.content?.[0].text).toContain("Hello, world!");

        await expect(
          client.callTool({
            name: "prefix__bar",
            arguments: { message: "Hello, world!" },
          }),
        ).rejects.toThrow(McpError);
      });
    });

    describe("listTools", () => {
      test("should only return included tools", async () => {
        const result = await client.listTools();
        expect(result.tools.map((t) => t.name).sort()).toEqual(["echo", "foo"]);
      });

      test("should only return included tools when tool prefix is set", async () => {
        client.tools = { include: ["echo", "foo"], prefix: "prefix__" };
        const result = await client.listTools();
        expect(result.tools.map((t) => t.name).sort()).toEqual([
          "prefix__echo",
          "prefix__foo",
        ]);
      });
    });
  });
});
