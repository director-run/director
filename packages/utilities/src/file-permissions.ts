import fs from "node:fs";
import { AppError, ErrorCode } from "./error";

/**
 * Checks if file permissions are secure (like SSH keys).
 * Files should only be readable/writable by the owner (600).
 * @param filePath Path to the file to check
 * @returns true if permissions are secure, false otherwise
 */
export function hasSecurePermissions(filePath: string): boolean {
  try {
    const stats = fs.statSync(filePath);
    const mode = stats.mode & 0o777; // Get the permission bits

    // Check if file is readable/writable only by owner (600)
    // Also allow 400 (read-only by owner) for read-only files
    return mode === 0o600 || mode === 0o400;
  } catch (_error) {
    // If file doesn't exist, consider it secure (will be created with correct permissions)
    return true;
  }
}

/**
 * Sets secure file permissions (600) on a file.
 * @param filePath Path to the file to set permissions on
 */
export function setSecurePermissions(filePath: string): void {
  try {
    fs.chmodSync(filePath, 0o600);
  } catch (error) {
    throw new AppError(
      ErrorCode.INVALID_ARGUMENT,
      `Failed to set secure permissions on ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Validates file permissions and throws an error if they are insecure.
 * @param filePath Path to the file to validate
 */
export function validateSecurePermissions(filePath: string): void {
  if (!hasSecurePermissions(filePath)) {
    const stats = fs.statSync(filePath);
    const mode = stats.mode & 0o777;
    throw new AppError(
      ErrorCode.INSECURE_FILE_PERMISSIONS,
      `File ${filePath} has insecure permissions (${mode.toString(8)}). Expected 600 or 400. Please run: chmod 600 ${filePath}`,
      { filePath, currentMode: mode.toString(8) },
    );
  }
}
