import fs from "fs";
import { AppError, ErrorCode } from "../helpers/error";

export async function readJSONFile<T>(filePath: string): Promise<T> {
  if (!fs.existsSync(filePath)) {
    throw new AppError(
      ErrorCode.NOT_FOUND,
      `JSON file not found at ${filePath}`,
    );
  }

  return fs.promises
    .readFile(filePath, "utf8")
    .then((data) => JSON.parse(data));
}
