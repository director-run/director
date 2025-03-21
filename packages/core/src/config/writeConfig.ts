import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Config } from "./types";

export const writeConfig = async (configFilePath: string, config: Config) => {
  await mkdir(path.dirname(configFilePath), { recursive: true });
  await writeFile(configFilePath, JSON.stringify(config, null, 2));
};
