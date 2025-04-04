import { promises as fs, existsSync } from "node:fs";
import { DEFAULT_CONFIG_PATH } from "./constants";
import { Config, configSchema } from "./schema";
import { readJsonFile, readJsonFileSync } from "./util/read-json";
import { writeJsonFile, writeJsonFileSync } from "./util/write-json";

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

  return writeJsonFileSync(absolutePath ?? DEFAULT_CONFIG_PATH, {
    proxies: [],
  });
}

export async function createStore(absolutePath?: string) {
  if (await storeExists(absolutePath)) {
    throw new Error("Store already exists");
  }

  return writeJsonFile(absolutePath ?? DEFAULT_CONFIG_PATH, {
    proxies: [],
  });
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
  return writeJsonFile(absolutePath ?? DEFAULT_CONFIG_PATH, store);
}
