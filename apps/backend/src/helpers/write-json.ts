import fs, { promises as fsPromises } from "node:fs";
import path from "node:path";
import type { JsonObject } from "type-fest";

export async function writeJsonFile(filePath: string, data: JsonObject) {
  await fsPromises.mkdir(path.dirname(filePath), { recursive: true });
  return fsPromises.writeFile(filePath, JSON.stringify(data, null, 2));
}

export function writeJsonFileSync(filePath: string, data: JsonObject) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
