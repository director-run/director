import fs, { type PathLike } from "node:fs";
import { existsSync } from "node:fs";
import { AppError, ErrorCode } from "./error";

export async function readJSONFile<T = unknown>(
  filePath: PathLike,
): Promise<T> {
  if (!existsSync(filePath)) {
    throw new AppError(ErrorCode.NOT_FOUND, `file not found at: ${filePath}`);
  }

  const buffer = await fs.promises.readFile(filePath);
  let data = new TextDecoder().decode(buffer);
  return JSON.parse(data) as T;
}
