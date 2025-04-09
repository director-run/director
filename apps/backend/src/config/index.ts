import { existsSync } from "node:fs";
import slugify from "slugify";
import { DEFAULT_CONFIG, PROXY_DB_FILE_PATH } from "../constants";
import { readJsonFile } from "../helpers/readJson";
import { writeJsonFile } from "../helpers/write-json";
import { type Config, type Proxy, configSchema } from "./schema";

export function storeExistsSync(absolutePath?: string) {
  return existsSync(absolutePath ?? PROXY_DB_FILE_PATH);
}

export async function createStore(absolutePath?: string) {
  if (storeExistsSync(absolutePath)) {
    throw new Error("Store already exists");
  }

  return await writeJsonFile(
    absolutePath ?? PROXY_DB_FILE_PATH,
    DEFAULT_CONFIG,
  );
}

export async function readStore(absolutePath?: string) {
  const store = await readJsonFile(absolutePath ?? PROXY_DB_FILE_PATH);
  return configSchema.parse(store);
}

export async function writeStore(store: Config, absolutePath?: string) {
  return await writeJsonFile(absolutePath ?? PROXY_DB_FILE_PATH, store);
}

export async function createProxy(
  proxy: Omit<Proxy, "id">,
  absolutePath?: string,
) {
  const store = await readStore(absolutePath);

  const existingProxy = store.proxies.find((p) => p.name === proxy.name);

  if (existingProxy) {
    throw new Error("Proxy already exists");
  }

  store.proxies.push({
    ...proxy,
    id: slugify(proxy.name, { lower: true, trim: true }),
  });

  await writeStore(store, absolutePath);

  return proxy;
}

export async function getProxy(name: string, absolutePath?: string) {
  const store = await readStore(absolutePath);
  const proxy = store.proxies.find((p) => p.name === name);

  if (!proxy) {
    throw new Error("Proxy not found");
  }

  return proxy;
}

export async function deleteProxy(name: string, absolutePath?: string) {
  const store = await readStore(absolutePath);
  const proxy = store.proxies.find((p) => p.name === name);

  if (!proxy) {
    throw new Error("Proxy not found");
  }

  store.proxies = store.proxies.filter((p) => p.name !== name);

  await writeStore(store, absolutePath);
}

export async function updateProxy(
  name: string,
  attributes: Partial<Proxy>,
  absolutePath?: string,
) {
  const store = await readStore(absolutePath);
  const proxy = store.proxies.find((p) => p.name === name);

  if (!proxy) {
    throw new Error("Proxy not found");
  }

  Object.assign(proxy, attributes);
  await writeStore(store, absolutePath);

  return proxy;
}

export async function getProxies(absolutePath?: string) {
  const store = await readStore(absolutePath);
  return store.proxies;
}
