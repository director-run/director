import { getLogger } from "@director.run/utilities/logger";

const logger = getLogger("CircuitBreaker");

export enum CircuitBreakerState {
  CLOSED = "closed", // Normal operation
  OPEN = "open", // Circuit is open, failing fast
  HALF_OPEN = "half_open", // Testing if service has recovered
}

export interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures before opening circuit
  recoveryTimeout: number; // Time to wait before trying half-open (ms)
  successThreshold: number; // Number of successes needed to close circuit from half-open
  timeout: number; // Request timeout (ms)
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  recoveryTimeout: 60000, // 1 minute
  successThreshold: 3,
  timeout: 10000, // 10 seconds
};

export class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime?: Date;
  private config: CircuitBreakerConfig;
  private name: string;

  constructor(name: string, config: Partial<CircuitBreakerConfig> = {}) {
    this.name = name;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  public async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitBreakerState.HALF_OPEN;
        this.successCount = 0;
        logger.info({
          message: "circuit breaker transitioning to half-open",
          name: this.name,
        });
      } else {
        throw new Error(`Circuit breaker is OPEN for ${this.name}`);
      }
    }

    try {
      const result = await this.executeWithTimeout(operation);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private async executeWithTimeout<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Operation timeout after ${this.config.timeout}ms`));
      }, this.config.timeout);

      operation()
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.successCount++;

      if (this.successCount >= this.config.successThreshold) {
        this.state = CircuitBreakerState.CLOSED;
        this.successCount = 0;
        logger.info({
          message: "circuit breaker closed after successful recovery",
          name: this.name,
        });
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = new Date();

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.state = CircuitBreakerState.OPEN;
      logger.warn({
        message: "circuit breaker opened from half-open after failure",
        name: this.name,
      });
    } else if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitBreakerState.OPEN;
      logger.warn({
        message: "circuit breaker opened due to failure threshold",
        name: this.name,
        failureCount: this.failureCount,
        threshold: this.config.failureThreshold,
      });
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) {
      return true;
    }

    const timeSinceLastFailure = Date.now() - this.lastFailureTime.getTime();
    return timeSinceLastFailure >= this.config.recoveryTimeout;
  }

  public getState(): CircuitBreakerState {
    return this.state;
  }

  public getStats() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      config: this.config,
    };
  }

  public reset(): void {
    this.state = CircuitBreakerState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = undefined;

    logger.info({
      message: "circuit breaker manually reset",
      name: this.name,
    });
  }

  public updateConfig(config: Partial<CircuitBreakerConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info({
      message: "circuit breaker config updated",
      name: this.name,
      config: this.config,
    });
  }
}

export class CircuitBreakerRegistry {
  private breakers: Map<string, CircuitBreaker> = new Map();

  public getOrCreate(
    name: string,
    config?: Partial<CircuitBreakerConfig>,
  ): CircuitBreaker {
    let breaker = this.breakers.get(name);

    if (!breaker) {
      breaker = new CircuitBreaker(name, config);
      this.breakers.set(name, breaker);

      logger.debug({
        message: "created new circuit breaker",
        name,
        config: breaker.getStats().config,
      });
    }

    return breaker;
  }

  public get(name: string): CircuitBreaker | undefined {
    return this.breakers.get(name);
  }

  public getAll(): Map<string, CircuitBreaker> {
    return new Map(this.breakers);
  }

  public remove(name: string): boolean {
    const removed = this.breakers.delete(name);

    if (removed) {
      logger.debug({
        message: "removed circuit breaker",
        name,
      });
    }

    return removed;
  }

  public reset(name: string): boolean {
    const breaker = this.breakers.get(name);

    if (breaker) {
      breaker.reset();
      return true;
    }

    return false;
  }

  public resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }

    logger.info({
      message: "reset all circuit breakers",
      count: this.breakers.size,
    });
  }

  public getStats() {
    const stats: Record<string, unknown> = {};

    for (const [name, breaker] of this.breakers) {
      stats[name] = breaker.getStats();
    }

    return stats;
  }
}

// Export a default registry instance
export const defaultCircuitBreakerRegistry = new CircuitBreakerRegistry();
