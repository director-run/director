import type { Server } from "node:http";
import { makeEchoServer } from "@director.run/mcp/test/fixtures";
import { serveOverSSE } from "@director.run/mcp/transport";
import type { ProxyServerAttributes } from "@director.run/mcp/types";
import type { EntryParameters } from "@director.run/registry/db/schema";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import { makeSSETargetConfig } from "../../test/fixtures";
import { IntegrationTestHarness } from "../../test/integration";

const PROXY_TARGET_PORT = 4521;

const echoServerSSEConfig = makeSSETargetConfig({
  name: "echo",
  url: `http://localhost:${PROXY_TARGET_PORT}/sse`,
});

function makeParameters(): EntryParameters {
  return [
    {
      name: "first-parameter",
      description: "Echo server",
      type: "string",
      required: true,
      scope: "env",
    },
  ];
}

// Mock the registry client
vi.mock("@director.run/registry/client", () => ({
  createRegistryClient: vi.fn(() => ({
    entries: {
      getEntryByName: {
        query: vi
          .fn()
          .mockImplementation(() => Promise.resolve(echoServerSSEConfig)),
      },
    },
  })),
}));

describe("Registry Router", () => {
  let harness: IntegrationTestHarness;
  let proxyTargetServerInstance: Server;

  beforeAll(async () => {
    proxyTargetServerInstance = await serveOverSSE(
      makeEchoServer(),
      PROXY_TARGET_PORT,
    );
    harness = await IntegrationTestHarness.start();
  });

  afterAll(async () => {
    await harness.stop();
    await proxyTargetServerInstance?.close();
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
          entryName: "echo",
        });

      expect(updatedProxy.servers).toHaveLength(1);
      expect(updatedProxy.servers[0].name).toBe("registry:echo");
    });
  });
});
