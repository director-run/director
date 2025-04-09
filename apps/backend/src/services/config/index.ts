import { existsSync } from "node:fs";
import slugify from "slugify";
import { PROXY_DB_FILE_PATH } from "../../constants";
import { readJSONFile } from "../../helpers/readJSONFile";
import { writeJSONFile } from "../../helpers/writeJSONFile";
import { type Config, type Proxy, configSchema } from "./schema";

// export function storeExistsSync(absolutePath?: string) {
//   return existsSync(absolutePath ?? PROXY_DB_FILE_PATH);
// }

// export async function createStore(absolutePath?: string) {
//   if (storeExistsSync(absolutePath)) {
//     throw new Error("Store already exists");
//   }

//   return await writeJSONFile(absolutePath ?? PROXY_DB_FILE_PATH, {
//     proxies: [],
//   });
// }

export async function initConfigFile(configFilePath = PROXY_DB_FILE_PATH) {
  if (existsSync(configFilePath)) {
    return;
  } else {
    writeConfigFile(
      {
        proxies: [],
      },
      configFilePath,
    );
  }
}

export async function readConfigFile(absolutePath?: string): Promise<Config> {
  const store = await readJSONFile(absolutePath ?? PROXY_DB_FILE_PATH);
  return configSchema.parse(store);
}

export async function writeConfigFile(store: Config, absolutePath?: string) {
  return await writeJSONFile(absolutePath ?? PROXY_DB_FILE_PATH, store);
}

export async function addProxyConfigEntry(
  proxy: Omit<Proxy, "id">,
  absolutePath?: string,
) {
  const store = await readConfigFile(absolutePath);

  const existingProxy = store.proxies.find((p) => p.name === proxy.name);

  if (existingProxy) {
    throw new Error("Proxy already exists");
  }

  store.proxies.push({
    ...proxy,
    id: slugify(proxy.name, { lower: true, trim: true }),
  });

  await writeConfigFile(store, absolutePath);

  return proxy;
}

export async function getProxyConfigEntry(name: string, absolutePath?: string) {
  const store = await readConfigFile(absolutePath);
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
  const store = await readConfigFile(absolutePath);
  const proxy = store.proxies.find((p) => p.name === name);

  if (!proxy) {
    throw new Error("Proxy not found");
  }

  store.proxies = store.proxies.filter((p) => p.name !== name);

  await writeConfigFile(store, absolutePath);
}

export async function updateProxyConfigEntry(
  name: string,
  attributes: Partial<Proxy>,
  absolutePath?: string,
) {
  const store = await readConfigFile(absolutePath);
  const proxy = store.proxies.find((p) => p.name === name);

  if (!proxy) {
    throw new Error("Proxy not found");
  }

  Object.assign(proxy, attributes);
  await writeConfigFile(store, absolutePath);

  return proxy;
}

export async function getProxyConfigEntries(absolutePath?: string) {
  const store = await readConfigFile(absolutePath);
  return store.proxies;
}
