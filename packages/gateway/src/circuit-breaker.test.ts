import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CircuitBreaker,
  CircuitBreakerRegistry,
  CircuitBreakerState,
} from "./circuit-breaker";

describe("CircuitBreaker", () => {
  let circuitBreaker: CircuitBreaker;
  let mockOperation: () => Promise<string>;

  beforeEach(() => {
    circuitBreaker = new CircuitBreaker("test-breaker", {
      failureThreshold: 3,
      recoveryTimeout: 100, // Fast for testing
      successThreshold: 2,
      timeout: 50,
    });
    mockOperation = vi.fn().mockResolvedValue("success");
  });

  describe("Initial State", () => {
    it("should start in closed state", () => {
      expect(circuitBreaker.getState()).toBe(CircuitBreakerState.CLOSED);
    });

    it("should have correct initial stats", () => {
      const stats = circuitBreaker.getStats();
      expect(stats).toMatchObject({
        state: CircuitBreakerState.CLOSED,
        failureCount: 0,
        successCount: 0,
        lastFailureTime: undefined,
      });
    });
  });

  describe("Successful Operations", () => {
    it("should execute operation successfully", async () => {
      const result = await circuitBreaker.execute(mockOperation);

      expect(result).toBe("success");
      expect(mockOperation).toHaveBeenCalledTimes(1);
      expect(circuitBreaker.getState()).toBe(CircuitBreakerState.CLOSED);
    });

    it("should reset failure count on success", async () => {
      // Cause some failures first
      const failingOperation = vi.fn().mockRejectedValue(new Error("failure"));

      try {
        await circuitBreaker.execute(failingOperation);
      } catch {}
      try {
        await circuitBreaker.execute(failingOperation);
      } catch {}

      expect(circuitBreaker.getStats().failureCount).toBe(2);

      // Now succeed
      await circuitBreaker.execute(mockOperation);

      expect(circuitBreaker.getStats().failureCount).toBe(0);
    });
  });

  describe("Failed Operations", () => {
    it("should track failures", async () => {
      const failingOperation = vi.fn().mockRejectedValue(new Error("failure"));

      try {
        await circuitBreaker.execute(failingOperation);
      } catch {}

      const stats = circuitBreaker.getStats();
      expect(stats.failureCount).toBe(1);
      expect(stats.lastFailureTime).toBeInstanceOf(Date);
      expect(circuitBreaker.getState()).toBe(CircuitBreakerState.CLOSED);
    });

    it("should open circuit after failure threshold", async () => {
      const failingOperation = vi.fn().mockRejectedValue(new Error("failure"));

      // Cause failures up to threshold
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(failingOperation);
        } catch {}
      }

      expect(circuitBreaker.getState()).toBe(CircuitBreakerState.OPEN);
      expect(circuitBreaker.getStats().failureCount).toBe(3);
    });

    it("should fail fast when circuit is open", async () => {
      const failingOperation = vi.fn().mockRejectedValue(new Error("failure"));

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(failingOperation);
        } catch {}
      }

      // Now try to execute - should fail fast
      await expect(circuitBreaker.execute(mockOperation)).rejects.toThrow(
        "Circuit breaker is OPEN",
      );
      expect(mockOperation).not.toHaveBeenCalled();
    });
  });

  describe("Half-Open State", () => {
    it("should transition to half-open after recovery timeout", async () => {
      const failingOperation = vi.fn().mockRejectedValue(new Error("failure"));

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(failingOperation);
        } catch {}
      }

      expect(circuitBreaker.getState()).toBe(CircuitBreakerState.OPEN);

      // Wait for recovery timeout
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Next execution should transition to half-open, then close after success
      await circuitBreaker.execute(mockOperation);

      // After one success in half-open, it should still be half-open (needs 2 successes)
      expect(circuitBreaker.getState()).toBe(CircuitBreakerState.HALF_OPEN);
    });

    it("should close circuit after success threshold in half-open", async () => {
      const failingOperation = vi.fn().mockRejectedValue(new Error("failure"));

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(failingOperation);
        } catch {}
      }

      // Wait for recovery timeout
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Execute successful operations
      await circuitBreaker.execute(mockOperation); // First success
      expect(circuitBreaker.getState()).toBe(CircuitBreakerState.HALF_OPEN);

      await circuitBreaker.execute(mockOperation); // Second success - should close
      expect(circuitBreaker.getState()).toBe(CircuitBreakerState.CLOSED);
    });

    it("should reopen circuit on failure in half-open state", async () => {
      const failingOperation = vi.fn().mockRejectedValue(new Error("failure"));

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(failingOperation);
        } catch {}
      }

      // Wait for recovery timeout
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Try to execute and fail - should reopen
      try {
        await circuitBreaker.execute(failingOperation);
      } catch {}

      expect(circuitBreaker.getState()).toBe(CircuitBreakerState.OPEN);
    });
  });

  describe("Timeout Handling", () => {
    it("should timeout long-running operations", async () => {
      const slowOperation = () =>
        new Promise((resolve) => setTimeout(resolve, 200));

      await expect(circuitBreaker.execute(slowOperation)).rejects.toThrow(
        "timeout after 50ms",
      );
    });

    it("should count timeouts as failures", async () => {
      const slowOperation = () =>
        new Promise((resolve) => setTimeout(resolve, 200));

      try {
        await circuitBreaker.execute(slowOperation);
      } catch {}

      expect(circuitBreaker.getStats().failureCount).toBe(1);
    });
  });

  describe("Manual Control", () => {
    it("should reset circuit breaker", async () => {
      const failingOperation = vi.fn().mockRejectedValue(new Error("failure"));

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(failingOperation);
        } catch {}
      }

      expect(circuitBreaker.getState()).toBe(CircuitBreakerState.OPEN);

      circuitBreaker.reset();

      expect(circuitBreaker.getState()).toBe(CircuitBreakerState.CLOSED);
      expect(circuitBreaker.getStats().failureCount).toBe(0);
    });

    it("should update configuration", () => {
      circuitBreaker.updateConfig({ failureThreshold: 5 });

      expect(circuitBreaker.getStats().config.failureThreshold).toBe(5);
    });
  });
});

