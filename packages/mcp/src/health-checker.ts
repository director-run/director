import { getLogger } from "@director.run/utilities/logger";
import type { ProxyTransport } from "@director.run/utilities/schema";

const logger = getLogger("HealthChecker");

export interface HealthCheckResult {
  isHealthy: boolean;
  responseTime?: number;
  error?: string;
}

export interface HealthCheckConfig {
  timeout: number; // milliseconds
  httpCheckPath?: string;
  retryOnFailure: boolean;
}

const DEFAULT_CONFIG: HealthCheckConfig = {
  timeout: 5000, // 5 seconds
  httpCheckPath: "/health",
  retryOnFailure: false,
};

export class HealthChecker {
  private config: HealthCheckConfig;

  constructor(config: Partial<HealthCheckConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  public async checkHealth(
    transport: ProxyTransport,
    targetName: string,
  ): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      if (transport.type === "http") {
        return await this.checkHttpHealth(transport.url, targetName, startTime);
      } else {
        return await this.checkStdioHealth(transport, targetName, startTime);
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      logger.debug({
        message: "health check failed",
        targetName,
        transport: transport.type,
        responseTime,
        error: errorMessage,
      });

      return {
        isHealthy: false,
        responseTime,
        error: errorMessage,
      };
    }
  }

  private async checkHttpHealth(
    url: string,
    targetName: string,
    startTime: number,
  ): Promise<HealthCheckResult> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      // Try a simple HEAD request first, fall back to GET if not supported
      let response: Response;

      try {
        response = await fetch(url, {
          method: "HEAD",
          signal: controller.signal,
          headers: {
            "User-Agent": "Director-HealthChecker/1.0",
          },
        });
      } catch (headError) {
        // If HEAD fails, try GET request
        response = await fetch(url, {
          method: "GET",
          signal: controller.signal,
          headers: {
            "User-Agent": "Director-HealthChecker/1.0",
          },
        });
      }

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      // Consider 2xx and 3xx responses as healthy
      const isHealthy = response.status >= 200 && response.status < 400;

      if (!isHealthy) {
        logger.debug({
          message: "http health check returned non-healthy status",
          targetName,
          url,
          status: response.status,
          statusText: response.statusText,
          responseTime,
        });
      }

      return {
        isHealthy,
        responseTime,
        error: isHealthy
          ? undefined
          : `HTTP ${response.status}: ${response.statusText}`,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      if (error instanceof Error && error.name === "AbortError") {
        return {
          isHealthy: false,
          responseTime,
          error: `Health check timeout after ${this.config.timeout}ms`,
        };
      }

      throw error;
    }
  }

  private async checkStdioHealth(
    transport: {
      command: string;
      args?: string[];
      env?: Record<string, string>;
    },
    targetName: string,
    startTime: number,
  ): Promise<HealthCheckResult> {
    // For STDIO transports, we'll use a different approach
    // We can't easily do a lightweight health check, so we'll check if the command exists
    // and is executable. This is a basic check but better than nothing.

    try {
      const { spawn } = await import("child_process");
      const { promisify } = await import("util");
      const { access, constants } = await import("fs");
      const accessAsync = promisify(access);

      // First, check if the command exists and is executable
      try {
        await accessAsync(transport.command, constants.F_OK | constants.X_OK);
      } catch (accessError) {
        // Command might be in PATH, try a quick spawn test
        return await this.testStdioCommand(transport, targetName, startTime);
      }

      const responseTime = Date.now() - startTime;
      return {
        isHealthy: true,
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      throw error;
    }
  }

  private async testStdioCommand(
    transport: {
      command: string;
      args?: string[];
      env?: Record<string, string>;
    },
    targetName: string,
    startTime: number,
  ): Promise<HealthCheckResult> {
    return new Promise((resolve) => {
      const { spawn } = require("child_process");

      // Try to spawn the command with --version or --help to see if it exists
      const testArgs = ["--version"];
      const child = spawn(transport.command, testArgs, {
        stdio: "ignore",
        timeout: this.config.timeout,
        env: { ...process.env, ...transport.env },
      });

      const cleanup = () => {
        if (!child.killed) {
          child.kill("SIGTERM");
        }
      };

      const timer = setTimeout(() => {
        cleanup();
        resolve({
          isHealthy: false,
          responseTime: Date.now() - startTime,
          error: `Command test timeout after ${this.config.timeout}ms`,
        });
      }, this.config.timeout);

      child.on("exit", (code: number | null) => {
        clearTimeout(timer);
        const responseTime = Date.now() - startTime;

        // Any exit (even error codes) means the command exists and is executable
        resolve({
          isHealthy: true,
          responseTime,
        });
      });

      child.on("error", (error: Error) => {
        clearTimeout(timer);
        const responseTime = Date.now() - startTime;

        if (error.message.includes("ENOENT")) {
          resolve({
            isHealthy: false,
            responseTime,
            error: `Command not found: ${transport.command}`,
          });
        } else {
          resolve({
            isHealthy: false,
            responseTime,
            error: error.message,
          });
        }
      });
    });
  }

  public updateConfig(config: Partial<HealthCheckConfig>): void {
    this.config = { ...this.config, ...config };

    logger.debug({
      message: "health checker config updated",
      config: this.config,
    });
  }

  public getConfig(): HealthCheckConfig {
    return { ...this.config };
  }
}

// Export a default instance
export const defaultHealthChecker = new HealthChecker();
