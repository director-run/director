import { describe, expect, it } from "vitest";
import { z } from "zod";
import { SimpleServer } from "../simple-server";
import { InMemoryClient } from "./in-memory-client";

interface ToolResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}

describe("InMemoryClient", () => {
  describe("createAndConnectToServer", () => {
    it("should create a server with a tool", async () => {
      const server = new SimpleServer();

      const TestSchema = z.object({
        name: z.string(),
        age: z.number(),
      });

      server
        .tool("test_tool")
        .schema(TestSchema)
        .description("A test tool")
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

      const client = await InMemoryClient.createAndConnectToServer(server);
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
  });
});
