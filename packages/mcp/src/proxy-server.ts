import { getLogger } from "@director.run/utilities/logger";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import * as eventsource from "eventsource";
import packageJson from "../package.json";
import { setupPromptHandlers } from "./handlers/prompts-handler";
import { setupResourceTemplateHandlers } from "./handlers/resource-templates-handler";
import { setupResourceHandlers } from "./handlers/resources-handler";
import { setupToolHandlers } from "./handlers/tools-handler";
import { ProxyTarget } from "./proxy-target";
import type { ProxyServerAttributes } from "./types";

global.EventSource = eventsource.EventSource;

const logger = getLogger(`ProxyServer`);

export class ProxyServer extends Server {
  private targets: ProxyTarget[];
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
      const target = new ProxyTarget(server);
      this.targets.push(target);
    }

    // TODO: add controller
    // if (this.attributes.useController) {
    //   const controllerServer = createControllerServer({ proxy: this });
    //   const controllerClient =
    //     await SimpleClient.createAndConnectToServer(controllerServer);

    //   this.targets.push(controllerClient);
    // }

    setupToolHandlers(this, this.targets);
    setupPromptHandlers(this, this.targets);
    setupResourceHandlers(this, this.targets);
    setupResourceTemplateHandlers(this, this.targets);
  }

  public async connectTargets(
    { throwOnError } = { throwOnError: false },
  ): Promise<void> {
    for (const target of this.targets) {
      await target.smartConnect({ throwOnError });
    }
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
