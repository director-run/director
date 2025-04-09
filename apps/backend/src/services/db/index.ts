import { existsSync } from "node:fs";
import slugify from "slugify";
import { PROXY_DB_FILE_PATH } from "../../constants";
import { readJSONFile } from "../../helpers/readJSONFile";
import { writeJSONFile } from "../../helpers/writeJSONFile";
import { type DatabaseSchema, type Proxy, databaseSchema } from "./schema";

export async function initDB(configFilePath = PROXY_DB_FILE_PATH) {
  if (existsSync(configFilePath)) {
    return;
  } else {
    writeDBFile(
      {
        proxies: [],
      },
      configFilePath,
    );
  }
}

export async function readDBFile(
  absolutePath?: string,
): Promise<DatabaseSchema> {
  const store = await readJSONFile(absolutePath ?? PROXY_DB_FILE_PATH);
  return databaseSchema.parse(store);
}

export async function writeDBFile(
  store: DatabaseSchema,
  absolutePath?: string,
) {
  return await writeJSONFile(absolutePath ?? PROXY_DB_FILE_PATH, store);
}

export async function addProxyConfigEntry(
  proxy: Omit<Proxy, "id">,
  absolutePath?: string,
) {
  const store = await readDBFile(absolutePath);

  const existingProxy = store.proxies.find((p) => p.name === proxy.name);

  if (existingProxy) {
    throw new Error("Proxy already exists");
  }

  store.proxies.push({
    ...proxy,
    id: slugify(proxy.name, { lower: true, trim: true }),
  });

  await writeDBFile(store, absolutePath);

  return proxy;
}

export async function getProxyConfigEntry(name: string, absolutePath?: string) {
  const store = await readDBFile(absolutePath);
  const proxy = store.proxies.find((p) => p.name === name);

  if (!proxy) {
    throw new Error("Proxy not found");
  }

  return proxy;
}

export async function deleteProxyConfigEntry(
  name: string,
  absolutePath?: string,
) {
  const store = await readDBFile(absolutePath);
  const proxy = store.proxies.find((p) => p.name === name);

  if (!proxy) {
    throw new Error("Proxy not found");
  }

  store.proxies = store.proxies.filter((p) => p.name !== name);

  await writeDBFile(store, absolutePath);
}

export async function updateProxyConfigEntry(
  name: string,
  attributes: Partial<Proxy>,
  absolutePath?: string,
) {
  const store = await readDBFile(absolutePath);
  const proxy = store.proxies.find((p) => p.name === name);

  if (!proxy) {
    throw new Error("Proxy not found");
  }

  Object.assign(proxy, attributes);
  await writeDBFile(store, absolutePath);

  return proxy;
}

export async function getProxyConfigEntries(absolutePath?: string) {
  const store = await readDBFile(absolutePath);
  return store.proxies;
}
