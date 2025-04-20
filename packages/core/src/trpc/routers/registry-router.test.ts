import {
  type IntegrationTestVariables,
  setupIntegrationTest,
} from "@/helpers/test-helpers";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("Registry Router", () => {
  let testVariables: IntegrationTestVariables;

  beforeAll(async () => {
    testVariables = await setupIntegrationTest();
  });

  afterAll(async () => {
    await testVariables.close();
  });

  it("should list all repository items", async () => {
    const items = await testVariables.trpcClient.registry.list.query();
    console.log(items[0]);
    expect(items).toBeDefined();
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]).toHaveProperty("name");
    expect(items[0]).toHaveProperty("description");
  });

  it("should get a single repository item", async () => {
    const items = await testVariables.trpcClient.registry.list.query();
    const firstItem = items[0];
    const item = await testVariables.trpcClient.registry.get.query({
      id: firstItem.id,
    });
    expect(item).toBeDefined();
    expect(item.name).toBe(firstItem.name);
    expect(item).toHaveProperty("transport");
    expect(item).toHaveProperty("source");
    expect(item.transport.type).toBe("stdio");
    expect(item.transport.command).toBeDefined();
    expect(item.transport.args).toBeDefined();
    expect(item.source.type).toBe("github");
    expect(item.source.url).toBeDefined();
  });

  it("should throw an error for non-existent repository item", async () => {
    await expect(
      testVariables.trpcClient.registry.get.query({ id: "non-existent" }),
    ).rejects.toThrow();
  });
});
