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
  VSCODE = "Visual Studio Code",
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
  } catch (error) {
    return false;
  }
}

/**
 * Checks if a desktop application is installed on the system
 * @param app - The app to check for installation
 * @returns boolean - true if the app is installed, false otherwise
 * @throws Error on Windows as this function is not supported
 */
export function isAppInstalled(app: App): boolean {
  const platform = process.platform;

  if (platform === "win32") {
    return false;
    // throw new Error("isAppInstalled is not supported on Windows");
  }

  try {
    // Map apps to their display names
    let displayName: string;
    switch (app) {
      case App.CLAUDE:
        displayName = "Claude";
        break;
      case App.CURSOR:
        displayName = "Cursor";
        break;
      case App.VSCODE:
        displayName = "Visual Studio Code";
        break;
      default:
        displayName = app;
    }

    if (platform === "darwin") {
      // macOS: Use mdfind to search for the application
      const result = execSync(
        `mdfind "kMDItemDisplayName == '${displayName}'"`,
        {
          stdio: "pipe",
          encoding: "utf8",
        },
      );
      return result.trim().length > 0;
    } else if (platform === "linux") {
      // Linux: Check common application directories and which command
      const appDirs = [
        "/usr/share/applications",
        "/usr/local/share/applications",
        "~/.local/share/applications",
      ];

      // Check .desktop files in application directories
      for (const dir of appDirs) {
        try {
          const result = execSync(
            `find ${dir} -name "*.desktop" -exec grep -l "${displayName}" {} \\;`,
            {
              stdio: "pipe",
              encoding: "utf8",
            },
          );
          if (result.trim().length > 0) {
            return true;
          }
        } catch {
          // Ignore errors for non-existent directories
          continue;
        }
      }
    }
    return false;
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
