import { existsSync } from "node:fs";
import slugify from "slugify";
import { DB_FILE_PATH } from "../../config";
import { readJSONFile, writeJSONFile } from "../../helpers/json";
import { type DatabaseSchema, type Proxy, databaseSchema } from "./schema";

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

  static async connect(filePath: string = DB_FILE_PATH): Promise<Database> {
    const db = new Database(filePath);

    if (!existsSync(filePath)) {
      await writeDB(filePath, {
        proxies: [],
      });
    }

    return db;
  }

  async addProxy(proxy: Omit<Proxy, "id">): Promise<Proxy> {
    const store = await readDB(this.filePath);

    const existingProxy = store.proxies.find((p) => p.name === proxy.name);
    if (existingProxy) {
      throw new Error("Proxy already exists");
    }

    const newProxy = {
      ...proxy,
      id: slugify(proxy.name, { lower: true, trim: true }),
    };

    store.proxies.push(newProxy);
    await writeDB(this.filePath, store);

    return newProxy;
  }

  async getProxy(name: string): Promise<Proxy> {
    const store = await readDB(this.filePath);
    const proxy = store.proxies.find((p) => p.name === name);

    if (!proxy) {
      throw new Error("Proxy not found");
    }

    return proxy;
  }

  async deleteProxy(name: string): Promise<void> {
    const store = await readDB(this.filePath);
    const proxy = store.proxies.find((p) => p.name === name);

    if (!proxy) {
      throw new Error("Proxy not found");
    }

    store.proxies = store.proxies.filter((p) => p.name !== name);
    await writeDB(this.filePath, store);
  }

  async updateProxy(name: string, attributes: Partial<Proxy>): Promise<Proxy> {
    const store = await readDB(this.filePath);
    const proxy = store.proxies.find((p) => p.name === name);

    if (!proxy) {
      throw new Error("Proxy not found");
    }

    Object.assign(proxy, attributes);
    await writeDB(this.filePath, store);

    return proxy;
  }

  async listProxies(): Promise<Proxy[]> {
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
