import { readJSONFile } from "@director.run/utilities/json";
import { afterAll, beforeEach, describe, expect, test } from "vitest";
import { ConfiguratorTarget, getConfigurator } from ".";
import {
  createConfigFile,
  deleteConfigFile,
  getConfigPath,
} from "./test/fixtures";

describe(`claude config`, () => {
  describe("incomplete config", () => {
    const incompleteConfig = {
      foo: "bar",
    };
    beforeEach(async () => {
      await createConfigFile(ConfiguratorTarget.Claude, incompleteConfig);
    });

    afterAll(async () => {
      await deleteConfigFile(ConfiguratorTarget.Claude);
    });

    test("should initialize the config if it is missing the mcp.servers", async () => {
      const configPath = getConfigPath(ConfiguratorTarget.Claude);
      const installer = getConfigurator(ConfiguratorTarget.Claude, {
        configPath,
      });
      expect(await installer.isInstalled("any")).toBe(false);
      expect(await readJSONFile(configPath)).toEqual({
        foo: "bar",
        mcpServers: {},
      });
    });
  });
});
