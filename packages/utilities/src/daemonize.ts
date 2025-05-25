/**
 * Elegant Daemonize - A simple, robust TypeScript library for daemonizing Node.js processes
 *
 * @example
 * ```typescript
 * import { daemon, stop, status } from './daemonize';
 *
 * // Start a daemon
 * const result = await daemon('bun run server.ts', {
 *   pidFile: './server.pid',
 *   logFile: './server.log',
 *   cwd: './my-app'
 * });
 *
 * console.log(`Server started with PID: ${result.pid}`);
 *
 * // Check if running
 * const isRunning = await result.isRunning();
 *
 * // Stop the daemon
 * await result.stop();
 *
 * // Or use utility functions
 * const { running, pid } = await status('./server.pid');
 * if (running) {
 *   await stop('./server.pid');
 * }
 * ```
 *
 * @author Your Name
 * @version 1.0.0
 */

import { ChildProcess, spawn } from "child_process";
import { promises as fs } from "fs";
import { dirname, resolve } from "path";

/**
 * Configuration options for daemonizing a process
 */
export interface DaemonOptions {
  /** Path to the PID file (default: './daemon.pid') */
  pidFile?: string;
  /** Path to redirect stdout and stderr (optional) */
  logFile?: string;
  /** Working directory for the process */
  cwd?: string;
  /** Environment variables to pass to the process */
  env?: Record<string, string>;
  /** Additional arguments to pass to the command */
  args?: string[];
  /** How to handle stdio ('ignore' | 'inherit' | 'pipe') */
  stdio?: "ignore" | "inherit" | "pipe";
  /** Callback when process exits */
  onExit?: (code: number | null, signal: NodeJS.Signals | null) => void;
  /** Callback when process encounters an error */
  onError?: (error: Error) => void;
}

/**
 * Result object returned when starting a daemon
 */
export interface DaemonResult {
  /** Process ID of the spawned daemon */
  pid: number;
  /** Function to stop the daemon */
  stop: () => Promise<void>;
  /** Function to check if the daemon is still running */
  isRunning: () => Promise<boolean>;
}

/**
 * Custom error class for daemonize operations
 */
export class DaemonizeError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "DaemonizeError";
  }
}

/**
 * Main Daemonize class for managing daemon processes
 */
export class Daemonize {
  private static readonly DEFAULT_PID_FILE = "./daemon.pid";

  /**
   * Static method to start a daemon process
   *
   * @param command - Command to execute (e.g., 'bun run server.ts')
   * @param options - Configuration options
   * @returns Promise resolving to DaemonResult
   *
   * @example
   * ```typescript
   * const result = await Daemonize.start('bun run server.ts', {
   *   pidFile: './server.pid',
   *   logFile: './server.log'
   * });
   * ```
   */
  static start(
    command: string,
    options: DaemonOptions = {},
  ): Promise<DaemonResult> {
    const daemon = new Daemonize(command, options);
    return daemon.start();
  }

  private pidFile: string;
  private process?: ChildProcess;

  /**
   * Creates a new Daemonize instance
   *
   * @param command - Command to execute
   * @param options - Configuration options
   */
  constructor(
    private command: string,
    private options: DaemonOptions = {},
  ) {
    this.pidFile = resolve(options.pidFile || Daemonize.DEFAULT_PID_FILE);
  }

  /**
   * Starts the daemon process
   *
   * @returns Promise resolving to DaemonResult
   * @throws {DaemonizeError} When daemon is already running or command is invalid
   */
  async start(): Promise<DaemonResult> {
    this.validateCommand();
    await this.checkExistingProcess();

    const pid = await this.spawnDaemon();
    await this.writePidFile(pid);

    return {
      pid,
      stop: () => this.stop(),
      isRunning: () => this.isProcessRunning(pid),
    };
  }

