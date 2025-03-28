import { PROXY_DB_FILE_PATH } from "../config/env";
import { AppError, ErrorCode } from "../helpers/error";
import { readJSONFile } from "../helpers/readJSONFile";
import { writeJSONFile } from "../helpers/writeJSONFile";

type Proxy = {
  name: string;
  servers: Array<{
    name: string;
    transport:
      | { command: string; args: string[] }
      | { type: "sse"; url: string };
  }>;
};

export type ProxyDB = {
  proxies: Proxy[];
};

export async function createProxy(proxy: Proxy): Promise<Proxy> {
  const db = await readJSONFile<ProxyDB>(PROXY_DB_FILE_PATH);
  const newProxy = {
    ...proxy,
  };
  db.proxies.push(newProxy);
  await writeJSONFile<ProxyDB>(PROXY_DB_FILE_PATH, db);
  return newProxy;
}

export async function getProxy(name: string): Promise<Proxy> {
  const db: ProxyDB = await readJSONFile<ProxyDB>(PROXY_DB_FILE_PATH);
  const proxy = db.proxies.find((p) => p.name === name);
  if (!proxy) {
    throw new AppError(ErrorCode.NOT_FOUND, `Proxy ${name} not found`);
  }
  return proxy;
}

export async function deleteProxy(name: string): Promise<void> {
  const db: ProxyDB = await readJSONFile<ProxyDB>(PROXY_DB_FILE_PATH);
  if (!db.proxies.find((p) => p.name === name)) {
    throw new AppError(ErrorCode.NOT_FOUND, `Proxy ${name} not found`);
  }
  db.proxies = db.proxies.filter((p) => p.name !== name);
  await writeJSONFile<ProxyDB>(PROXY_DB_FILE_PATH, db);
}

export async function updateProxy(
  name: string,
  attributes: Partial<Proxy>,
): Promise<Proxy> {
  const db: ProxyDB = await readJSONFile<ProxyDB>(PROXY_DB_FILE_PATH);
  const proxy = db.proxies.find((p) => p.name === name);
  if (!proxy) {
    throw new AppError(ErrorCode.NOT_FOUND, `Proxy ${name} not found`);
  }
  Object.assign(proxy, attributes);
  await writeJSONFile<ProxyDB>(PROXY_DB_FILE_PATH, db);
  return proxy;
}

export async function getProxies(): Promise<Proxy[]> {
  const db: ProxyDB = await readJSONFile<ProxyDB>(PROXY_DB_FILE_PATH);
  return db.proxies;
}
