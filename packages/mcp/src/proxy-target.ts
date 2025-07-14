import { ErrorCategorizer } from "@director.run/utilities/error-categorizer";
import { getLogger } from "@director.run/utilities/logger";
import type {
  ProxyTargetAttributes,
  ProxyTargetStatus,
  ProxyTransport,
} from "@director.run/utilities/schema";
import { defaultHealthChecker } from "./health-checker";
import { SimpleClient } from "./simple-client";

// Circuit breaker interface to avoid circular dependencies
interface CircuitBreaker {
  getState(): string;
  execute<T>(operation: () => Promise<T>): Promise<T>;
}

const logger = getLogger(`mcp/proxy-target`);

export type ProxyTargetTransport = ProxyTransport;

export class ProxyTarget extends SimpleClient {
  public readonly attributes: ProxyTargetAttributes;
  private _status: ProxyTargetStatus = "disconnected";
  private _lastError?: string;
  private _lastErrorAt?: Date;
  private _connectedAt?: Date;
  private _lastAttemptAt?: Date;
  private _circuitBreaker?: CircuitBreaker; // Will be injected from gateway layer

  constructor(
    attributes: ProxyTargetAttributes,
    circuitBreaker?: CircuitBreaker,
  ) {
    super(attributes.name.toLocaleLowerCase());
    this.attributes = attributes;
    this._circuitBreaker = circuitBreaker;
  }

  public get status(): ProxyTargetStatus {
    return this._status;
  }

  public get lastError(): string | undefined {
    return this._lastError;
  }

  public get lastErrorAt(): Date | undefined {
    return this._lastErrorAt;
  }

  public get connectedAt(): Date | undefined {
    return this._connectedAt;
  }

  public get lastAttemptAt(): Date | undefined {
    return this._lastAttemptAt;
  }

  public setStatus(status: ProxyTargetStatus, error?: string): void {
    const previousStatus = this._status;
    this._status = status;

    if (error) {
      this._lastError = error;
      this._lastErrorAt = new Date();
    }

    if (status === "running") {
      this._connectedAt = new Date();
      this._lastError = undefined;
      this._lastErrorAt = undefined;
    }

    if (status === "starting") {
      this._lastAttemptAt = new Date();
    }

    logger.debug({
      message: `status changed from ${previousStatus} to ${status}`,
      targetName: this.name,
      error,
    });
  }

  public getStatusInfo() {
    let errorCategory = null;
    let isRetryable = null;
    let suggestedAction = null;

    if (this._lastError) {
      const categorizedError = ErrorCategorizer.categorize(this._lastError, {
        targetName: this.name,
        transport: this.attributes.transport.type,
      });
      errorCategory = categorizedError.category;
      isRetryable = categorizedError.isRetryable;
      suggestedAction = categorizedError.suggestedAction;
    }

    return {
      status: this._status,
      lastError: this._lastError || null,
      lastErrorAt: this._lastErrorAt || null,
      connectedAt: this._connectedAt || null,
      lastAttemptAt: this._lastAttemptAt || null,
      errorCategory,
      isRetryable,
      suggestedAction,
      circuitBreakerState: this._circuitBreaker?.getState() || null,
    };
  }

  public async smartConnect({ throwOnError } = { throwOnError: false }) {
    const { name, transport } = this.attributes;

    // Skip if disabled
    if (this._status === "disabled") {
      logger.debug({
        message: `skipping connection to disabled target ${name}`,
      });
      return;
    }

    this.setStatus("starting");

    const connectOperation = async () => {
      logger.info({
        message: `connecting to target ${name}`,
        transport,
      });

      if (transport.type === "http") {
        await this.connectToHTTP(transport.url, transport.headers);
      } else {
        await this.connectToStdio(transport.command, transport.args ?? [], {
          ...(process.env as Record<string, string>),
          ...(transport?.env || {}),
        });
      }
    };

    try {
      // Use circuit breaker if available
      if (this._circuitBreaker) {
        await this._circuitBreaker.execute(connectOperation);
      } else {
        await connectOperation();
      }

      this.setStatus("running");
      logger.info({
        message: `successfully connected to target ${name}`,
      });
    } catch (error) {
      const originalError =
        error instanceof Error ? error : new Error(String(error));
      const categorizedError = ErrorCategorizer.categorize(originalError, {
        targetName: name,
        transport: transport.type,
        operation: "connect",
      });

      // Set status with categorized error information
      const errorMessage = `[${categorizedError.category}] ${categorizedError.message}`;
      this.setStatus("failed", errorMessage);

      logger.error({
        message: `failed to connect to target ${name}`,
        error: originalError,
        category: categorizedError.category,
        isRetryable: categorizedError.isRetryable,
        suggestedAction: categorizedError.suggestedAction,
      });

      if (throwOnError) {
        throw originalError;
      }
    }
  }

  public enable(): void {
    if (this._status === "disabled") {
      this.setStatus("disconnected");
      logger.info({
        message: `enabled target ${this.name}`,
      });
    }
  }

  public disable(): void {
    this.setStatus("disabled");
    logger.info({
      message: `disabled target ${this.name}`,
    });
  }

  public async restart(
    { throwOnError } = { throwOnError: false },
  ): Promise<void> {
    logger.info({
      message: `restarting target ${this.name}`,
    });

    try {
      await this.close();
    } catch (error) {
      logger.warn({
        message: `error closing connection during restart`,
        targetName: this.name,
        error,
      });
    }

    this.setStatus("disconnected");
    await this.smartConnect({ throwOnError });
  }

  public async close(): Promise<void> {
    if (this._status !== "disabled") {
      this.setStatus("disconnected");
    }

    logger.info({
      message: `closing connection to target ${this.name}`,
    });

    await super.close();
  }

  public async enhancedHealthCheck(): Promise<{
    isHealthy: boolean;
    responseTime?: number;
    error?: string;
  }> {
    // If disabled, always return unhealthy
    if (this._status === "disabled") {
      return {
        isHealthy: false,
        error: "Server is disabled",
      };
    }

    try {
      // Use the dedicated health checker for transport-specific checks
      const result = await defaultHealthChecker.checkHealth(
        this.attributes.transport,
        this.name,
      );

      // Update status based on health check result
      if (!result.isHealthy && this._status === "running") {
        this.setStatus("failed", result.error);
      } else if (result.isHealthy && this._status === "failed") {
        this.setStatus("running");
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.setStatus("failed", errorMessage);

      return {
        isHealthy: false,
        error: errorMessage,
      };
    }
  }
}
