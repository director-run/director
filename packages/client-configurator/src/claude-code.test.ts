import { readJSONFile } from "@director.run/utilities/json";
import { afterAll, beforeEach, describe, expect, test } from "vitest";
import { ClientNames } from ".";
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
      await createConfigFile({
        target: ClientNames.ClaudeCode,
        config: incompleteConfig,
      });
    });

    afterAll(async () => {
      await deleteConfigFile(ClientNames.ClaudeCode);
    });

    test("should initialize the config if it is missing the mcpServers", async () => {
      const installer = createTestInstaller(ClientNames.ClaudeCode);
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
