import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Gateway } from "./gateway";
import {} from "./test/fixtures";

const TEST_PORT = 4673;

describe("Gateway", () => {
  let gateway: Gateway;
  beforeAll(async () => {
    gateway = await Gateway.start({
      port: TEST_PORT,
      databaseFilePath: path.join(__dirname, "config.test.json"),
      registryURL: "http://localhost:3000",
      headers: {
        "x-cli-version": "1.2.3",
      },
      oauth: {
        enabled: true,
        storage: "memory",
      },
    });
  });

  afterAll(async () => {
    await gateway.proxyStore.purge();
    await gateway.stop();
  });

  it("should include the custom header in the response", async () => {
    const response = await fetch(`http://localhost:${TEST_PORT}`);
    expect(response.headers.get("x-cli-version")).toBe("1.2.3");
  });
});
