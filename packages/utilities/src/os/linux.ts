import { exec, execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { AppError, ErrorCode } from "../error";
import { getLogger } from "../logger";
import { AbstractController, App } from "./abstract-controller";

const execAsync = promisify(exec);
const logger = getLogger("os/linux");

export class LinuxController extends AbstractController {
  restartApp(app: App): Promise<void> {
    logger.warn(`restarting ${app} is not supported on Linux`);
    return Promise.resolve();
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

  isAppInstalled(app: App): boolean {
    switch (app) {
      case App.CLAUDE:
        logger.warn(`${app} is not supported on Linux`);
        return false;

      case App.CURSOR:
        logger.warn(`${app} is not supported on Linux, yet`);
        return false;

      case App.VSCODE:
        return this.isCommandInPath("code");
      default:
        throw new AppError(ErrorCode.INVALID_ARGUMENT, `unknown app: ${app}`);
    }
  }

  isFilePresent(filePath: string): boolean {
    return existsSync(filePath);
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
      await execAsync(`xdg-open "${formattedUrl}"`);
    } catch (error) {
      throw new Error(
        `Failed to open URL: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  getConfigFileForApp(app: App): string {
    switch (app) {
      case App.CLAUDE:
        logger.warn(`${app} is not supported on Linux, yet`);
        return "";
      case App.CURSOR:
        logger.warn(`${app} is not supported on Linux, yet`);
        return "";
      case App.VSCODE:
        return path.join(homedir(), ".config/Code/User/settings.json");
    }
  }
}
