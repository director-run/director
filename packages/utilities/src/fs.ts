import fs from "fs";

/**
 * Find the first file that exists from a list of candidate paths.
 *
 * @param candidates - Array of full file paths to check
 * @returns The first file path that exists, or undefined if none exist
 *
 * @example
 * ```ts
 * const configPath = findFirstMatch([
 *   '/home/user/.config/app/config.json',
 *   '/etc/app/config.json',
 *   './config.json'
 * ]);
 * ```
 */
export function findFirstMatch(candidates: string[]): string | undefined {
  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    } catch {
      // If we can't check this path, skip it and continue
      continue;
    }
  }
  return undefined;
}
