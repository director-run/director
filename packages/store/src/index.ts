import { promises as fs, existsSync } from "node:fs";
import { DEFAULT_CONFIG, DEFAULT_CONFIG_PATH } from "@/constants";
import type { Config, Proxy } from "@/schema";
import { configSchema } from "@/schema";
import { readJsonFile, readJsonFileSync } from "@/util/read-json";
import { writeJsonFile, writeJsonFileSync } from "@/util/write-json";
import slugify from "slugify";

export function storeExistsSync(absolutePath?: string) {
  return existsSync(absolutePath ?? DEFAULT_CONFIG_PATH);
}

export async function storeExists(absolutePath?: string) {
  return await fs.exists(absolutePath ?? DEFAULT_CONFIG_PATH);
}

export function createStoreSync(absolutePath?: string) {
  if (storeExistsSync(absolutePath)) {
    throw new Error("Store already exists");
  }

  return writeJsonFileSync(absolutePath ?? DEFAULT_CONFIG_PATH, DEFAULT_CONFIG);
}

export async function createStore(absolutePath?: string) {
  if (await storeExists(absolutePath)) {
    throw new Error("Store already exists");
  }

  return await writeJsonFile(
    absolutePath ?? DEFAULT_CONFIG_PATH,
    DEFAULT_CONFIG,
  );
}

export function readStoreSync(absolutePath?: string) {
  const store = readJsonFileSync(absolutePath ?? DEFAULT_CONFIG_PATH);
  return configSchema.parse(store);
}

export async function readStore(absolutePath?: string) {
  const store = await readJsonFile(absolutePath ?? DEFAULT_CONFIG_PATH);
  return configSchema.parse(store);
}

export function writeStoreSync(store: Config, absolutePath?: string) {
  return writeJsonFileSync(absolutePath ?? DEFAULT_CONFIG_PATH, store);
}

export async function writeStore(store: Config, absolutePath?: string) {
  return await writeJsonFile(absolutePath ?? DEFAULT_CONFIG_PATH, store);
}

export function createProxySync(
  proxy: Omit<Proxy, "id">,
  absolutePath?: string,
) {
  const store = readStoreSync(absolutePath);

  const existingProxy = store.proxies.find((p) => p.name === proxy.name);

  if (existingProxy) {
    throw new Error("Proxy already exists");
  }

  store.proxies.push({
    ...proxy,
    id: slugify(proxy.name, { lower: true, trim: true }),
  });

  writeStoreSync(store, absolutePath);

  return proxy;
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

export function getProxySync(name: string, absolutePath?: string) {
  const store = readStoreSync(absolutePath);
  const proxy = store.proxies.find((p) => p.name === name);

  if (!proxy) {
    throw new Error("Proxy not found");
  }

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

export function deleteProxySync(name: string, absolutePath?: string) {
  const store = readStoreSync(absolutePath);
  const proxy = store.proxies.find((p) => p.name === name);

  if (!proxy) {
    throw new Error("Proxy not found");
  }

  store.proxies = store.proxies.filter((p) => p.name !== name);
  writeStoreSync(store, absolutePath);
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

export function updateProxySync(
  name: string,
  attributes: Partial<Proxy>,
  absolutePath?: string,
) {
  const store = readStoreSync(absolutePath);
  const proxy = store.proxies.find((p) => p.name === name);

  if (!proxy) {
    throw new Error("Proxy not found");
  }

  Object.assign(proxy, attributes);
  writeStoreSync(store, absolutePath);

  return proxy;
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

export function getProxiesSync(absolutePath?: string) {
  const store = readStoreSync(absolutePath);
  return store.proxies;
}

export async function getProxies(absolutePath?: string) {
  const store = await readStore(absolutePath);
  return store.proxies;
}
