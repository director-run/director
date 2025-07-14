import { getLogger } from "./logger";

const logger = getLogger("ErrorCategorizer");

export enum ErrorCategory {
  NETWORK = "network",
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  TIMEOUT = "timeout",
  SERVER_ERROR = "server_error",
  CLIENT_ERROR = "client_error",
  CONFIGURATION = "configuration",
  RESOURCE_NOT_FOUND = "resource_not_found",
  RATE_LIMIT = "rate_limit",
  CIRCUIT_BREAKER = "circuit_breaker",
  UNKNOWN = "unknown",
}

export interface CategorizedError {
  category: ErrorCategory;
  originalError: Error;
  message: string;
  isRetryable: boolean;
  suggestedAction?: string;
  metadata?: Record<string, unknown>;
}

export class ErrorCategorizer {
  public static categorize(
    error: Error | string,
    context?: Record<string, unknown>,
  ): CategorizedError {
    const errorMessage = typeof error === "string" ? error : error.message;
    const originalError = typeof error === "string" ? new Error(error) : error;

    // Network-related errors
    if (this.isNetworkError(errorMessage)) {
      return {
        category: ErrorCategory.NETWORK,
        originalError,
        message: errorMessage,
        isRetryable: true,
        suggestedAction: "Check network connectivity and server availability",
        metadata: { context },
      };
    }

    // Timeout errors
    if (this.isTimeoutError(errorMessage)) {
      return {
        category: ErrorCategory.TIMEOUT,
        originalError,
        message: errorMessage,
        isRetryable: true,
        suggestedAction: "Increase timeout or check server performance",
        metadata: { context },
      };
    }

    // Authentication errors
    if (this.isAuthenticationError(errorMessage)) {
      return {
        category: ErrorCategory.AUTHENTICATION,
        originalError,
        message: errorMessage,
        isRetryable: false,
        suggestedAction: "Check credentials and authentication configuration",
        metadata: { context },
      };
    }

    // Authorization errors
    if (this.isAuthorizationError(errorMessage)) {
      return {
        category: ErrorCategory.AUTHORIZATION,
        originalError,
        message: errorMessage,
        isRetryable: false,
        suggestedAction: "Check permissions and access rights",
        metadata: { context },
      };
    }

    // Configuration errors
    if (this.isConfigurationError(errorMessage)) {
      return {
        category: ErrorCategory.CONFIGURATION,
        originalError,
        message: errorMessage,
        isRetryable: false,
        suggestedAction: "Check configuration settings and parameters",
        metadata: { context },
      };
    }

    // Resource not found errors
    if (this.isResourceNotFoundError(errorMessage)) {
      return {
        category: ErrorCategory.RESOURCE_NOT_FOUND,
        originalError,
        message: errorMessage,
        isRetryable: false,
        suggestedAction: "Verify resource exists and path is correct",
        metadata: { context },
      };
    }

    // Rate limit errors
    if (this.isRateLimitError(errorMessage)) {
      return {
        category: ErrorCategory.RATE_LIMIT,
        originalError,
        message: errorMessage,
        isRetryable: true,
        suggestedAction: "Reduce request rate or implement backoff strategy",
        metadata: { context },
      };
    }

    // Circuit breaker errors
    if (this.isCircuitBreakerError(errorMessage)) {
      return {
        category: ErrorCategory.CIRCUIT_BREAKER,
        originalError,
        message: errorMessage,
        isRetryable: true,
        suggestedAction:
          "Wait for circuit breaker to reset or check underlying service",
        metadata: { context },
      };
    }

    // Server errors (5xx)
    if (this.isServerError(errorMessage)) {
      return {
        category: ErrorCategory.SERVER_ERROR,
        originalError,
        message: errorMessage,
        isRetryable: true,
        suggestedAction: "Check server status and logs",
        metadata: { context },
      };
    }

    // Client errors (4xx)
    if (this.isClientError(errorMessage)) {
      return {
        category: ErrorCategory.CLIENT_ERROR,
        originalError,
        message: errorMessage,
        isRetryable: false,
        suggestedAction: "Check request format and parameters",
        metadata: { context },
      };
    }

    // Default to unknown
    return {
      category: ErrorCategory.UNKNOWN,
      originalError,
      message: errorMessage,
      isRetryable: false,
      suggestedAction: "Review error details and logs for more information",
      metadata: { context },
    };
  }

