import { env } from "@director.run/config/env";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

type ToolHandler<T extends z.ZodType> = (args: z.infer<T>) => Promise<unknown>;

interface ToolDefinition<T extends z.ZodType> {
  name: string;
  schema: T;
  description: string;
  handler: ToolHandler<T>;
}

type AnyToolDefinition = ToolDefinition<
  z.ZodType<unknown, z.ZodTypeDef, unknown>
>;

export class SimpleServer extends Server {
  private tools: Map<string, AnyToolDefinition> = new Map();

  constructor() {
    super(
      {
        name: "simple-server",
        version: env.VERSION,
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.setupRequestHandlers();
  }

  registerTool<T extends z.ZodType>(definition: ToolDefinition<T>) {
    this.tools.set(definition.name, definition as unknown as AnyToolDefinition);
  }

  private setupRequestHandlers() {
    this.setRequestHandler(ListToolsRequestSchema, () => {
      return {
        tools: Array.from(this.tools.values()).map((tool) => ({
          name: tool.name,
          description: tool.description,
          inputSchema: zodToJsonSchema(tool.schema),
        })),
      };
    });

    this.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        if (!request.params.arguments) {
          throw new Error("Arguments are required");
        }

        const tool = this.tools.get(request.params.name);
        if (!tool) {
          throw new Error(`Unknown tool: ${request.params.name}`);
        }

        const args = tool.schema.parse(request.params.arguments);
        const result = await tool.handler(args);

        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error(`Invalid input: ${JSON.stringify(error.errors)}`);
        }
        throw error;
      }
    });
  }
}

export async function createInMemoryClient(server: Server): Promise<Client> {
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();

  const client = new Client(
    {
      name: "test client",
      version: "1.0",
    },
    {
      capabilities: {
        sampling: {},
      },
      enforceStrictCapabilities: true,
    },
  );

  await Promise.all([
    client.connect(clientTransport),
    server.connect(serverTransport),
  ]);

  return client;
}
