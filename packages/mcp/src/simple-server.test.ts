import { describe, expect, test } from "vitest";
import { z } from "zod";
import { SimpleServer, createInMemoryClient } from "./simple-server";

interface ToolResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}

describe("SimpleServer", () => {
  test("should create a server with a tool", async () => {
    const server = new SimpleServer();

    const TestSchema = z.object({
      name: z.string(),
      age: z.number(),
    });

    // Type of args is inferred from TestSchema
    server
      .defineTool("test_tool")
      .withSchema(TestSchema)
      .withDescription("A test tool")
      .handle(({ name, age }) => {
        return Promise.resolve({
          status: "success",
          data: {
            name,
            age,
            message: `Hello ${name}, you are ${age} years old`,
          },
        });
      });

    const client = await createInMemoryClient(server);
    const tools = await client.listTools();

    expect(tools.tools).toHaveLength(1);
    expect(tools.tools[0].name).toBe("test_tool");
    expect(tools.tools[0].description).toBe("A test tool");

    // Test calling the tool
    const result = (await client.callTool({
      name: "test_tool",
      arguments: {
        name: "John",
        age: 30,
      },
    })) as ToolResponse;

    expect(JSON.parse(result.content[0].text)).toEqual({
      status: "success",
      data: {
        name: "John",
        age: 30,
        message: "Hello John, you are 30 years old",
      },
    });
  });

  test("should handle validation errors", async () => {
    const server = new SimpleServer();

    const TestSchema = z.object({
      name: z.string(),
      age: z.number(),
    });

    // Type of args is inferred from TestSchema
    server
      .defineTool("test_tool")
      .withSchema(TestSchema)
      .withDescription("A test tool")
      .handle(() => Promise.resolve({ status: "success" }));

    const client = await createInMemoryClient(server);

    // Test invalid input
    await expect(
      client.callTool({
        name: "test_tool",
        arguments: {
          name: "John",
          age: "not a number", // Invalid type
        },
      }),
    ).rejects.toThrow("Invalid input");
  });

  test("should handle unknown tools", async () => {
    const server = new SimpleServer();
    const client = await createInMemoryClient(server);

    // Test calling non-existent tool
    await expect(
      client.callTool({
        name: "non_existent_tool",
        arguments: {},
      }),
    ).rejects.toThrow("Unknown tool");
  });
});
