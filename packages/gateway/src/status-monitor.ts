import { EventEmitter } from "events";
import { getLogger } from "@director.run/utilities/logger";
import type { ProxyServerStore } from "./proxy-server-store";

// Interface for target objects used in status monitoring
interface HealthCheckTarget {
  name: string;
  status: string;
  lastError?: string;
  enhancedHealthCheck?(): Promise<{ isHealthy: boolean; error?: string }>;
  healthCheck?(): Promise<boolean>;
  getStatusInfo(): {
    status?: string;
    lastError?: string | null;
    lastErrorAt?: Date | null;
    connectedAt?: Date | null;
    lastAttemptAt?: Date | null;
    errorCategory?: string | null;
    isRetryable?: boolean | null;
    suggestedAction?: string | null;
    circuitBreakerState?: string | null;
  };
}

const logger = getLogger("StatusMonitor");

export interface StatusChangeEvent {
  proxyId: string;
  serverName: string;
  previousStatus: string;
  currentStatus: string;
  timestamp: Date;
  error?: string;
}

export interface StatusMonitorConfig {
  healthCheckInterval: number; // milliseconds
  retryInterval: number; // milliseconds
  maxRetries: number;
  enabled: boolean;
}

const DEFAULT_CONFIG: StatusMonitorConfig = {
  healthCheckInterval: 5000, // 5 seconds
  retryInterval: 3000, // 3 seconds
  maxRetries: 10,
  enabled: true,
};

export class StatusMonitor extends EventEmitter {
  private proxyStore: ProxyServerStore;
  private config: StatusMonitorConfig;
  private intervalId?: NodeJS.Timeout;
  private retryTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private retryCount: Map<string, number> = new Map();
  private isRunning: boolean = false;

  constructor(
    proxyStore: ProxyServerStore,
    config: Partial<StatusMonitorConfig> = {},
  ) {
    super();
    this.proxyStore = proxyStore;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  public start(): void {
    if (this.isRunning || !this.config.enabled) {
      return;
    }

    logger.info({
      message: "starting status monitor",
      config: this.config,
    });

    this.isRunning = true;
    this.scheduleHealthChecks();
  }

  public stop(): void {
    if (!this.isRunning) {
      return;
    }

    logger.info({ message: "stopping status monitor" });

    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    // Clear all retry timeouts
    for (const timeout of this.retryTimeouts.values()) {
      clearTimeout(timeout);
    }
    this.retryTimeouts.clear();
    this.retryCount.clear();
  }

  public updateConfig(config: Partial<StatusMonitorConfig>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...config };

    logger.info({
      message: "status monitor config updated",
      oldConfig,
      newConfig: this.config,
    });

    // Restart if interval changed and monitor is running
    if (
      this.isRunning &&
      oldConfig.healthCheckInterval !== this.config.healthCheckInterval
    ) {
      this.stop();
      this.start();
    }
  }

  private scheduleHealthChecks(): void {
    this.intervalId = setInterval(() => {
      this.performHealthChecks().catch((error) => {
        logger.error({
          message: "error during scheduled health checks",
          error,
        });
      });
    }, this.config.healthCheckInterval);

    // Run initial health check
    this.performHealthChecks().catch((error) => {
      logger.error({
        message: "error during initial health checks",
        error,
      });
    });
  }

