import fs, { type PathLike } from "node:fs";
import { existsSync } from "node:fs";
import { dirname } from "node:path";
import { AppError, ErrorCode } from "./error";

import { parse } from "jsonc-parser";

export type ReadJSONFileOptions = {
  jsonc?: boolean;
};

export async function readJSONFile<T = unknown>(
  filePath: PathLike,
  options?: ReadJSONFileOptions,
): Promise<T> {
  if (!existsSync(filePath)) {
    throw new AppError(ErrorCode.NOT_FOUND, `file not found at: ${filePath}`);
  }

  const buffer = await fs.promises.readFile(filePath);
  const data = new TextDecoder().decode(buffer);
  
  if (options?.jsonc) {
    const errors: any[] = [];
    const parsed = parse(data, errors, { allowTrailingComma: true });
    if (errors.length > 0) {
      throw new SyntaxError(`JSONC parse error: ${errors.map(e => e.error).join(', ')}`);
    }
    return parsed as T;
  }
  
  return JSON.parse(data) as T;
}

export async function writeJSONFile<T = unknown>(filePath: string, data: T) {
  await fs.promises.mkdir(dirname(filePath), { recursive: true });
  return fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
}
