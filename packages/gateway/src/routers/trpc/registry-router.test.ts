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

vi.mock("@director.run/registry/client", () => ({
  createRegistryClient: vi.fn(() => ({
    entries: {
      getEntryByName: {
        query: vi.fn().mockImplementation(() =>
          Promise.resolve({
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

    test("should add a 'registry__' prefix to the server name", async () => {
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
      expect(updatedProxy.servers[0].name).toBe("registry__foo");
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
