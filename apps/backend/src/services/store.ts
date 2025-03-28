import fs from "node:fs";
import { PROXY_DB_FILE_PATH } from "../config";
import { AppError, ErrorCode } from "../helpers/error";
import { getLogger } from "../helpers/logger";
import { readJSONFile } from "../helpers/readJSONFile";
import { writeJSONFile } from "../helpers/writeJSONFile";


type TransportConfigStdio = {
  type?: "stdio";
  command: string;
  args?: string[];
  env?: string[];
};

type TransportConfigSSE = {
  type: "sse";
  url: string;
};

export type Server = {
  name: string;
  transport: TransportConfigSSE | TransportConfigStdio;
}

export type Proxy = {
  name: string;
  servers: Array<Server>;
};

export type ProxyDB = {
  proxies: Proxy[];
};

const logger = getLogger("store");

export async function initStore() {
  if (!fs.existsSync(PROXY_DB_FILE_PATH)) {
    logger.info(`Creating store at path: ${PROXY_DB_FILE_PATH}`);
    await writeJSONFile<ProxyDB>(PROXY_DB_FILE_PATH, {
      proxies: [],
    });
  }
}

export async function createProxy(proxy: Proxy): Promise<Proxy> {
  const db = await readJSONFile<ProxyDB>(PROXY_DB_FILE_PATH);
  const newProxy = {
    ...proxy,
  };
  const existingProxy = db.proxies.find((p) => p.name === proxy.name);
  if (existingProxy) {
    throw new AppError(
      ErrorCode.CONFLICT,
      `Proxy ${proxy.name} already exists`,
    );
  }

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

export async function getAllProxies(): Promise<Proxy[]> {
  const db: ProxyDB = await readJSONFile<ProxyDB>(PROXY_DB_FILE_PATH);
  return db.proxies;
}
