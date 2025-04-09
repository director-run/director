import fs, { type PathLike } from "node:fs";
import type { FileHandle } from "node:fs/promises";

export async function readJsonFile<T>(
  filePath: PathLike | FileHandle,
): Promise<T> {
  const buffer = await fs.promises.readFile(filePath);
  let data = new TextDecoder().decode(buffer);
  return JSON.parse(data) as T;
}
