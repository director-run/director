import fs from "fs";
import { existsSync } from "node:fs";
import { AppError, ErrorCode } from "@director.run/utilities/error";
import {
  type ConfigurationData,
  type PromptAttributes,
  type ProxyServerAttributes,
  type ProxyTargetAttributes,
  databaseAttributesSchema,
} from "@director.run/utilities/schema";
import _ from "lodash";
import slugify from "slugify";
import YAML from "yaml";
import { ZodError } from "zod";

export abstract class Config {
  public readonly filePath: string;
  protected _data?: ConfigurationData;

  protected constructor(filePath: string) {
    this.filePath = filePath;
  }

  protected abstract init(): Promise<void>;
  protected abstract readData(): Promise<ConfigurationData>;
  protected abstract writeData(data: ConfigurationData): Promise<void>;

  async addProxy(
    proxy: Omit<ProxyServerAttributes, "id">,
  ): Promise<ProxyServerAttributes> {
    const store = await this.readData();

    if (_.find(store.playbooks, { name: proxy.name })) {
      throw new Error("Proxy already exists");
    }

    const newProxy: ProxyServerAttributes = {
      id: slugifyName(proxy.name),
      ...proxy,
      servers: _.map(proxy.servers || [], (s) => ({
        ...s,
        name: slugifyName(s.name),
      })),
    };

    store.playbooks.push(newProxy);
    await this.writeData(store);
    return newProxy;
  }

  async getProxy(id: string): Promise<ProxyServerAttributes> {
    const store = await this.readData();
    const proxy = _.find(store.playbooks, { id });
    if (!proxy) {
      throw new Error("Proxy not found");
    }
    return proxy;
  }

  async deleteProxy(id: string): Promise<void> {
    await this.getProxy(id);
    const store = await this.readData();
    store.playbooks = _.reject(store.playbooks, { id });
    await this.writeData(store);
  }

  async updateProxy(
    id: string,
    attributes: Partial<ProxyServerAttributes>,
  ): Promise<ProxyServerAttributes> {
    const store = await this.readData();
    const proxy = await this.getProxy(id);

    // Create a new proxy object with the updated attributes
    const updatedProxy = {
      ...proxy,
      ...attributes,
      name: attributes.name ?? proxy.name,
      servers:
        attributes.servers !== undefined
          ? _.map(attributes.servers, (s: ProxyTargetAttributes) => ({
              ...s,
              name: slugifyName(s.name),
            }))
          : proxy.servers,
      prompts:
        attributes.prompts !== undefined ? attributes.prompts : proxy.prompts,
    };

    const proxyIndex = _.findIndex(store.playbooks, { id });
    store.playbooks[proxyIndex] = updatedProxy;
    await this.writeData(store);
    return updatedProxy;
  }

  async countProxies(): Promise<number> {
    const store = await this.readData();
    return _.size(store.playbooks);
  }

  async updateServer(
    proxyId: string,
    serverName: string,
    attributes: Partial<ProxyTargetAttributes>,
  ): Promise<ProxyTargetAttributes> {
    const store = await this.readData();
    const proxyIndex = _.findIndex(store.playbooks, { id: proxyId });

    if (proxyIndex === -1) {
      throw new Error("Proxy not found");
    }

    const proxy = store.playbooks[proxyIndex];
    const serverIndex = _.findIndex(proxy.servers, { name: serverName });

    if (serverIndex === -1) {
      throw new Error("Server not found");
    }

    const updatedServer = { ...proxy.servers[serverIndex], ...attributes };
    const updatedProxy = {
      ...proxy,
      servers: proxy.servers.map((s, index) =>
        index === serverIndex ? updatedServer : s,
      ),
    };

    store.playbooks[proxyIndex] = updatedProxy;
    await this.writeData(store);
    return updatedServer;
  }

  async getServer(
    proxyId: string,
    serverName: string,
  ): Promise<ProxyTargetAttributes> {
    const proxy = await this.getProxy(proxyId);
    const server = _.find(proxy.servers, { name: serverName });
    if (!server) {
      throw new Error("Server not found");
    }
    return server;
  }

  async addServer(
    proxyId: string,
    server: ProxyTargetAttributes,
  ): Promise<ProxyTargetAttributes> {
    const proxy = await this.getProxy(proxyId);
    await this.updateProxy(proxyId, {
      servers: _.concat(proxy.servers, server),
    });
    return server;
  }

