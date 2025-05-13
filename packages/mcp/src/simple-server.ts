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

export class SimpleServer {
  private tools: Map<string, AnyToolDefinition> = new Map();
  private mcpServer: Server;

  constructor() {
    this.mcpServer = new Server(
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

  tool<T extends z.ZodType>(name: string) {
    return new ToolBuilder<T>(name, this);
  }

  private setupRequestHandlers() {
    this.mcpServer.setRequestHandler(ListToolsRequestSchema, () => {
      return {
        tools: Array.from(this.tools.values()).map((tool) => ({
          name: tool.name,
          description: tool.description,
          inputSchema: zodToJsonSchema(tool.schema),
        })),
      };
    });

    this.mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
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

  registerTool<T extends z.ZodType>(definition: ToolDefinition<T>) {
    this.tools.set(definition.name, definition as unknown as AnyToolDefinition);
  }

  getServer(): Server {
    return this.mcpServer;
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

class ToolBuilder<T extends z.ZodType> {
  private name: string;
  private server: SimpleServer;
  private toolSchema?: T;
  private toolDescription?: string;
  private toolHandler?: ToolHandler<T>;

  constructor(name: string, server: SimpleServer) {
    this.name = name;
    this.server = server;
  }

  schema(schema: T): this {
    this.toolSchema = schema;
    return this;
  }

  description(description: string): this {
    this.toolDescription = description;
    return this;
  }

  handler(handler: ToolHandler<T>): this {
    this.toolHandler = handler;
    return this;
  }

  build(): void {
    if (!this.toolSchema) {
      throw new Error("Schema is required");
    }
    if (!this.toolDescription) {
      throw new Error("Description is required");
    }
    if (!this.toolHandler) {
      throw new Error("Handler is required");
    }

    this.server.registerTool({
      name: this.name,
      schema: this.toolSchema,
      description: this.toolDescription,
      handler: this.toolHandler,
    });
  }
}
