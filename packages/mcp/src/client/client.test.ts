import type {
  CallToolResult,
  GetPromptResult,
  TextContent,
} from "@modelcontextprotocol/sdk/types.js";
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

function getTextContent(result: CallToolResult): string | undefined {
  const content = result.content?.[0];
  if (content && content.type === "text") {
    return (content as TextContent).text;
  }
  return undefined;
}

function getPromptTextContent(result: GetPromptResult): string | undefined {
  const content = result.messages?.[0]?.content;
  if (content && typeof content === "object" && "type" in content) {
    if (content.type === "text") {
      return (content as TextContent).text;
    }
  }
  return undefined;
}
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

  server
    .prompt("greeting")
    .description("A greeting prompt")
    .arguments([{ name: "name", description: "Name to greet", required: true }])
    .handle(({ name }) => {
      return {
        messages: [
          {
            role: "user",
            content: { type: "text", text: `Hello, ${name}!` },
          },
        ],
      };
    });

  server
    .prompt("farewell")
    .description("A farewell prompt")
    .arguments([
      { name: "name", description: "Name to bid farewell", required: true },
    ])
    .handle(({ name }) => {
      return {
        messages: [
          {
            role: "user",
            content: { type: "text", text: `Goodbye, ${name}!` },
          },
        ],
      };
    });

  server
    .prompt("welcome")
    .description("A welcome prompt")
    .arguments([
      { name: "name", description: "Name to welcome", required: true },
    ])
    .handle(({ name }) => {
      return {
        messages: [
          {
            role: "user",
            content: { type: "text", text: `Welcome, ${name}!` },
          },
        ],
      };
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
        expect(getTextContent(result)).toContain("Hello, world!");
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
        expect(getTextContent(result)).toContain("Hello, world!");
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
        expect(getTextContent(result)).toContain("Hello, world!");
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

        expect(getTextContent(result)).toContain("Hello, world!");
      });

      test("should call original tools when tool prefix is undefined", async () => {
        client.tools = undefined;
        const result2 = (await client.callTool({
          name: "echo",
          arguments: {
            message: "Hello, world!",
          },
        })) as CallToolResult;
        expect(getTextContent(result2)).toContain("Hello, world!");
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
        expect(getTextContent(result1)).toContain("Hello, world!");

        const result2 = (await client.callTool({
          name: "foo",
          arguments: { message: "Hello, world!" },
        })) as CallToolResult;
        expect(getTextContent(result2)).toContain("Hello, world!");
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
        expect(getTextContent(result)).toContain("Hello, world!");

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

  describe("excluded prompts", () => {
    beforeEach(() => {
      client.prompts = { exclude: ["greeting", "farewell"] };
    });

    afterEach(() => {
      client.prompts = undefined;
    });

    describe("getPrompt", () => {
      test("should not get disabled prompts", async () => {
        await expect(
          client.getPrompt({
            name: "greeting",
            arguments: { name: "World" },
          }),
        ).rejects.toThrow(McpError);
      });

      test("should get enabled prompts", async () => {
        const result = await client.getPrompt({
          name: "welcome",
          arguments: { name: "World" },
        });
        expect(getPromptTextContent(result)).toContain("Welcome, World!");
      });
    });

    describe("originalListPrompts", () => {
      test("should return all prompts", async () => {
        const result = await client.originalListPrompts();
        expect(result.prompts.map((p) => p.name)).toEqual([
          "greeting",
          "farewell",
          "welcome",
        ]);
      });
    });

    describe("listPrompts", () => {
      test("should not return excluded prompts", async () => {
        const result = await client.listPrompts();
        expect(result.prompts.map((p) => p.name)).toEqual(["welcome"]);
      });

      test("should return all prompts when prompts config is undefined", async () => {
        client.prompts = undefined;
        const result = await client.listPrompts();
        expect(result.prompts.map((p) => p.name)).toEqual([
          "greeting",
          "farewell",
          "welcome",
        ]);
      });
    });
  });

  describe("included prompts", () => {
    beforeEach(() => {
      client.prompts = { include: ["greeting", "farewell"] };
    });

    afterEach(() => {
      client.prompts = undefined;
    });

    describe("getPrompt", () => {
      test("should get included prompts", async () => {
        const result1 = await client.getPrompt({
          name: "greeting",
          arguments: { name: "World" },
        });
        expect(getPromptTextContent(result1)).toContain("Hello, World!");

        const result2 = await client.getPrompt({
          name: "farewell",
          arguments: { name: "World" },
        });
        expect(getPromptTextContent(result2)).toContain("Goodbye, World!");
      });

      test("should not get non-included prompts", async () => {
        await expect(
          client.getPrompt({
            name: "welcome",
            arguments: { name: "World" },
          }),
        ).rejects.toThrow(McpError);
      });
    });

    describe("listPrompts", () => {
      test("should only return included prompts", async () => {
        const result = await client.listPrompts();
        expect(result.prompts.map((p) => p.name).sort()).toEqual([
          "farewell",
          "greeting",
        ]);
      });
    });
  });

  describe("empty include arrays", () => {
    describe("tools", () => {
      beforeEach(() => {
        client.tools = { include: [] };
      });

      afterEach(() => {
        client.tools = undefined;
      });

      test("should not return any tools when include is empty", async () => {
        const result = await client.listTools();
        expect(result.tools).toEqual([]);
      });

      test("should not call any tools when include is empty", async () => {
        await expect(
          client.callTool({
            name: "echo",
            arguments: { message: "Hello, world!" },
          }),
        ).rejects.toThrow(McpError);

        await expect(
          client.callTool({
            name: "foo",
            arguments: { message: "Hello, world!" },
          }),
        ).rejects.toThrow(McpError);

        await expect(
          client.callTool({
            name: "bar",
            arguments: { message: "Hello, world!" },
          }),
        ).rejects.toThrow(McpError);
      });
    });

    describe("prompts", () => {
      beforeEach(() => {
        client.prompts = { include: [] };
      });

      afterEach(() => {
        client.prompts = undefined;
      });

      test("should not return any prompts when include is empty", async () => {
        const result = await client.listPrompts();
        expect(result.prompts).toEqual([]);
      });

      test("should not get any prompts when include is empty", async () => {
        await expect(
          client.getPrompt({
            name: "greeting",
            arguments: { name: "World" },
          }),
        ).rejects.toThrow(McpError);

        await expect(
          client.getPrompt({
            name: "farewell",
            arguments: { name: "World" },
          }),
        ).rejects.toThrow(McpError);

        await expect(
          client.getPrompt({
            name: "welcome",
            arguments: { name: "World" },
          }),
        ).rejects.toThrow(McpError);
      });
    });
  });

  describe("validation errors", () => {
    test("should throw error when both include and exclude are specified for tools", () => {
      expect(() => {
        client.tools = { include: ["echo"], exclude: ["foo"] };
      }).toThrow("Cannot use both 'include' and 'exclude' at the same time");
    });

    test("should throw error when both include and exclude are specified for prompts", () => {
      expect(() => {
        client.prompts = { include: ["greeting"], exclude: ["farewell"] };
      }).toThrow("Cannot use both 'include' and 'exclude' at the same time");
    });
  });
});
