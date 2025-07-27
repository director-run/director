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
  describe("tool prefixing", () => {
    const toolPrefix = "echo-service";
    let client: InMemoryClient;

    beforeEach(async () => {
      const testServer = makeTestServer();
      client = new InMemoryClient({
        name: "test-client",
        server: testServer,
        toolPrefix,
      });
      await client.connectToTarget({ throwOnError: true });
    });

    afterEach(async () => {
      await client.close();
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
          name: `${toolPrefix}__echo`,
          arguments: {
            message: "Hello, world!",
          },
        })) as CallToolResult;

        expect(result.content?.[0].text).toContain("Hello, world!");
      });

      test("should call original tools when tool prefix is undefined", async () => {
        client.toolPrefix = undefined;
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
          `${toolPrefix}__bar`,
          `${toolPrefix}__echo`,
          `${toolPrefix}__foo`,
        ]);
      });

      test("should return original tools when tool prefix is undefined", async () => {
        client.toolPrefix = undefined;
        const tools = await client.listTools();
        expect(tools.tools.map((t) => t.name)).toEqual(["echo", "foo", "bar"]);
      });
    });
  });
});