  private static isNetworkError(message: string): boolean {
    const networkPatterns = [
      /ECONNREFUSED/i,
      /ENOTFOUND/i,
      /ECONNRESET/i,
      /ETIMEDOUT/i,
      /EHOSTUNREACH/i,
      /ENETUNREACH/i,
      /connection refused/i,
      /network error/i,
      /dns resolution failed/i,
      /failed to connect/i,
    ];
    return networkPatterns.some((pattern) => pattern.test(message));
  }

  private static isTimeoutError(message: string): boolean {
    const timeoutPatterns = [
      /timeout/i,
      /timed out/i,
      /request timeout/i,
      /operation timeout/i,
      /deadline exceeded/i,
    ];
    return timeoutPatterns.some((pattern) => pattern.test(message));
  }

  private static isAuthenticationError(message: string): boolean {
    const authPatterns = [
      /unauthorized/i,
      /authentication failed/i,
      /invalid credentials/i,
      /login failed/i,
      /401/,
      /unauthenticated/i,
    ];
    return authPatterns.some((pattern) => pattern.test(message));
  }

  private static isAuthorizationError(message: string): boolean {
    const authzPatterns = [
      /forbidden/i,
      /access denied/i,
      /permission denied/i,
      /403/,
      /insufficient privileges/i,
      /not authorized/i,
    ];
    return authzPatterns.some((pattern) => pattern.test(message));
  }

  private static isConfigurationError(message: string): boolean {
    const configPatterns = [
      /configuration error/i,
      /invalid configuration/i,
      /missing configuration/i,
      /command not found/i,
      /ENOENT/i,
      /invalid parameter/i,
      /malformed/i,
    ];
    return configPatterns.some((pattern) => pattern.test(message));
  }

  private static isResourceNotFoundError(message: string): boolean {
    const notFoundPatterns = [
      /not found/i,
      /404/,
      /resource not found/i,
      /file not found/i,
      /path not found/i,
      /endpoint not found/i,
    ];
    return notFoundPatterns.some((pattern) => pattern.test(message));
  }

  private static isRateLimitError(message: string): boolean {
    const rateLimitPatterns = [
      /rate limit/i,
      /too many requests/i,
      /429/,
      /quota exceeded/i,
      /throttled/i,
    ];
    return rateLimitPatterns.some((pattern) => pattern.test(message));
  }

  private static isCircuitBreakerError(message: string): boolean {
    const circuitBreakerPatterns = [
      /circuit breaker/i,
      /circuit is open/i,
      /breaker open/i,
    ];
    return circuitBreakerPatterns.some((pattern) => pattern.test(message));
  }

  private static isServerError(message: string): boolean {
    const serverErrorPatterns = [
      /5\d{2}/,
      /internal server error/i,
      /service unavailable/i,
      /bad gateway/i,
      /gateway timeout/i,
      /server error/i,
    ];
    return serverErrorPatterns.some((pattern) => pattern.test(message));
  }

  private static isClientError(message: string): boolean {
    const clientErrorPatterns = [
      /4\d{2}/,
      /bad request/i,
      /invalid request/i,
      /malformed request/i,
      /client error/i,
    ];
    return clientErrorPatterns.some((pattern) => pattern.test(message));
  }

  public static getRetryStrategy(categorizedError: CategorizedError): {
    shouldRetry: boolean;
    delayMs: number;
    maxRetries: number;
  } {
    const { category, isRetryable } = categorizedError;

    if (!isRetryable) {
      return { shouldRetry: false, delayMs: 0, maxRetries: 0 };
    }

    switch (category) {
      case ErrorCategory.NETWORK:
        return { shouldRetry: true, delayMs: 2000, maxRetries: 5 };

      case ErrorCategory.TIMEOUT:
        return { shouldRetry: true, delayMs: 5000, maxRetries: 3 };

      case ErrorCategory.SERVER_ERROR:
        return { shouldRetry: true, delayMs: 3000, maxRetries: 4 };

      case ErrorCategory.RATE_LIMIT:
        return { shouldRetry: true, delayMs: 10000, maxRetries: 2 };

      case ErrorCategory.CIRCUIT_BREAKER:
        return { shouldRetry: true, delayMs: 30000, maxRetries: 1 };

      default:
        return { shouldRetry: false, delayMs: 0, maxRetries: 0 };
    }
  }
}
