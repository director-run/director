import { describe, expect, it } from "vitest";
import { ErrorCategorizer, ErrorCategory } from "./error-categorizer";

describe("ErrorCategorizer", () => {
  describe("Network Errors", () => {
    it("should categorize ECONNREFUSED as network error", () => {
      const error = new Error("connect ECONNREFUSED 127.0.0.1:3000");
      const result = ErrorCategorizer.categorize(error);

      expect(result.category).toBe(ErrorCategory.NETWORK);
      expect(result.isRetryable).toBe(true);
      expect(result.suggestedAction).toContain("network connectivity");
    });

    it("should categorize ENOTFOUND as network error", () => {
      const error = new Error("getaddrinfo ENOTFOUND localhost");
      const result = ErrorCategorizer.categorize(error);

      expect(result.category).toBe(ErrorCategory.NETWORK);
      expect(result.isRetryable).toBe(true);
    });

    it("should categorize connection refused as network error", () => {
      const error = new Error("Connection refused by server");
      const result = ErrorCategorizer.categorize(error);

      expect(result.category).toBe(ErrorCategory.NETWORK);
      expect(result.isRetryable).toBe(true);
    });

    it("should categorize network error as network error", () => {
      const error = new Error("Network error occurred");
      const result = ErrorCategorizer.categorize(error);

      expect(result.category).toBe(ErrorCategory.NETWORK);
      expect(result.isRetryable).toBe(true);
    });
  });

  describe("Timeout Errors", () => {
    it("should categorize timeout as timeout error", () => {
      const error = new Error("Request timeout after 5000ms");
      const result = ErrorCategorizer.categorize(error);

      expect(result.category).toBe(ErrorCategory.TIMEOUT);
      expect(result.isRetryable).toBe(true);
      expect(result.suggestedAction).toContain("timeout");
    });

    it("should categorize timed out as timeout error", () => {
      const error = new Error("Operation timed out");
      const result = ErrorCategorizer.categorize(error);

      expect(result.category).toBe(ErrorCategory.TIMEOUT);
      expect(result.isRetryable).toBe(true);
    });

    it("should categorize deadline exceeded as timeout error", () => {
      const error = new Error("Deadline exceeded");
      const result = ErrorCategorizer.categorize(error);

      expect(result.category).toBe(ErrorCategory.TIMEOUT);
      expect(result.isRetryable).toBe(true);
    });
  });

  describe("Authentication Errors", () => {
    it("should categorize 401 as authentication error", () => {
      const error = new Error("HTTP 401 Unauthorized");
      const result = ErrorCategorizer.categorize(error);

      expect(result.category).toBe(ErrorCategory.AUTHENTICATION);
      expect(result.isRetryable).toBe(false);
      expect(result.suggestedAction).toContain("credentials");
    });

    it("should categorize unauthorized as authentication error", () => {
      const error = new Error("Unauthorized access");
      const result = ErrorCategorizer.categorize(error);

      expect(result.category).toBe(ErrorCategory.AUTHENTICATION);
      expect(result.isRetryable).toBe(false);
    });

    it("should categorize authentication failed as authentication error", () => {
      const error = new Error("Authentication failed");
      const result = ErrorCategorizer.categorize(error);

      expect(result.category).toBe(ErrorCategory.AUTHENTICATION);
      expect(result.isRetryable).toBe(false);
    });
  });

  describe("Authorization Errors", () => {
    it("should categorize 403 as authorization error", () => {
      const error = new Error("HTTP 403 Forbidden");
      const result = ErrorCategorizer.categorize(error);

      expect(result.category).toBe(ErrorCategory.AUTHORIZATION);
      expect(result.isRetryable).toBe(false);
      expect(result.suggestedAction).toContain("permissions");
    });

    it("should categorize access denied as authorization error", () => {
      const error = new Error("Access denied");
      const result = ErrorCategorizer.categorize(error);

      expect(result.category).toBe(ErrorCategory.AUTHORIZATION);
      expect(result.isRetryable).toBe(false);
    });

    it("should categorize permission denied as authorization error", () => {
      const error = new Error("Permission denied");
      const result = ErrorCategorizer.categorize(error);

      expect(result.category).toBe(ErrorCategory.AUTHORIZATION);
      expect(result.isRetryable).toBe(false);
    });
  });

  describe("Configuration Errors", () => {
    it("should categorize ENOENT as configuration error", () => {
      const error = new Error("spawn ENOENT");
      const result = ErrorCategorizer.categorize(error);

      expect(result.category).toBe(ErrorCategory.CONFIGURATION);
      expect(result.isRetryable).toBe(false);
      expect(result.suggestedAction).toContain("configuration");
    });

    it("should categorize command not found as configuration error", () => {
      const error = new Error("Command not found: nonexistent");
      const result = ErrorCategorizer.categorize(error);

      expect(result.category).toBe(ErrorCategory.CONFIGURATION);
      expect(result.isRetryable).toBe(false);
    });

    it("should categorize invalid configuration as configuration error", () => {
      const error = new Error("Invalid configuration provided");
      const result = ErrorCategorizer.categorize(error);

      expect(result.category).toBe(ErrorCategory.CONFIGURATION);
      expect(result.isRetryable).toBe(false);
    });
  });

  describe("Resource Not Found Errors", () => {
    it("should categorize 404 as resource not found error", () => {
      const error = new Error("HTTP 404 Not Found");
      const result = ErrorCategorizer.categorize(error);

      expect(result.category).toBe(ErrorCategory.RESOURCE_NOT_FOUND);
      expect(result.isRetryable).toBe(false);
      expect(result.suggestedAction).toContain("resource exists");
    });

    it("should categorize not found as resource not found error", () => {
      const error = new Error("Resource not found");
      const result = ErrorCategorizer.categorize(error);

      expect(result.category).toBe(ErrorCategory.RESOURCE_NOT_FOUND);
      expect(result.isRetryable).toBe(false);
    });

    it("should categorize file not found as resource not found error", () => {
      const error = new Error("File not found");
      const result = ErrorCategorizer.categorize(error);

      expect(result.category).toBe(ErrorCategory.RESOURCE_NOT_FOUND);
      expect(result.isRetryable).toBe(false);
    });
  });

  describe("Rate Limit Errors", () => {
    it("should categorize 429 as rate limit error", () => {
      const error = new Error("HTTP 429 Too Many Requests");
      const result = ErrorCategorizer.categorize(error);

      expect(result.category).toBe(ErrorCategory.RATE_LIMIT);
      expect(result.isRetryable).toBe(true);
      expect(result.suggestedAction).toContain("request rate");
    });

    it("should categorize rate limit as rate limit error", () => {
      const error = new Error("Rate limit exceeded");
      const result = ErrorCategorizer.categorize(error);

      expect(result.category).toBe(ErrorCategory.RATE_LIMIT);
      expect(result.isRetryable).toBe(true);
    });

    it("should categorize too many requests as rate limit error", () => {
      const error = new Error("Too many requests");
      const result = ErrorCategorizer.categorize(error);

      expect(result.category).toBe(ErrorCategory.RATE_LIMIT);
      expect(result.isRetryable).toBe(true);
    });
  });

  describe("Circuit Breaker Errors", () => {
    it("should categorize circuit breaker as circuit breaker error", () => {
      const error = new Error("Circuit breaker is OPEN");
      const result = ErrorCategorizer.categorize(error);

      expect(result.category).toBe(ErrorCategory.CIRCUIT_BREAKER);
      expect(result.isRetryable).toBe(true);
      expect(result.suggestedAction).toContain("circuit breaker");
    });

    it("should categorize circuit is open as circuit breaker error", () => {
      const error = new Error("Circuit is open for service");
      const result = ErrorCategorizer.categorize(error);

      expect(result.category).toBe(ErrorCategory.CIRCUIT_BREAKER);
      expect(result.isRetryable).toBe(true);
    });
  });

  describe("Server Errors", () => {
    it("should categorize 500 as server error", () => {
      const error = new Error("HTTP 500 Internal Server Error");
      const result = ErrorCategorizer.categorize(error);

      expect(result.category).toBe(ErrorCategory.SERVER_ERROR);
      expect(result.isRetryable).toBe(true);
      expect(result.suggestedAction).toContain("server status");
    });

    it("should categorize 503 as server error", () => {
      const error = new Error("HTTP 503 Service Unavailable");
      const result = ErrorCategorizer.categorize(error);

      expect(result.category).toBe(ErrorCategory.SERVER_ERROR);
      expect(result.isRetryable).toBe(true);
    });

    it("should categorize internal server error as server error", () => {
      const error = new Error("Internal server error occurred");
      const result = ErrorCategorizer.categorize(error);

      expect(result.category).toBe(ErrorCategory.SERVER_ERROR);
      expect(result.isRetryable).toBe(true);
    });
  });

  describe("Client Errors", () => {
    it("should categorize 400 as client error", () => {
      const error = new Error("HTTP 400 Bad Request");
      const result = ErrorCategorizer.categorize(error);

      expect(result.category).toBe(ErrorCategory.CLIENT_ERROR);
      expect(result.isRetryable).toBe(false);
      expect(result.suggestedAction).toContain("request format");
    });

    it("should categorize bad request as client error", () => {
      const error = new Error("Bad request format");
      const result = ErrorCategorizer.categorize(error);

      expect(result.category).toBe(ErrorCategory.CLIENT_ERROR);
      expect(result.isRetryable).toBe(false);
    });

    it("should categorize invalid request as client error", () => {
      const error = new Error("Invalid request parameters");
      const result = ErrorCategorizer.categorize(error);

      expect(result.category).toBe(ErrorCategory.CLIENT_ERROR);
      expect(result.isRetryable).toBe(false);
    });
  });

  describe("Unknown Errors", () => {
    it("should categorize unknown errors as unknown", () => {
      const error = new Error("Some random error");
      const result = ErrorCategorizer.categorize(error);

      expect(result.category).toBe(ErrorCategory.UNKNOWN);
      expect(result.isRetryable).toBe(false);
      expect(result.suggestedAction).toContain("error details");
    });
  });

  describe("String Errors", () => {
    it("should handle string errors", () => {
      const result = ErrorCategorizer.categorize("Connection timeout");

      expect(result.category).toBe(ErrorCategory.TIMEOUT);
      expect(result.originalError).toBeInstanceOf(Error);
      expect(result.originalError.message).toBe("Connection timeout");
    });
  });

  describe("Context Metadata", () => {
    it("should include context in metadata", () => {
      const error = new Error("Test error");
      const context = { targetName: "test-server", operation: "connect" };

      const result = ErrorCategorizer.categorize(error, context);

      expect(result.metadata).toEqual({ context });
    });
  });

  describe("Retry Strategies", () => {
    it("should provide retry strategy for network errors", () => {
      const error = new Error("ECONNREFUSED");
      const categorized = ErrorCategorizer.categorize(error);
      const strategy = ErrorCategorizer.getRetryStrategy(categorized);

      expect(strategy.shouldRetry).toBe(true);
      expect(strategy.delayMs).toBe(2000);
      expect(strategy.maxRetries).toBe(5);
    });

    it("should provide retry strategy for timeout errors", () => {
      const error = new Error("Request timeout");
      const categorized = ErrorCategorizer.categorize(error);
      const strategy = ErrorCategorizer.getRetryStrategy(categorized);

      expect(strategy.shouldRetry).toBe(true);
      expect(strategy.delayMs).toBe(5000);
      expect(strategy.maxRetries).toBe(3);
    });

    it("should provide retry strategy for server errors", () => {
      const error = new Error("HTTP 500");
      const categorized = ErrorCategorizer.categorize(error);
      const strategy = ErrorCategorizer.getRetryStrategy(categorized);

      expect(strategy.shouldRetry).toBe(true);
      expect(strategy.delayMs).toBe(3000);
      expect(strategy.maxRetries).toBe(4);
    });

    it("should provide retry strategy for rate limit errors", () => {
      const error = new Error("Rate limit exceeded");
      const categorized = ErrorCategorizer.categorize(error);
      const strategy = ErrorCategorizer.getRetryStrategy(categorized);

      expect(strategy.shouldRetry).toBe(true);
      expect(strategy.delayMs).toBe(10000);
      expect(strategy.maxRetries).toBe(2);
    });

    it("should provide retry strategy for circuit breaker errors", () => {
      const error = new Error("Circuit breaker is OPEN");
      const categorized = ErrorCategorizer.categorize(error);
      const strategy = ErrorCategorizer.getRetryStrategy(categorized);

      expect(strategy.shouldRetry).toBe(true);
      expect(strategy.delayMs).toBe(30000);
      expect(strategy.maxRetries).toBe(1);
    });

    it("should not retry non-retryable errors", () => {
      const error = new Error("HTTP 401 Unauthorized");
      const categorized = ErrorCategorizer.categorize(error);
      const strategy = ErrorCategorizer.getRetryStrategy(categorized);

      expect(strategy.shouldRetry).toBe(false);
      expect(strategy.delayMs).toBe(0);
      expect(strategy.maxRetries).toBe(0);
    });
  });
});