  /**
   * Validates the command format
   *
   * @throws {DaemonizeError} If command format is invalid
   */
  private validateCommand(): void {
    if (!this.command || typeof this.command !== "string") {
      throw new DaemonizeError(
        "Command must be a non-empty string",
        "INVALID_COMMAND",
      );
    }

    // Ensure command starts with 'bun run' for consistency
    if (!this.command.startsWith("bun run ")) {
      throw new DaemonizeError(
        'Command must start with "bun run" (e.g., "bun run server.ts")',
        "INVALID_COMMAND_FORMAT",
      );
    }
  }

  /**
   * Checks if there's already a running daemon process
   *
   * @throws {DaemonizeError} If daemon is already running
   */
  private async checkExistingProcess(): Promise<void> {
    try {
      const existingPid = await this.readPidFile();
      if (existingPid) {
        const isRunning = await this.isProcessRunning(existingPid);

        if (isRunning) {
          throw new DaemonizeError(
            `Daemon already running with PID ${existingPid}`,
            "ALREADY_RUNNING",
          );
        } else {
          console.warn(
            `Found stale PID file with PID ${existingPid}, cleaning up...`,
          );
          await this.removePidFile();
        }
      }
    } catch (error) {
      if (error instanceof DaemonizeError) {
        throw error;
      }
      // PID file doesn't exist or is unreadable, continue
    }
  }

  /**
   * Spawns the daemon process
   *
   * @returns Promise resolving to the process PID
   * @throws {DaemonizeError} If spawning fails
   */
  private async spawnDaemon(): Promise<number> {
    const [cmd, ...args] = this.command.split(" ");
    const allArgs = [...args, ...(this.options.args || [])];

    // Handle log file redirection
    let stdio: any = this.options.stdio ?? "ignore";
    let logFileHandle: fs.FileHandle | undefined;

    if (this.options.logFile) {
      try {
        // Ensure log file directory exists
        await fs.mkdir(dirname(resolve(this.options.logFile)), {
          recursive: true,
        });

        // Open log file for writing
        logFileHandle = await fs.open(resolve(this.options.logFile), "a");
        stdio = ["ignore", logFileHandle.fd, logFileHandle.fd];
      } catch (error) {
        throw new DaemonizeError(
          `Failed to open log file: ${error}`,
          "LOG_FILE_ERROR",
        );
      }
    }

    const child = spawn(cmd, allArgs, {
      detached: true,
      stdio,
      cwd: this.options.cwd,
      env: { ...process.env, ...this.options.env },
    });

    // Close log file handle in parent process
    if (logFileHandle) {
      logFileHandle.close();
    }

    this.setupProcessHandlers(child);
    child.unref();

    if (!child.pid) {
      throw new DaemonizeError(
        "Failed to spawn daemon process",
        "SPAWN_FAILED",
      );
    }

    return child.pid;
  }

  /**
   * Sets up event handlers for the spawned process
   *
   * @param child - The child process
   */
  private setupProcessHandlers(child: ChildProcess): void {
    this.process = child;

    child.on("error", (error) => {
      if (this.options.onError) {
        this.options.onError(error);
      } else {
        console.error("Daemon process error:", error);
      }
    });

    child.on("exit", async (code, signal) => {
      await this.removePidFile();

      if (this.options.onExit) {
        this.options.onExit(code, signal);
      }
    });
  }

