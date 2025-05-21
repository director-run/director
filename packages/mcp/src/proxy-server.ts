import { getLogger } from "@director.run/utilities/logger";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import * as eventsource from "eventsource";
import { z } from "zod";
import packageJson from "../package.json";
import { setupPromptHandlers } from "./handlers/prompts-handler";
import { setupResourceTemplateHandlers } from "./handlers/resource-templates-handler";
import { setupResourceHandlers } from "./handlers/resources-handler";
import { setupToolHandlers } from "./handlers/tools-handler";
import { SimpleClient } from "./simple-client";
import { SimpleServer } from "./simple-server";
import type { ProxyServerAttributes, ProxyTargetAttributes } from "./types";

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
        const target = new SimpleClient(server.name);
        await target.connect(getTransport(server));
        this.targets.push(target);
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

function getTransport(targetServer: ProxyTargetAttributes): Transport {
  switch (targetServer.transport.type) {
    case "sse":
      return new SSEClientTransport(new URL(targetServer.transport.url));
    case "stdio":
      return new StdioClientTransport({
        command: targetServer.transport.command,
        args: targetServer.transport.args,
        env: {
          ...(process.env as Record<string, string>),
          ...(targetServer.transport?.env || {}),
        },
      });
    default:
      throw new Error(`Transport ${targetServer.name} not available.`);
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
