import { exec, execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { AppError, ErrorCode } from "../error";
import { getLogger } from "../logger";
import { sleep } from "../sleep";
import { AbstractController, App } from "./abstract-controller";

const execAsync = promisify(exec);
const logger = getLogger("os/macos");

export class MacOSController extends AbstractController {
  async restartApp(app: App): Promise<void> {
    logger.info(`restarting ${app}...`);
    if (!this.isAppRunning(app)) {
      logger.info(`${app} is not running, skipping restart`);
      return;
    }
    await execAsync(`osascript -e 'tell application "${app}" to quit'`);
    await sleep(2000);
    await execAsync(`open -a ${app}`);
    logger.info(`${app} has been restarted`);
  }

  async openFileInCode(filePath: string): Promise<void> {
    logger.info(`opening ${filePath}`);
    await execAsync(`code "${filePath}"`);
  }

  isCommandInPath(command: string): boolean {
    try {
      return (
        execSync(`which ${command}`, { stdio: "pipe" }).toString().trim()
          .length > 0
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
  isAppInstalled(app: App): boolean {
    try {
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
          throw new AppError(ErrorCode.INVALID_ARGUMENT, `unknown app: ${app}`);
      }

      const result = execSync(
        `mdfind "kMDItemDisplayName == '${displayName}'"`,
        {
          stdio: "pipe",
          encoding: "utf8",
        },
      );
      return result.trim().length > 0;
    } catch (error) {
      return false;
    }
  }

  isFilePresent(filePath: string): boolean {
    return existsSync(filePath);
  }

  /**
   * Checks if an application is running on macOS
   * @param appName - The exact name of the application process
   * @returns Promise<boolean> - true if the application is running, false otherwise
   */
  isAppRunning(app: App): boolean {
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
  async openUrl(url: string): Promise<void> {
    // Validate URL format
    if (!url || typeof url !== "string") {
      throw new Error("Invalid URL provided");
    }

    // Add protocol if missing
    const formattedUrl =
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `https://${url}`;

    try {
      await execAsync(`open "${formattedUrl}"`);
    } catch (error) {
      throw new Error(
        `Failed to open URL: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  getConfigFileForApp(app: App): string {
    switch (app) {
      case App.CLAUDE:
        return path.join(
          homedir(),
          "Library/Application Support/Claude/claude_desktop_config.json",
        );
      case App.CURSOR:
        return path.join(homedir(), ".cursor/mcp.json");
      case App.VSCODE:
        return path.join(
          homedir(),
          "Library/Application Support/Code/User/settings.json",
        );
    }
  }
}
