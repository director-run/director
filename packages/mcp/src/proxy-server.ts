import { getLogger } from "@director.run/utilities/logger";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import * as eventsource from "eventsource";
import { z } from "zod";
import packageJson from "../package.json";
import { setupPromptHandlers } from "./handlers/prompts-handler";
import { setupResourceTemplateHandlers } from "./handlers/resource-templates-handler";
import { setupResourceHandlers } from "./handlers/resources-handler";
import { setupToolHandlers } from "./handlers/tools-handler";
import { SimpleClient } from "./simple-client";
import { SimpleServer } from "./simple-server";
import type { ProxyServerAttributes } from "./types";

global.EventSource = eventsource.EventSource;

const logger = getLogger(`ProxyServer`);

export class ProxyServer extends Server {
  private targets: SimpleClient[];
  public readonly attributes: ProxyServerAttributes & {
    useController?: boolean;
  };

  constructor(attributes: ProxyServerAttributes & { useController?: boolean }) {
    super(
      {
        name: attributes.name,
        version: packageJson.version,
      },
      {
        capabilities: {
          prompts: {},
          resources: { subscribe: true },
          tools: {},
        },
      },
    );
    this.targets = [];
    this.attributes = attributes;
  }

  public async connectTargets(
    { throwOnError } = { throwOnError: false },
  ): Promise<void> {
    for (const server of this.attributes.servers) {
      try {
        const client = new SimpleClient(server.name);

        if (server.transport.type === "sse") {
          await client.connectToHTTP(server.transport.url);
        } else {
          await client.connectToStdio(
            server.transport.command,
            server.transport.args ?? [],
            {
              ...(process.env as Record<string, string>),
              ...(server.transport?.env || {}),
            },
          );
        }

        this.targets.push(client);
      } catch (error) {
        logger.error({
          message: `failed to connect to target ${server.name}`,
          error,
        });
        if (throwOnError) {
          throw error;
        }
      }
    }

    if (this.attributes.useController) {
      const controllerServer = createControllerServer({ proxy: this });
      const controllerClient =
        await SimpleClient.createAndConnectToServer(controllerServer);

      this.targets.push(controllerClient);
    }

    // Setup handlers
    setupToolHandlers(this, this.targets);
    setupPromptHandlers(this, this.targets);
    setupResourceHandlers(this, this.targets);
    setupResourceTemplateHandlers(this, this.targets);
  }

  public toPlainObject() {
    return this.attributes;
  }

  get id() {
    return this.attributes.id;
  }

  async close(): Promise<void> {
    logger.info({ message: `shutting down`, proxyId: this.id });

    await Promise.all(this.targets.map((target) => target.close()));
    await super.close();
  }
}

function createControllerServer({ proxy }: { proxy: ProxyServer }) {
  const server = new SimpleServer(`${proxy.id}-controller`);
  server
    .tool("list_targets")
    .schema(z.object({}))
    .description("List proxy targets")
    .handle(({}) => {
      return Promise.resolve({
        status: "success",
        data: [
          {
            name: "test",
            description: "test",
            url: "https://github.com/test",
          },
        ],
      });
    });

  return server;
}
