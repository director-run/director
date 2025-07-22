import { AppError, ErrorCode } from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import type {
  ProxyServerAttributes,
  ProxyTargetAttributes,
} from "@director.run/utilities/schema";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import * as eventsource from "eventsource";
import _ from "lodash";
import packageJson from "../package.json";
import { createClientForTarget } from "./client/client-factory";
import { HTTPClient } from "./client/http-client";
import { StdioClient } from "./client/stdio-client";
import { setupPromptHandlers } from "./handlers/prompts-handler";
import { setupResourceTemplateHandlers } from "./handlers/resource-templates-handler";
import { setupResourceHandlers } from "./handlers/resources-handler";
import { setupToolHandlers } from "./handlers/tools-handler";

global.EventSource = eventsource.EventSource;

const logger = getLogger(`ProxyServer`);

export class ProxyServer extends Server {
  private targets: (HTTPClient | StdioClient)[];
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
          tools: { listChanged: true },
        },
      },
    );
    this.targets = [];
    this.attributes = attributes;

    for (const server of this.attributes.servers) {
      const target = createClientForTarget(server);
      this.targets.push(target);
    }

    // TODO: add controller
    // if (this.attributes.useController) {
    //   const controllerServer = createControllerServer({ proxy: this });
    //   const controllerClient =
    //     await SimpleClient.createAndConnectToServer(controllerServer);

    //   this.targets.push(controllerClient);
    // }

    setupToolHandlers(this, this.targets, this.attributes.addToolPrefix);
    setupPromptHandlers(this, this.targets);
    setupResourceHandlers(this, this.targets);
    setupResourceTemplateHandlers(this, this.targets);
  }

  public async connectTargets(
    { throwOnError } = { throwOnError: false },
  ): Promise<void> {
    for (const target of this.targets) {
      await target.connectToTarget({ throwOnError });
    }
  }

  public async addTarget(
    target: ProxyTargetAttributes,
    attribs: { throwOnError: boolean } = { throwOnError: false },
  ) {
    const existingTarget = this.targets.find(
      (t) => t.name.toLocaleLowerCase() === target.name.toLocaleLowerCase(),
    );
    if (existingTarget) {
      throw new AppError(
        ErrorCode.BAD_REQUEST,
        `Target ${target.name} already exists`,
      );
    }
    const newTarget = createClientForTarget(target);
    await newTarget.connectToTarget({ throwOnError: attribs.throwOnError });
    this.attributes.servers.push(target);
    this.targets.push(newTarget);
    // TODO: send list changed events. need client to support this first
    // this.sendToolListChanged();
    // this.sendPromptListChanged();
    // this.sendResourceListChanged();
  }

  public async removeTarget(targetName: string) {
    const existingTarget = this.targets.find(
      (t) => t.name.toLocaleLowerCase() === targetName.toLocaleLowerCase(),
    );
    if (!existingTarget) {
      throw new AppError(
        ErrorCode.BAD_REQUEST,
        `Target ${targetName} does not exists`,
      );
    }
    await existingTarget.close();
    this.attributes.servers = this.attributes.servers.filter(
      (t) => t.name.toLocaleLowerCase() !== targetName.toLocaleLowerCase(),
    );

    _.remove(this.targets, (t) => t.name === targetName);

    // TODO: send list changed events. need client to support this first
    // this.sendToolListChanged();
    // this.sendPromptListChanged();
    // this.sendResourceListChanged();
  }

  public update(
    attributes: Partial<Pick<ProxyServerAttributes, "name" | "description">>,
  ) {
    const { name, description } = attributes;
    if (name) {
      this.attributes.name = name;
    }
    if (description && description !== this.attributes.description) {
      this.attributes.description = description;
    }
  }

  public toPlainObject() {
    return {
      ...this.attributes,
      targets: this.targets.map((target) => {
        const base = target.toPlainObject();
        if (target instanceof HTTPClient) {
          return {
            ...base,
            type: "http",
            command: target.url,
          };
        } else {
          return {
            ...base,
            type: "stdio",
            command: [target.command, ...(target.args ?? [])].join(" "),
          };
        }
      }),
    };
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

// function createControllerServer({ proxy }: { proxy: ProxyServer }) {
//   const server = new SimpleServer(`${proxy.id}-controller`);
//   server
//     .tool("list_targets")
//     .schema(z.object({}))
//     .description("List proxy targets")
//     .handle(({}) => {
//       return Promise.resolve({
//         status: "success",
//         data: [
//           {
//             name: "test",
//             description: "test",
//             url: "https://github.com/test",
//           },
//         ],
//       });
//     });

//   return server;
// }
