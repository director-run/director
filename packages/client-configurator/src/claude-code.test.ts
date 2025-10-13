import { readJSONFile } from "@director.run/utilities/json";
import { afterAll, beforeEach, describe, expect, test } from "vitest";
import { ConfiguratorTarget } from ".";
import {
  createConfigFile,
  createTestInstaller,
  deleteConfigFile,
} from "./test/fixtures";

describe(`claude-code config`, () => {
  describe("incomplete config", () => {
    const incompleteConfig = {
      foo: "bar",
    };
    beforeEach(async () => {
      await createConfigFile(ConfiguratorTarget.ClaudeCode, incompleteConfig);
    });

    afterAll(async () => {
      await deleteConfigFile(ConfiguratorTarget.ClaudeCode);
    });

    test("should initialize the config if it is missing the mcpServers", async () => {
      const installer = createTestInstaller(ConfiguratorTarget.ClaudeCode);
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
