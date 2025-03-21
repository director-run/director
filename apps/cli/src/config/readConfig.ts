import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { AppError, ErrorCode } from "../error";
import type { Config } from "./types";

export const readConfig = async (configFilePath: string): Promise<Config> => {
  if (!existsSync(configFilePath)) {
    throw new AppError(ErrorCode.NOT_FOUND, `Config file not found at ${configFilePath}`);
  }

  const fileContents = await readFile(configFilePath, "utf-8");
  return JSON.parse(fileContents);
};
