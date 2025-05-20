import type { ProxyServerAttributes } from "@director.run/mcp/types";
import type { EntryParameter } from "@director.run/registry/db/schema";

import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import { makeFooBarServerStdioConfig } from "../../test/fixtures";
import { IntegrationTestHarness } from "../../test/integration";

const testServerStdioConfig = makeFooBarServerStdioConfig();

function makeParameters(): EntryParameter[] {
  return [
    {
      name: "first-parameter",
      description: "Echo server",
      scope: "env",
      required: true,
      type: "string",
    },
  ];
}

vi.mock("@director.run/registry/client", () => ({
  createRegistryClient: vi.fn(() => ({
    entries: {
      getEntryByName: {
        query: vi.fn().mockImplementation(() =>
          Promise.resolve({
            parameters: makeParameters(),
            ...testServerStdioConfig,
          }),
        ),
      },
    },
  })),
}));

describe("Registry Router", () => {
  let harness: IntegrationTestHarness;

  beforeAll(async () => {
    harness = await IntegrationTestHarness.start();
  });

  afterAll(async () => {
    await harness.stop();
  });

  describe("addServerFromRegistry", () => {
    let proxy: ProxyServerAttributes;

    beforeEach(async () => {
      await harness.purge();
      proxy = await harness.client.store.create.mutate({
        name: "Test proxy",
      });
    });

    test("should add a 'registry:' prefix to the server name", async () => {
      const updatedProxy =
        await harness.client.registry.addServerFromRegistry.mutate({
          proxyId: proxy.id,
          entryName: "foo",
          parameters: {
            "first-parameter": "test",
          },
        });

      expect(updatedProxy.servers).toHaveLength(1);
      expect(updatedProxy.servers[0].name).toBe("registry:foo");
    });

    test("should throw an error if a required parameter is missing", async () => {
      await expect(
        harness.client.registry.addServerFromRegistry.mutate({
          proxyId: proxy.id,
          entryName: "echo",
        }),
      ).rejects.toThrow();
    });
  });
});
