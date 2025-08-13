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

function makeDefaultDB(): DatabaseAttributes {
  return {
    version: "1.0.0",
    proxies: [],
  };
}

async function readDB(filePath: string): Promise<DatabaseAttributes> {
  const store = await readJSONFile(filePath);
  return databaseAttributesSchema.parse(store);
}

async function writeDB(
  filePath: string,
  data: DatabaseAttributes,
): Promise<void> {
  return await writeJSONFile(filePath, data);
}

export class Database {
  public readonly filePath: string;
  private _data?: DatabaseAttributes;

  private constructor(filePath: string) {
    this.filePath = filePath;
  }

  private async init() {
    if (!existsSync(this.filePath)) {
      this._data = makeDefaultDB();
      await writeDB(this.filePath, this._data);
    } else {
      // this._data = await readDB(this.filePath);
      const store = await readJSONFile(this.filePath);
      this._data = databaseAttributesSchema.parse(store);
    }
  }

  static async connect(filePath: string): Promise<Database> {
    const db = new Database(filePath);
    await db.init();
    return db;
  }

  private async getStore(): Promise<DatabaseAttributes> {
    if (!this._data) {
      const store = await readJSONFile(this.filePath);
      this._data = databaseAttributesSchema.parse(store);
    }
    return this._data;
  }

  private async saveStore(store: DatabaseAttributes): Promise<void> {
    await writeDB(this.filePath, store);
    this._data = _.cloneDeep(store);
  }

  private findProxy(
    proxies: ProxyServerAttributes[],
    id: string,
  ): ProxyServerAttributes {
    const proxy = proxies.find((p) => p.id === id);
    if (!proxy) {
      throw new Error("Proxy not found");
    }
    return proxy;
  }

  private findServer(
    servers: ProxyTargetAttributes[],
    name: string,
  ): ProxyTargetAttributes {
    const server = servers.find((s) => s.name === name);
    if (!server) {
      throw new Error("Server not found");
    }
    return server;
  }

  private findPrompt(
    prompts: PromptAttributes[],
    name: string,
  ): { prompt: PromptAttributes; index: number } {
    const index = prompts.findIndex((p) => p.name === name);
    if (index === -1) {
      throw new Error(`Prompt ${name} not found`);
    }
    return { prompt: prompts[index], index };
  }

  private slugifyName(name: string): string {
    return slugify(name, { lower: true, strict: true, trim: true });
  }

  async addProxy(
    proxy: Omit<ProxyServerAttributes, "id">,
  ): Promise<ProxyServerAttributes> {
    const store = await this.getStore();

    if (store.proxies.find((p) => p.name === proxy.name)) {
      throw new Error("Proxy already exists");
    }

    const newProxy: ProxyServerAttributes = {
      ...proxy,
      id: this.slugifyName(proxy.name),
      servers: (proxy.servers || []).map((s) => ({
        ...s,
        name: this.slugifyName(s.name),
      })),
    };

    store.proxies.push(newProxy);
    await this.saveStore(store);
    return newProxy;
  }

  async getProxy(id: string): Promise<ProxyServerAttributes> {
    const store = await this.getStore();
    return this.findProxy(store.proxies, id);
  }

  async deleteProxy(id: string): Promise<void> {
    const store = await this.getStore();
    this.findProxy(store.proxies, id); // Verify exists
    store.proxies = store.proxies.filter((p) => p.id !== id);
    await this.saveStore(store);
  }

  async updateProxy(
    id: string,
    attributes: Partial<ProxyServerAttributes>,
  ): Promise<ProxyServerAttributes> {
    const store = await this.getStore();
    const proxy = this.findProxy(store.proxies, id);

    Object.assign(proxy, {
      ...attributes,
      name: attributes.name ?? proxy.name,
      servers: (attributes.servers || proxy.servers || []).map((s) => ({
        ...s,
        name: this.slugifyName(s.name),
      })),
    });

    await this.saveStore(store);
    return proxy;
  }

  async countProxies(): Promise<number> {
    const store = await this.getStore();
    return store.proxies.length;
  }

  async updateServer(
    proxyId: string,
    serverName: string,
    attributes: Partial<ProxyTargetAttributes>,
  ): Promise<ProxyTargetAttributes> {
    const store = await this.getStore();
    const proxy = this.findProxy(store.proxies, proxyId);
    const server = this.findServer(proxy.servers, serverName);

    Object.assign(server, attributes);
    await this.saveStore(store);
    return server;
  }

  async getServer(
    proxyId: string,
    serverName: string,
  ): Promise<ProxyTargetAttributes> {
    const store = await this.getStore();
    const proxy = this.findProxy(store.proxies, proxyId);
    return this.findServer(proxy.servers, serverName);
  }

  async addServer(
    proxyId: string,
    server: ProxyTargetAttributes,
  ): Promise<ProxyTargetAttributes> {
    const proxy = await this.getProxy(proxyId);
    await this.updateProxy(proxyId, {
      servers: [...proxy.servers, server],
    });
    return server;
  }

  async removeServer(proxyId: string, serverName: string): Promise<boolean> {
    const proxy = await this.getProxy(proxyId);
    await this.updateProxy(proxyId, {
      servers: proxy.servers.filter(
        (s) => s.name.toLowerCase() !== serverName.toLowerCase(),
      ),
    });
    return true;
  }

  async getAll(): Promise<ProxyServerAttributes[]> {
    const store = await this.getStore();
    return store.proxies;
  }

  async purge(): Promise<void> {
    await this.saveStore(makeDefaultDB());
  }

  async addPrompt(
    proxyId: string,
    prompt: PromptAttributes,
  ): Promise<PromptAttributes> {
    const proxy = await this.getProxy(proxyId);
    await this.updateProxy(proxyId, {
      prompts: [...(proxy.prompts || []), prompt],
    });
    return prompt;
  }

  async getPrompts(proxyId: string): Promise<PromptAttributes[]> {
    const proxy = await this.getProxy(proxyId);
    return proxy.prompts || [];
  }

  async removePrompt(proxyId: string, promptName: string): Promise<boolean> {
    const proxy = await this.getProxy(proxyId);
    const updatedPrompts = (proxy.prompts || []).filter(
      (p) => p.name !== promptName,
    );

    if (updatedPrompts.length === (proxy.prompts || []).length) {
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

    const updatedPrompt: PromptAttributes = {
      ...currentPrompt,
      ...(prompt.title && { title: prompt.title }),
      ...(prompt.description !== undefined && {
        description: prompt.description,
      }),
      ...(prompt.body && { body: prompt.body }),
    };

    const updatedPrompts = [...(proxy.prompts || [])];
    updatedPrompts[index] = updatedPrompt;

    await this.updateProxy(proxyId, { prompts: updatedPrompts });
    return updatedPrompt;
  }
}
