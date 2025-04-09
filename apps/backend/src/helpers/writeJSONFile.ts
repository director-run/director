import { promises as fsPromises } from "node:fs";
import path from "node:path";

export async function writeJSONFile<T = unknown>(filePath: string, data: T) {
  await fsPromises.mkdir(path.dirname(filePath), { recursive: true });
  return fsPromises.writeFile(filePath, JSON.stringify(data, null, 2));
}
