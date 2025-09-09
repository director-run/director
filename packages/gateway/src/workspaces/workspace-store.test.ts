import fs from "node:fs";
import path from "node:path";
import { HTTPClient } from "@director.run/mcp/client/http-client";
import { OAuthHandler } from "@director.run/mcp/oauth/oauth-provider-factory";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { YAMLConfig } from "../config";
import { makeHTTPTargetConfig } from "../test/fixtures";
import { WorkspaceStore } from "./workspace-store";

describe("WorkspaceStore", () => {
  let workspaceStore: WorkspaceStore;
  const dbPath = path.join(__dirname, "../test/config.test.yaml");

  beforeEach(async () => {
    if (fs.existsSync(dbPath)) {
      await fs.promises.unlink(dbPath);
    }
    const db = await YAMLConfig.connect(dbPath);
    workspaceStore = await WorkspaceStore.create({
      config: db,
      oAuthHandler: OAuthHandler.createMemoryBackedHandler({
        baseCallbackUrl: "http://localhost:3000/callback",
      }),
    });
    await workspaceStore.create({
      name: "test-workspace",
      servers: [],
    });
  });

  describe("onAuthorizationSuccess", () => {
    it("should properly update the targets with the new oauth token", async () => {
      await workspaceStore.purge();
      const workspace = await workspaceStore.create({
        name: "test-workspace",
        servers: [],
      });

      const serverUrl = "https://mcp.notion.com/mcp";
      await workspace.addTarget(
        makeHTTPTargetConfig({ name: "http1", url: serverUrl }),
        { throwOnError: false },
      );

      const httpClient = (await workspaceStore
        .get("test-workspace")
        .getTarget("http1")) as HTTPClient;
      httpClient.completeAuthFlow = vi.fn();

      await workspaceStore.onAuthorizationSuccess(serverUrl, "some-code");

      expect(httpClient.completeAuthFlow).toHaveBeenCalledWith("some-code");
    });
  });
});