  async removeServer(proxyId: string, serverName: string): Promise<boolean> {
    const proxy = await this.getProxy(proxyId);
    await this.updateProxy(proxyId, {
      servers: _.reject(
        proxy.servers,
        (s) => _.toLower(s.name) === _.toLower(serverName),
      ),
    });
    return true;
  }

  async getAll(): Promise<ProxyServerAttributes[]> {
    const store = await this.readData();
    return store.playbooks;
  }

  async purge(): Promise<void> {
    await this.writeData(defaultConfiguration());
  }

  async addPrompt(
    proxyId: string,
    prompt: PromptAttributes,
  ): Promise<PromptAttributes> {
    const proxy = await this.getProxy(proxyId);
    await this.updateProxy(proxyId, {
      prompts: _.concat(proxy.prompts || [], prompt),
    });
    return prompt;
  }

  async getPrompts(proxyId: string): Promise<PromptAttributes[]> {
    const proxy = await this.getProxy(proxyId);
    return _.get(proxy, "prompts", []);
  }

  async getPrompt(
    proxyId: string,
    promptName: string,
  ): Promise<{ prompt: PromptAttributes; index: number }> {
    const proxy = await this.getProxy(proxyId);
    const prompts = proxy.prompts || [];
    const index = _.findIndex(prompts, { name: promptName });
    if (index === -1) {
      throw new Error(`Prompt ${promptName} not found`);
    }
    return { prompt: prompts[index], index };
  }

  async removePrompt(proxyId: string, promptName: string): Promise<boolean> {
    const prompts = await this.getPrompts(proxyId);
    const updatedPrompts = _.reject(prompts, { name: promptName });

    if (updatedPrompts.length === prompts.length) {
      throw new Error(`Prompt ${promptName} not found`);
    }

    await this.updateProxy(proxyId, { prompts: updatedPrompts });
    return true;
  }

  async updatePrompt(
    proxyId: string,
    promptName: string,
    prompt: Partial<PromptAttributes>,
  ): Promise<PromptAttributes> {
    const proxy = await this.getProxy(proxyId);
    const { prompt: currentPrompt, index } = await this.getPrompt(
      proxyId,
      promptName,
    );

    const updatedPrompt: PromptAttributes = _.merge({}, currentPrompt, prompt);

    const updatedPrompts = _.clone(proxy.prompts || []);
    updatedPrompts[index] = updatedPrompt;

    await this.updateProxy(proxyId, { prompts: updatedPrompts });
    return updatedPrompt;
  }
}

//
// Deprecated
//
// class JSONConfiguration extends Config {
//   static async connect(filePath: string): Promise<JSONConfiguration> {
//     const db = new JSONConfiguration(filePath);
//     await db.init();
//     return db;
//   }

//   async init() {
//     if (!existsSync(this.filePath)) {
//       await this.writeData(defaultConfiguration());
//     } else {
//       const store = await readJSONFile(this.filePath);
//       this._data = databaseAttributesSchema.parse(store);
//     }
//   }

//   async readData(): Promise<ConfigurationData> {
//     if (!this._data) {
//       await this.init();
//     }
//     return this._data as ConfigurationData;
//   }

//   async writeData(data: ConfigurationData): Promise<void> {
//     await writeJSONFile(this.filePath, data);
//     this._data = _.cloneDeep(data);
//   }
// }

export class YAMLConfig extends Config {
  static async connect(filePath: string): Promise<YAMLConfig> {
    const db = new YAMLConfig(filePath);
    await db.init();
    return db;
  }

  async init() {
    if (!existsSync(this.filePath)) {
      await this.writeData(defaultConfiguration());
    } else {
      const data = await fs.promises.readFile(this.filePath, "utf8");
      try {
        this._data = databaseAttributesSchema.parse(YAML.parse(data));
      } catch (e) {
        if (e instanceof ZodError) {
          throw new AppError(
            ErrorCode.INVALID_CONFIGURATION,
            "Invalid configuration file",
            {
              filePath: this.filePath,
              parseErrors: e.errors,
            },
          );
        } else {
          throw e;
        }
      }
    }
  }

  async readData(): Promise<ConfigurationData> {
    if (!this._data) {
      await this.init();
    }
    return _.cloneDeep(this._data) as ConfigurationData;
  }

  async writeData(data: ConfigurationData): Promise<void> {
    await fs.promises.writeFile(this.filePath, YAML.stringify(data));
    this._data = _.cloneDeep(data);
  }
}

function defaultConfiguration(): ConfigurationData {
  return {
    version: "1.0.0",
    playbooks: [],
  };
}

function slugifyName(name: string): string {
  return slugify(name, { lower: true, strict: true, trim: true });
}
