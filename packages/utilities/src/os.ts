import { exec, execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { promisify } from "node:util";

/**
 * Pauses execution for the specified number of milliseconds.
 * @param ms The number of milliseconds to sleep.
 * @returns A promise that resolves after the specified time.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const execAsync = promisify(exec);

export enum App {
  CLAUDE = "Claude",
  CURSOR = "Cursor",
  VSCODE = "Visual Studio Code",
}

export function isCommandInPath(command: string): boolean {
  const platform = process.platform;
  if (platform === "win32") {
    return false;
  }
  try {
    return (
      execSync(`which ${command}`, { stdio: "pipe" }).toString().trim().length >
      0
    );
  } catch (_error) {
    return false;
  }
}

export function isFilePresent(filePath: string): boolean {
  return existsSync(filePath);
}

/**
 * Opens a URL in the default browser across different operating systems
 * @param url - The URL to open
 * @returns Promise that resolves when the command is executed
 */
export async function openUrl(url: string): Promise<void> {
  // Validate URL format
  if (!url || typeof url !== "string") {
    throw new Error("Invalid URL provided");
  }

  // Add protocol if missing
  const formattedUrl =
    url.startsWith("http://") || url.startsWith("https://")
      ? url
      : `https://${url}`;

  const platform = process.platform;
  let command: string;

  switch (platform) {
    case "darwin": // macOS
      command = `open "${formattedUrl}"`;
      break;
    case "win32": // Windows
      command = `start "" "${formattedUrl}"`;
      break;
    case "linux": // Linux
      command = `xdg-open "${formattedUrl}"`;
      break;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }

  try {
    await execAsync(command);
  } catch (error) {
    throw new Error(
      `Failed to open URL: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
