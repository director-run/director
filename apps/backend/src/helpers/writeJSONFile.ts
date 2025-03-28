import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export async function writeJSONFile<T>(
  filePath: string,
  data: T,
): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  return writeFile(filePath, JSON.stringify(data, null, 2)).then(() => {});
}
