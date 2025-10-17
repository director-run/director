import { readJSONFile } from "@director.run/utilities/json";
import { afterAll, beforeEach, describe, expect, test } from "vitest";
import {
  createConfigFile,
  createTestClient,
  deleteConfigFile,
} from "./test/fixtures";

describe(`claude config`, () => {
  describe("incomplete config", () => {
    const incompleteConfig = {
      foo: "bar",
    };
    beforeEach(async () => {
      await createConfigFile({
        target: "claude",
        config: incompleteConfig,
      });
    });

    afterAll(async () => {
      await deleteConfigFile("claude");
    });

    test("should initialize the config if it is missing the mcp.servers", async () => {
      const installer = createTestClient("claude");
      expect(await readJSONFile(installer.configPath)).toEqual({
        foo: "bar",
      });

      expect(await installer.isInstalled("any")).toBe(false);
      expect(await readJSONFile(installer.configPath)).toEqual({
        foo: "bar",
        mcpServers: {},
      });
    });
  });
});
