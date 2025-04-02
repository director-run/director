import fs from "node:fs";
import { PROXY_DB_FILE_PATH } from "../../config";
import { AppError, ErrorCode } from "../../helpers/error";
import { getLogger } from "../../helpers/logger";
import { readJSONFile } from "../../helpers/readJSONFile";
import { writeJSONFile } from "../../helpers/writeJSONFile";
import type { ConfigDB, ProxyConfigItem } from "./types";

const logger = getLogger("store");

export async function initStore() {
  if (!fs.existsSync(PROXY_DB_FILE_PATH)) {
    logger.info(`Creating store at path: ${PROXY_DB_FILE_PATH}`);
    await writeStore({
      proxies: [],
    });
  }
}

async function readStore(): Promise<ConfigDB> {
  return await readJSONFile<ConfigDB>(PROXY_DB_FILE_PATH);
}

async function writeStore(db: ConfigDB): Promise<void> {
  await writeJSONFile<ConfigDB>(PROXY_DB_FILE_PATH, db);
}

export async function createProxy(
  proxy: ProxyConfigItem,
): Promise<ProxyConfigItem> {
  const db = await readStore();
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
  await writeJSONFile<ConfigDB>(PROXY_DB_FILE_PATH, db);
  return newProxy;
}

export async function getProxy(name: string): Promise<ProxyConfigItem> {
  const db: ConfigDB = await readStore();
  const proxy = db.proxies.find((p) => p.name === name);
  if (!proxy) {
    throw new AppError(ErrorCode.NOT_FOUND, `Proxy ${name} not found`);
  }
  return proxy;
}

export async function deleteProxy(name: string): Promise<void> {
  const db: ConfigDB = await readStore();
  if (!db.proxies.find((p) => p.name === name)) {
    throw new AppError(ErrorCode.NOT_FOUND, `Proxy ${name} not found`);
  }
  db.proxies = db.proxies.filter((p) => p.name !== name);
  await writeJSONFile<ConfigDB>(PROXY_DB_FILE_PATH, db);
}

export async function updateProxy(
  name: string,
  attributes: Partial<ProxyConfigItem>,
): Promise<ProxyConfigItem> {
  const db: ConfigDB = await readStore();
  const proxy = db.proxies.find((p) => p.name === name);
  if (!proxy) {
    throw new AppError(ErrorCode.NOT_FOUND, `Proxy ${name} not found`);
  }
  Object.assign(proxy, attributes);
  await writeJSONFile<ConfigDB>(PROXY_DB_FILE_PATH, db);
  return proxy;
}

export async function getAllProxies(): Promise<ProxyConfigItem[]> {
  const db: ConfigDB = await readStore();
  return db.proxies;
}