describe("CircuitBreakerRegistry", () => {
  let registry: CircuitBreakerRegistry;

  beforeEach(() => {
    registry = new CircuitBreakerRegistry();
  });

  describe("Breaker Management", () => {
    it("should create new circuit breaker", () => {
      const breaker = registry.getOrCreate("test-breaker");

      expect(breaker).toBeInstanceOf(CircuitBreaker);
      expect(breaker.getStats().config).toBeDefined();
    });

    it("should return existing circuit breaker", () => {
      const breaker1 = registry.getOrCreate("test-breaker");
      const breaker2 = registry.getOrCreate("test-breaker");

      expect(breaker1).toBe(breaker2);
    });

    it("should create breaker with custom config", () => {
      const breaker = registry.getOrCreate("test-breaker", {
        failureThreshold: 10,
      });

      expect(breaker.getStats().config.failureThreshold).toBe(10);
    });

    it("should get existing breaker", () => {
      const created = registry.getOrCreate("test-breaker");
      const retrieved = registry.get("test-breaker");

      expect(retrieved).toBe(created);
    });

    it("should return undefined for non-existent breaker", () => {
      const breaker = registry.get("non-existent");

      expect(breaker).toBeUndefined();
    });

    it("should remove circuit breaker", () => {
      registry.getOrCreate("test-breaker");

      const removed = registry.remove("test-breaker");
      expect(removed).toBe(true);

      const retrieved = registry.get("test-breaker");
      expect(retrieved).toBeUndefined();
    });

    it("should return false when removing non-existent breaker", () => {
      const removed = registry.remove("non-existent");
      expect(removed).toBe(false);
    });
  });

  describe("Bulk Operations", () => {
    it("should get all circuit breakers", () => {
      registry.getOrCreate("breaker1");
      registry.getOrCreate("breaker2");

      const all = registry.getAll();

      expect(all.size).toBe(2);
      expect(all.has("breaker1")).toBe(true);
      expect(all.has("breaker2")).toBe(true);
    });

    it("should reset specific circuit breaker", async () => {
      const breaker = registry.getOrCreate("test-breaker");

      // Cause a failure
      try {
        await breaker.execute(() => Promise.reject(new Error("failure")));
      } catch {}

      expect(breaker.getStats().failureCount).toBe(1);

      const reset = registry.reset("test-breaker");
      expect(reset).toBe(true);
      expect(breaker.getStats().failureCount).toBe(0);
    });

    it("should return false when resetting non-existent breaker", () => {
      const reset = registry.reset("non-existent");
      expect(reset).toBe(false);
    });

    it("should reset all circuit breakers", async () => {
      const breaker1 = registry.getOrCreate("breaker1");
      const breaker2 = registry.getOrCreate("breaker2");

      // Cause failures
      try {
        await breaker1.execute(() => Promise.reject(new Error("failure")));
      } catch {}
      try {
        await breaker2.execute(() => Promise.reject(new Error("failure")));
      } catch {}

      expect(breaker1.getStats().failureCount).toBe(1);
      expect(breaker2.getStats().failureCount).toBe(1);

      registry.resetAll();

      expect(breaker1.getStats().failureCount).toBe(0);
      expect(breaker2.getStats().failureCount).toBe(0);
    });

    it("should get statistics for all breakers", () => {
      registry.getOrCreate("breaker1");
      registry.getOrCreate("breaker2");

      const stats = registry.getStats();

      expect(stats).toHaveProperty("breaker1");
      expect(stats).toHaveProperty("breaker2");
      expect(stats.breaker1).toMatchObject({
        state: CircuitBreakerState.CLOSED,
        failureCount: 0,
      });
    });
  });
});
