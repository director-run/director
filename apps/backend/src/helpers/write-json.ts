import { promises as fsPromises } from "node:fs";
import { existsSync } from "node:fs";
import path from "node:path";
import { AppError, ErrorCode } from "./error";

export async function writeJsonFile<T = unknown>(filePath: string, data: T) {
  if (!existsSync(filePath)) {
    throw new AppError(ErrorCode.NOT_FOUND, `file not found at: ${filePath}`);
  }

  await fsPromises.mkdir(path.dirname(filePath), { recursive: true });
  return fsPromises.writeFile(filePath, JSON.stringify(data, null, 2));
}
