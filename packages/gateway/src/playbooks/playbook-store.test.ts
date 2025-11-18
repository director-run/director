import { HTTPClient } from "@director.run/mcp/client/http-client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeTestConfig } from "../test/config";
import { makeHTTPTargetConfig } from "../test/fixtures";
import { PlaybookStore } from "./playbook-store";

describe("PlaybookStore", () => {
  let playbookStore: PlaybookStore;

  beforeEach(async () => {
    playbookStore = await PlaybookStore.create({
      config: await makeTestConfig(),
      oauth: {
        storage: "memory",
        baseCallbackUrl: "http://localhost:3000/callback",
      },
    });
    await playbookStore.create({
      name: "test-playbook",
      userId: "test-user-id",
      servers: [],
    });
  });

  describe("onAuthorizationSuccess", () => {
    it("should properly update the targets with the new oauth token", async () => {
      await playbookStore.purge();
      const playbook = await playbookStore.create({
        name: "test-playbook",
        userId: "test-user-id",
        servers: [],
      });

      const serverUrl = "https://mcp.notion.com/mcp";
      const target = await playbook.addTarget(
        makeHTTPTargetConfig({ name: "http1", url: serverUrl }),
        { throwOnError: false },
      );

      const httpClient = (await playbookStore
        .get("test-playbook", "test-user-id")
        .getTarget("http1")) as HTTPClient;
      httpClient.completeAuthFlow = vi.fn();

      await playbookStore.onAuthorizationSuccess(
        playbook.id,
        target.name,
        "some-code",
        "test-user-id",
      );

      expect(httpClient.completeAuthFlow).toHaveBeenCalledWith("some-code");
    });
  });
});
