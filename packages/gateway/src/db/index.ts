import { existsSync } from "node:fs";
import { readJSONFile, writeJSONFile } from "@director.run/utilities/json";
import {
  type DatabaseAttributes,
  type ProxyServerAttributes,
  databaseAttributesSchema,
} from "@director.run/utilities/schema";
import slugify from "slugify";

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

  private constructor(filePath: string) {
    this.filePath = filePath;
  }

  static async connect(filePath: string): Promise<Database> {
    const db = new Database(filePath);

    if (!existsSync(filePath)) {
      await writeDB(filePath, {
        proxies: [],
      });
    }

    return db;
  }

  async addProxy(
    proxy: Omit<ProxyServerAttributes, "id">,
  ): Promise<ProxyServerAttributes> {
    const store = await readDB(this.filePath);

    const existingProxy = store.proxies.find((p) => p.name === proxy.name);
    if (existingProxy) {
      throw new Error("Proxy already exists");
    }

    const newProxy = {
      ...proxy,
      servers: (proxy.servers || []).map((s) => ({
        ...s,
        name: slugify(s.name, { lower: true, strict: true, trim: true }),
      })),
      id: slugify(proxy.name, { lower: true, strict: true, trim: true }),
    };

    store.proxies.push(newProxy);
    await writeDB(this.filePath, store);

    return newProxy;
  }

  async getProxy(id: string): Promise<ProxyServerAttributes> {
    const store = await readDB(this.filePath);
    const proxy = store.proxies.find((p) => p.id === id);

    if (!proxy) {
      throw new Error("Proxy not found");
    }

    return proxy;
  }

  async deleteProxy(id: string): Promise<void> {
    const store = await readDB(this.filePath);
    const proxy = store.proxies.find((p) => p.id === id);

    if (!proxy) {
      throw new Error("Proxy not found");
    }

    store.proxies = store.proxies.filter((p) => p.id !== id);
    await writeDB(this.filePath, store);
  }

  async updateProxy(
    id: string,
    attributes: Partial<ProxyServerAttributes>,
  ): Promise<ProxyServerAttributes> {
    const store = await readDB(this.filePath);
    const proxy = store.proxies.find((p) => p.id === id);

    if (!proxy) {
      throw new Error("Proxy not found");
    }

    Object.assign(proxy, {
      ...attributes,
      servers: (attributes.servers || proxy.servers || []).map((s) => ({
        ...s,
        name: slugify(s.name, { lower: true, trim: true }),
      })),
    });

    await writeDB(this.filePath, store);

    return proxy;
  }

  async getAll(): Promise<ProxyServerAttributes[]> {
    const store = await readDB(this.filePath);
    return store.proxies;
  }

  async purge(): Promise<void> {
    await writeDB(this.filePath, {
      proxies: [],
    });
  }
}
