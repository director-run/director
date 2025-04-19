import { describe, it, expect } from "vitest";

import { sleep } from "@/sleep";

describe("sleep", () => {
  it("should resolve after the specified time", async () => {
    const ms = 1000;
    const start = Date.now();
    await sleep(ms);
    const end = Date.now();
    expect(end - start).toBeGreaterThanOrEqual(ms);
  });

  it("should handle zero milliseconds", async () => {
    const start = Date.now();
    await sleep(0);
    const end = Date.now();
    expect(end - start).toBeLessThan(10); // Should resolve almost immediately
  });

  it("should handle negative milliseconds by resolving immediately", async () => {
    const start = Date.now();
    await sleep(-1000);
    const end = Date.now();
    expect(end - start).toBeLessThan(10); // Should resolve almost immediately
  });

  it("should not resolve before the specified time", async () => {
    const ms = 1000;
    const start = Date.now();
    const promise = sleep(ms);
    
    // Wait for slightly less than the sleep time
    await new Promise((resolve) => setTimeout(resolve, ms - 100));
    
    // The promise should not have resolved yet
    expect(Date.now() - start).toBeLessThan(ms);
    
    // Now wait for the full time
    await promise;
    expect(Date.now() - start).toBeGreaterThanOrEqual(ms);
  });
}); 