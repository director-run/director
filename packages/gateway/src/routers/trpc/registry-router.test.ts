import type {
  ProxyServerAttributes,
  STDIOTransport,
} from "@director.run/mcp/types";

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

const registryEntry = {
  id: testServerStdioConfig.name,
  name: testServerStdioConfig.name,
  transport: {
    type: "stdio",
    command: testServerStdioConfig.transport.command,
    args: [
      ...testServerStdioConfig.transport.args,
      "--noop",
      "SECOND_PARAMETER",
    ],
    env: {
      FIRST_PARAMETER: "<PLACEHOLDER>",
    },
  },
  parameters: [
    {
      name: "FIRST_PARAMETER",
      description: "some parameter",
      scope: "env",
      required: true,
      type: "string",
    },
    {
      name: "SECOND_PARAMETER",
      description: "some parameter",
      scope: "args",
      required: true,
      type: "string",
    },
  ],
};

vi.mock("@director.run/registry/client", () => ({
  createRegistryClient: vi.fn(() => ({
    entries: {
      getEntryByName: {
        query: vi.fn().mockImplementation(() => Promise.resolve(registryEntry)),
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

    test("should add store the registry entry in the server attributes", async () => {
      const updatedProxy =
        await harness.client.registry.addServerFromRegistry.mutate({
          proxyId: proxy.id,
          entryName: "foo",
          parameters: {
            FIRST_PARAMETER: "test",
            SECOND_PARAMETER: "test2",
          },
        });

      expect(updatedProxy.servers).toHaveLength(1);
      expect(updatedProxy.servers[0].name).toBe("foo");
      expect(updatedProxy.servers[0].source?.name).toEqual("registry");
      expect(updatedProxy.servers[0].source?.entryId).toEqual("foo");
      expect(updatedProxy.servers[0].source?.entryData).toEqual(registryEntry);
    });

    test("should throw an error if a required parameter is missing", async () => {
      await expect(
        harness.client.registry.addServerFromRegistry.mutate({
          proxyId: proxy.id,
          entryName: "echo",
          parameters: {
            FIRST_PARAMETER: "test",
          },
        }),
      ).rejects.toThrow();
      await expect(
        harness.client.registry.addServerFromRegistry.mutate({
          proxyId: proxy.id,
          entryName: "echo",
          parameters: {
            SECOND_PARAMETER: "test",
          },
        }),
      ).rejects.toThrow();
    });

    test("should substitute the parameter into the transport command", async () => {
      const updatedProxy =
        await harness.client.registry.addServerFromRegistry.mutate({
          proxyId: proxy.id,
          entryName: "foo",
          parameters: {
            FIRST_PARAMETER: "test",
            SECOND_PARAMETER: "test2",
          },
        });
      const transport = updatedProxy.servers[0].transport as STDIOTransport;
      expect(transport.env).toEqual({
        FIRST_PARAMETER: "test",
      });
      expect(transport.args).toEqual([
        ...testServerStdioConfig.transport.args,
        "--noop",
        "test2",
      ]);
    });
  });
});
