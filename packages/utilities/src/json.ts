import fs, { type PathLike } from "node:fs";
import { existsSync } from "node:fs";
import { dirname } from "node:path";
import {
  parse as parseJsonc,
  type ParseError,
  printParseErrorCode,
} from "jsonc-parser";
import { AppError, ErrorCode } from "./error";

export type ReadJSONFileOptions = {
  /**
   * If true, parse as JSONC (JSON with comments).
   * Use this for VSCode settings and other files that may contain comments.
   */
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
    const errors: ParseError[] = [];
    const result = parseJsonc(data, errors);

    // Throw an error if there are fatal parse errors
    // We only throw for critical errors like invalid tokens or missing values
    const fatalErrors = errors.filter(
      (e) =>
        e.error === 1 || // InvalidSymbol
        e.error === 7, // EndOfFileExpected (incomplete JSON)
    );

    if (fatalErrors.length > 0) {
      const firstError = fatalErrors[0];
      throw new SyntaxError(
        `${printParseErrorCode(firstError.error)} at offset ${firstError.offset}`,
      );
    }

    return result as T;
  }

  return JSON.parse(data) as T;
}

export async function writeJSONFile<T = unknown>(filePath: string, data: T) {
  await fs.promises.mkdir(dirname(filePath), { recursive: true });
  return fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
}
