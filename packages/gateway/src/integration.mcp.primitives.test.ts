import { beforeAll, describe, test } from "vitest";
import { IntegrationTestHarness } from "./test/integration";

describe("MCP Primitives", () => {
  let harness: IntegrationTestHarness;

  beforeAll(async () => {
    harness = await IntegrationTestHarness.start();
  });
  test("should support listTools", async () => {});
});
