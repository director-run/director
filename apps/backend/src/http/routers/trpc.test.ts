import fs from "fs";
import http from "http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PROXY_DB_FILE_PATH } from "../../constants";
import { writeConfigFile } from "../../services/config";
import type { Config } from "../../services/config/schema";
import { startService } from "../../startService";

// Test configuration to use for tests
const testConfig: Config = {
  proxies: [
    {
      id: "test-proxy",
      name: "test-proxy",
      servers: [
        {
          name: "Hackernews",
          transport: {
            type: "stdio",
            command: "uvx",
            args: [
              "--from",
              "git+https://github.com/erithwik/mcp-hn",
              "mcp-hn",
            ],
          },
        },
        {
          name: "Fetch",
          transport: {
            type: "stdio",
            command: "uvx",
            args: ["mcp-server-fetch"],
          },
        },
      ],
    },
  ],
};

describe("TRPC Router", () => {
  let proxyServer: http.Server | undefined;

  beforeAll(async () => {
    await writeConfigFile(testConfig, PROXY_DB_FILE_PATH);
    proxyServer = await startService();
  });

  afterAll(async () => {
    fs.unlinkSync(PROXY_DB_FILE_PATH);
    if (proxyServer) {
      await new Promise<void>((resolve) => {
        proxyServer?.close(() => resolve());
      });
      proxyServer = undefined;
    }
  });

  it("should be tested", async () => {
    expect(true).toBe(true);
  });
});