  /**
   * Stops the daemon process gracefully
   *
   * @throws {DaemonizeError} If no PID file exists or process is not running
   */
  private async stop(): Promise<void> {
    const pid = await this.readPidFile();
    if (!pid) {
      throw new DaemonizeError("No PID file found", "NO_PID_FILE");
    }

    const isRunning = await this.isProcessRunning(pid);
    if (!isRunning) {
      await this.removePidFile();
      throw new DaemonizeError(
        `Process with PID ${pid} is not running`,
        "NOT_RUNNING",
      );
    }

    try {
      // Send SIGTERM for graceful shutdown
      process.kill(pid, "SIGTERM");

      // Wait for graceful shutdown
      await this.waitForProcessExit(pid, 5000);

      // Force kill if still running
      if (await this.isProcessRunning(pid)) {
        process.kill(pid, "SIGKILL");
        await this.waitForProcessExit(pid, 2000);
      }

      await this.removePidFile();
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ESRCH") {
        // Process already dead
        await this.removePidFile();
        return;
      }
      throw new DaemonizeError(
        `Failed to stop daemon: ${error}`,
        "STOP_FAILED",
      );
    }
  }

  /**
   * Waits for a process to exit within a timeout
   *
   * @param pid - Process ID to wait for
   * @param timeoutMs - Timeout in milliseconds
   */
  private async waitForProcessExit(
    pid: number,
    timeoutMs: number,
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      if (!(await this.isProcessRunning(pid))) {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  /**
   * Checks if a process is currently running
   *
   * @param pid - Process ID to check
   * @returns Promise resolving to true if process is running
   */
  private async isProcessRunning(pid: number): Promise<boolean> {
    try {
      await process.kill(pid, 0);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Reads the PID from the PID file
   *
   * @returns Promise resolving to PID number or null if file doesn't exist
   */
  private async readPidFile(): Promise<number | null> {
    try {
      const content = await fs.readFile(this.pidFile, "utf8");
      const pid = parseInt(content.trim(), 10);
      return isNaN(pid) ? null : pid;
    } catch (error) {
      return null;
    }
  }

  /**
   * Writes the PID to the PID file
   *
   * @param pid - Process ID to write
   * @throws {DaemonizeError} If writing fails
   */
  private async writePidFile(pid: number): Promise<void> {
    try {
      await fs.mkdir(dirname(this.pidFile), { recursive: true });
      await fs.writeFile(this.pidFile, pid.toString(), "utf8");
    } catch (error) {
      throw new DaemonizeError(
        `Failed to write PID file: ${error}`,
        "PID_FILE_WRITE_ERROR",
      );
    }
  }

  /**
   * Removes the PID file
   */
  private async removePidFile(): Promise<void> {
    try {
      await fs.unlink(this.pidFile);
    } catch (error) {
      // Ignore errors when removing PID file
    }
  }
}

/**
 * Convenience function to start a daemon
 *
 * @param command - Command to execute
 * @param options - Configuration options
 * @returns Promise resolving to DaemonResult
 *
 * @example
 * ```typescript
 * const result = await daemon('bun run server.ts', {
 *   pidFile: './server.pid',
 *   logFile: './server.log'
 * });
 * ```
 */
export const daemon = Daemonize.start;

/**
 * Stops a daemon by PID file
 *
 * @param pidFile - Path to the PID file (optional, defaults to './daemon.pid')
 * @throws {DaemonizeError} If daemon is not running or PID file doesn't exist
 *
 * @example
 * ```typescript
 * await stop('./server.pid');
 * ```
 */
export async function stop(pidFile?: string): Promise<void> {
  const daemon = new Daemonize("bun run dummy", { pidFile });
  await daemon["stop"]();
}

/**
 * Gets the status of a daemon by PID file
 *
 * @param pidFile - Path to the PID file (optional, defaults to './daemon.pid')
 * @returns Promise resolving to status object
 *
 * @example
 * ```typescript
 * const { running, pid } = await status('./server.pid');
 * if (running) {
 *   console.log(`Server is running with PID: ${pid}`);
 * }
 * ```
 */
export async function status(
  pidFile?: string,
): Promise<{ running: boolean; pid?: number }> {
  const daemon = new Daemonize("bun run dummy", { pidFile });
  const pid = await daemon["readPidFile"]();

  if (!pid) {
    return { running: false };
  }

  const running = await daemon["isProcessRunning"](pid);
  return { running, pid: running ? pid : undefined };
}
