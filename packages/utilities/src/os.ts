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
}

export async function restartApp(app: App): Promise<void> {
  logger.info(`restarting ${app}...`);
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
export function isCommandInstalled(commandName: string): boolean {
  try {
    const isWindows = process.platform === "win32";
    const command = isWindows ? `where ${commandName}` : `which ${commandName}`;

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
