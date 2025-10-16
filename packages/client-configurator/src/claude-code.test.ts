import { readJSONFile } from "@director.run/utilities/json";
import { afterAll, beforeEach, describe, expect, test } from "vitest";
import {
  createConfigFile,
  createTestClient,
  deleteConfigFile,
} from "./test/fixtures";

describe(`claude-code config`, () => {
  describe("incomplete config", () => {
    const incompleteConfig = {
      foo: "bar",
    };
    beforeEach(async () => {
      await createConfigFile({
        target: "claude-code",
        config: incompleteConfig,
      });
    });

    afterAll(async () => {
      await deleteConfigFile("claude-code");
    });

    test("should initialize the config if it is missing the mcpServers", async () => {
      const installer = createTestClient("claude-code");
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
