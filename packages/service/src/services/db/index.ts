import { existsSync } from "node:fs";
import { env } from "@director.run/config/env";
import { readJSONFile, writeJSONFile } from "@director.run/utilities/json";
import slugify from "slugify";
import {
  type DatabaseSchema,
  type ProxyAttributes,
  databaseSchema,
} from "./schema";

async function readDB(filePath: string): Promise<DatabaseSchema> {
  const store = await readJSONFile(filePath);
  return databaseSchema.parse(store);
}

async function writeDB(filePath: string, data: DatabaseSchema): Promise<void> {
  return await writeJSONFile(filePath, data);
}

class Database {
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  static async connect(filePath: string = env.DB_FILE_PATH): Promise<Database> {
    const db = new Database(filePath);

    if (!existsSync(filePath)) {
      await writeDB(filePath, {
        proxies: [],
      });
    }

    return db;
  }

  async addProxy(proxy: Omit<ProxyAttributes, "id">): Promise<ProxyAttributes> {
    const store = await readDB(this.filePath);

    const existingProxy = store.proxies.find((p) => p.name === proxy.name);
    if (existingProxy) {
      throw new Error("Proxy already exists");
    }

    const newProxy = {
      ...proxy,
      servers: (proxy.servers || []).map((s) => ({
        ...s,
        name: slugify(s.name, { lower: true, trim: true }),
      })),
      id: slugify(proxy.name, { lower: true, trim: true }),
    };

    store.proxies.push(newProxy);
    await writeDB(this.filePath, store);

    return newProxy;
  }

  async getProxy(id: string): Promise<ProxyAttributes> {
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
    attributes: Partial<ProxyAttributes>,
  ): Promise<ProxyAttributes> {
    const store = await readDB(this.filePath);
    const proxy = store.proxies.find((p) => p.id === id);

    if (!proxy) {
      throw new Error("Proxy not found");
    }

    Object.assign(proxy, {
      ...attributes,
      servers: (attributes.servers || []).map((s) => ({
        ...s,
        name: slugify(s.name, { lower: true, trim: true }),
      })),
    });

    await writeDB(this.filePath, store);

    return proxy;
  }

  async getAll(): Promise<ProxyAttributes[]> {
    const store = await readDB(this.filePath);
    return store.proxies;
  }

  async purge(): Promise<void> {
    await writeDB(this.filePath, {
      proxies: [],
    });
  }
}

export const db = await Database.connect();
