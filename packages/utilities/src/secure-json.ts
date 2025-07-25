import fs from "node:fs";
import { dirname } from "node:path";
import { AppError, ErrorCode } from "./error";
import {
  setSecurePermissions,
  validateSecurePermissions,
} from "./file-permissions";

export async function readSecureJSONFile<T = unknown>(
  filePath: string,
): Promise<T> {
  if (!fs.existsSync(filePath)) {
    throw new AppError(ErrorCode.NOT_FOUND, `file not found at: ${filePath}`);
  }

  // Validate file permissions before reading
  validateSecurePermissions(filePath);

  const buffer = await fs.promises.readFile(filePath);
  const data = new TextDecoder().decode(buffer);
  return JSON.parse(data) as T;
}

export async function writeSecureJSONFile<T = unknown>(
  filePath: string,
  data: T,
): Promise<void> {
  // Ensure the directory exists
  await fs.promises.mkdir(dirname(filePath), { recursive: true });

  // Write the file
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));

  // Set secure permissions after writing
  setSecurePermissions(filePath);
}
