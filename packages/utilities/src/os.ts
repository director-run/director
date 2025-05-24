import { exec, execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { promisify } from "node:util";
import { getLogger } from "./logger";

/**
 * Pauses execution for the specified number of milliseconds.
 * @param ms The number of milliseconds to sleep.
 * @returns A promise that resolves after the specified time.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const execAsync = promisify(exec);

const logger = getLogger("restartApp");

export enum App {
  CLAUDE = "Claude",
  CURSOR = "Cursor",
}

export async function restartApp(app: App): Promise<void> {
  logger.info(`restarting ${app}...`);
  if (!isAppRunning(app)) {
    logger.info(`${app} is not running, skipping restart`);
    return;
  }
  await execAsync(`osascript -e 'tell application "${app}" to quit'`);
  await sleep(2000);
  await execAsync(`open -a ${app}`);
  logger.info(`${app} has been restarted`);
}

export async function openFileInCode(filePath: string): Promise<void> {
  logger.info(`opening ${filePath}`);
  await execAsync(`code "${filePath}"`);
}

/**
 * Checks if a command/application is installed by using the 'which' command
 * @param commandName - The name of the command to check
 * @returns boolean - true if the command is installed, false otherwise
 */
export function isAppInstalled(app: App): boolean {
  try {
    const isWindows = process.platform === "win32";
    const command = isWindows ? `where ${app}` : `which ${app}`;

    execSync(command, {
      stdio: "pipe",
      encoding: "utf8",
    });
    return true;
  } catch (error) {
    return false;
  }
}

export function isFilePresent(filePath: string): boolean {
  return existsSync(filePath);
}

/**
 * Checks if an application is running on macOS
 * @param appName - The exact name of the application process
 * @returns Promise<boolean> - true if the application is running, false otherwise
 */
export function isAppRunning(app: App): boolean {
  try {
    // Use pgrep -x for exact process name matching
    execSync(`pgrep -x "${app}"`, { stdio: "pipe" });
    return true;
  } catch (error) {
    // pgrep returns exit code 1 when no processes are found
    return false;
  }
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
