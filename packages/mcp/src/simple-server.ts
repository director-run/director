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

type ToolHandler<T> = (args: T) => Promise<unknown>;

interface ToolDefinition<T> {
  name: string;
  schema?: z.ZodType<T>;
  description: string;
  handler: ToolHandler<T>;
}

class ToolBuilder<T extends Record<string, unknown>> {
  private definition: Partial<ToolDefinition<T>>;
  private server: SimpleServer;

  constructor(name: string, server: SimpleServer) {
    this.definition = { name };
    this.server = server;
  }

  withSchema<S extends z.ZodType>(schema: S): ToolBuilder<z.infer<S>> {
    this.definition.schema = schema;
    return this as unknown as ToolBuilder<z.infer<S>>;
  }

  withDescription(description: string): ToolBuilder<T> {
    this.definition.description = description;
    return this;
  }

  handle(handler: ToolHandler<T>): void {
    if (!this.definition.description) {
      throw new Error("Description is required");
    }
    if (!this.definition.name) {
      throw new Error("Name is required");
    }
    const definition: ToolDefinition<T> = {
      name: this.definition.name,
      schema: this.definition.schema,
      description: this.definition.description,
      handler,
    };
    this.server.registerTool(definition);
  }
}

export class SimpleServer extends Server {
  private tools: Map<string, ToolDefinition<Record<string, unknown>>> =
    new Map();

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

  defineTool<T extends Record<string, unknown>>(name: string): ToolBuilder<T> {
    return new ToolBuilder<T>(name, this);
  }

  registerTool<T extends Record<string, unknown>>(
    definition: ToolDefinition<T>,
  ) {
    this.tools.set(
      definition.name,
      definition as ToolDefinition<Record<string, unknown>>,
    );
  }

  private setupRequestHandlers() {
    this.setRequestHandler(ListToolsRequestSchema, () => {
      return {
        tools: Array.from(this.tools.values()).map((tool) => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.schema ? zodToJsonSchema(tool.schema) : undefined,
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

        let args = request.params.arguments as Record<string, unknown>;
        if (tool.schema) {
          args = tool.schema.parse(request.params.arguments);
        }
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