  private async performHealthChecks(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      const proxies = await this.proxyStore.getAll();

      for (const proxy of proxies) {
        const targets = proxy.getAllTargets();

        for (const target of targets) {
          await this.checkTargetHealth(proxy.id, target);
        }
      }
    } catch (error) {
      logger.error({
        message: "error getting proxies for health check",
        error,
      });
    }
  }

  private async checkTargetHealth(
    proxyId: string,
    target: HealthCheckTarget,
  ): Promise<void> {
    const targetKey = `${proxyId}:${target.name}`;
    const previousStatus = target.status;

    try {
      // Use enhanced health check if available, fallback to basic health check
      let healthResult;
      if (typeof target.enhancedHealthCheck === "function") {
        healthResult = await target.enhancedHealthCheck();
      } else if (typeof target.healthCheck === "function") {
        const isHealthy = await target.healthCheck();
        healthResult = { isHealthy };
      } else {
        // No health check method available, assume unhealthy
        healthResult = {
          isHealthy: false,
          error: "No health check method available",
        };
      }

      if (!healthResult.isHealthy && target.status !== "disabled") {
        // Health check failed, schedule retry if not at max retries
        this.scheduleRetry(proxyId, target);
      } else if (healthResult.isHealthy && this.retryCount.has(targetKey)) {
        // Health check succeeded, clear retry count
        this.retryCount.delete(targetKey);
        const retryTimeout = this.retryTimeouts.get(targetKey);
        if (retryTimeout) {
          clearTimeout(retryTimeout);
          this.retryTimeouts.delete(targetKey);
        }
      }

      // Emit status change event if status changed
      if (previousStatus !== target.status) {
        this.emitStatusChange(proxyId, target, previousStatus);

        // Persist status change to database
        await this.proxyStore.updateServerStatus(
          proxyId,
          target.name,
          target.getStatusInfo(),
        );
      }
    } catch (error) {
      logger.error({
        message: "error during health check",
        proxyId,
        targetName: target.name,
        error,
      });
    }
  }

  private scheduleRetry(proxyId: string, target: HealthCheckTarget): void {
    const targetKey = `${proxyId}:${target.name}`;
    const currentRetries = this.retryCount.get(targetKey) || 0;

    if (currentRetries >= this.config.maxRetries) {
      logger.warn({
        message: "max retries reached for target",
        proxyId,
        targetName: target.name,
        retries: currentRetries,
      });
      return;
    }

    // Clear existing retry timeout if any
    const existingTimeout = this.retryTimeouts.get(targetKey);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Schedule retry with exponential backoff
    const retryDelay = this.config.retryInterval * Math.pow(2, currentRetries);
    const timeout = setTimeout(async () => {
      this.retryCount.set(targetKey, currentRetries + 1);
      await this.checkTargetHealth(proxyId, target);
    }, retryDelay);

    this.retryTimeouts.set(targetKey, timeout);

    logger.debug({
      message: "scheduled retry for target",
      proxyId,
      targetName: target.name,
      retryCount: currentRetries + 1,
      retryDelay,
    });
  }

  private emitStatusChange(
    proxyId: string,
    target: HealthCheckTarget,
    previousStatus: string,
  ): void {
    const event: StatusChangeEvent = {
      proxyId,
      serverName: target.name,
      previousStatus,
      currentStatus: target.status,
      timestamp: new Date(),
      error: target.lastError,
    };

    logger.info({
      message: "status change detected",
      proxyId: event.proxyId,
      serverName: event.serverName,
      previousStatus: event.previousStatus,
      currentStatus: event.currentStatus,
      timestamp: event.timestamp,
      error: event.error,
    });

    this.emit("statusChange", event);
  }

  public async refreshAllStatuses(): Promise<void> {
    logger.info({ message: "manually refreshing all statuses" });
    await this.performHealthChecks();
  }

  public async refreshProxyStatuses(proxyId: string): Promise<void> {
    logger.info({
      message: "manually refreshing proxy statuses",
      proxyId,
    });

    try {
      const proxy = this.proxyStore.get(proxyId);
      const targets = proxy.getAllTargets();

      for (const target of targets) {
        await this.checkTargetHealth(proxyId, target);
      }
    } catch (error) {
      logger.error({
        message: "error refreshing proxy statuses",
        proxyId,
        error,
      });
      throw error;
    }
  }

  public getStats() {
    return {
      isRunning: this.isRunning,
      config: this.config,
      activeRetries: this.retryCount.size,
      scheduledRetries: this.retryTimeouts.size,
    };
  }
}
