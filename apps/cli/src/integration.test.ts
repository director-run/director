import { ChildProcess } from "node:child_process";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "vitest";
import { gatewayClient } from "./client";
import { runCLICommand, runCLIServe } from "./test/helpers";

describe("CLI integration tests", () => {
  let serveProcess: ChildProcess;
  beforeAll(async () => {
    serveProcess = await runCLIServe({ verbose: false });
  }, 30000);

  afterAll(() => {
    serveProcess.kill();
  });

  beforeEach(async () => {
    await gatewayClient.store.purge.mutate();
  });

  test("should be able to create a proxy server", async () => {
    await runCLICommand("create", "test");
    expect(await gatewayClient.store.getAll.query()).toContainEqual(
      expect.objectContaining({
        id: "test",
        name: "test",
      }),
    );
  });

  describe("adding a server to a proxy", () => {
    test("should be able to add a server from the registry", async () => {});
    test("should be able to add a server using a command", async () => {});
    test("should be able to add an oauth authenticated server", async () => {});
  });

  describe("updating a proxy", () => {
    test("should be able to update multiple attributes", async () => {});
    test("should be able to disable a server", async () => {});
  });
});
