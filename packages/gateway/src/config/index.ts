import { existsSync } from "node:fs";
import { readJSONFile, writeJSONFile } from "@director.run/utilities/json";
import {
  type DatabaseAttributes,
  type PromptAttributes,
  type ProxyServerAttributes,
  type ProxyTargetAttributes,
  databaseAttributesSchema,
} from "@director.run/utilities/schema";
import _ from "lodash";
import slugify from "slugify";

export class Configuration {
  public readonly filePath: string;
  private _data?: DatabaseAttributes;

  private constructor(filePath: string) {
    this.filePath = filePath;
  }

  private async init() {
    if (!existsSync(this.filePath)) {
      await this.writeData(makeDefaultDB());
    } else {
      const store = await readJSONFile(this.filePath);
      this._data = databaseAttributesSchema.parse(store);
    }
  }

  static async connect(filePath: string): Promise<Configuration> {
    const db = new Configuration(filePath);
    await db.init();
    return db;
  }

  private async readData(): Promise<DatabaseAttributes> {
    if (!this._data) {
      await this.init();
    }
    return this._data as DatabaseAttributes;
  }

  private async writeData(data: DatabaseAttributes): Promise<void> {
    await writeJSONFile(this.filePath, data);
    this._data = _.cloneDeep(data);
  }

  private findServer(
    servers: ProxyTargetAttributes[],
    name: string,
  ): ProxyTargetAttributes {
    const server = _.find(servers, { name });
    if (!server) {
      throw new Error("Server not found");
    }
    return server;
  }

  private findPrompt(
    prompts: PromptAttributes[],
    name: string,
  ): { prompt: PromptAttributes; index: number } {
    const index = _.findIndex(prompts, { name });
    if (index === -1) {
      throw new Error(`Prompt ${name} not found`);
    }
    return { prompt: prompts[index], index };
  }

  async addProxy(
    proxy: Omit<ProxyServerAttributes, "id">,
  ): Promise<ProxyServerAttributes> {
    const store = await this.readData();

    if (_.find(store.proxies, { name: proxy.name })) {
      throw new Error("Proxy already exists");
    }

    const newProxy: ProxyServerAttributes = {
      ...proxy,
      id: slugifyName(proxy.name),
      servers: _.map(proxy.servers || [], (s) => ({
        ...s,
        name: slugifyName(s.name),
      })),
    };

    store.proxies.push(newProxy);
    await this.writeData(store);
    return newProxy;
  }

  async getProxy(id: string): Promise<ProxyServerAttributes> {
    const store = await this.readData();
    const proxy = _.find(store.proxies, { id });
    if (!proxy) {
      throw new Error("Proxy not found");
    }
    return proxy;
  }

  async deleteProxy(id: string): Promise<void> {
    await this.getProxy(id); // Verify exists
    const store = await this.readData();
    store.proxies = _.reject(store.proxies, { id });
    await this.writeData(store);
  }

  async updateProxy(
    id: string,
    attributes: Partial<ProxyServerAttributes>,
  ): Promise<ProxyServerAttributes> {
    const store = await this.readData();
    const proxy = await this.getProxy(id);

    _.assign(proxy, {
      ...attributes,
      name: attributes.name ?? proxy.name,
      servers: _.map(
        attributes.servers || proxy.servers || [],
        (s: ProxyTargetAttributes) => ({
          ...s,
          name: slugifyName(s.name),
        }),
      ),
    });

    await this.writeData(store);
    return proxy;
  }

  async countProxies(): Promise<number> {
    const store = await this.readData();
    return _.size(store.proxies);
  }

  async updateServer(
    proxyId: string,
    serverName: string,
    attributes: Partial<ProxyTargetAttributes>,
  ): Promise<ProxyTargetAttributes> {
    const store = await this.readData();
    const proxy = await this.getProxy(proxyId);
    const server = this.findServer(proxy.servers, serverName);

    _.assign(server, attributes);
    await this.writeData(store);
    return server;
  }

  async getServer(
    proxyId: string,
    serverName: string,
  ): Promise<ProxyTargetAttributes> {
    const proxy = await this.getProxy(proxyId);
    return this.findServer(proxy.servers, serverName);
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
    return store.proxies;
  }

  async purge(): Promise<void> {
    await this.writeData(makeDefaultDB());
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
    const { prompt: currentPrompt, index } = this.findPrompt(
      proxy.prompts || [],
      promptName,
    );

    const updatedPrompt: PromptAttributes = _.merge({}, currentPrompt, prompt);

    const updatedPrompts = _.clone(proxy.prompts || []);
    updatedPrompts[index] = updatedPrompt;

    await this.updateProxy(proxyId, { prompts: updatedPrompts });
    return updatedPrompt;
  }
}

function makeDefaultDB(): DatabaseAttributes {
  return {
    version: "1.0.0",
    proxies: [],
  };
}

function slugifyName(name: string): string {
  return slugify(name, { lower: true, strict: true, trim: true });
}
