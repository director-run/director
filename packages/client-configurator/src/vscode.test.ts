import { readJSONFile } from "@director.run/utilities/json";
import { afterAll, beforeEach, describe, expect, test } from "vitest";
import { ConfiguratorTarget, getConfigurator } from ".";
import {
  createConfigFile,
  deleteConfigFile,
  getConfigPath,
} from "./test/fixtures";

describe(`vscode config`, () => {
  describe("incomplete config", () => {
    const incompleteConfig = {
      foo: "bar",
    };
    beforeEach(async () => {
      await createConfigFile(ConfiguratorTarget.VSCode, incompleteConfig);
    });

    afterAll(async () => {
      await deleteConfigFile(ConfiguratorTarget.VSCode);
    });

    test("should initialize the config if it is missing the mcp.servers", async () => {
      const configPath = getConfigPath(ConfiguratorTarget.VSCode);
      const installer = getConfigurator(ConfiguratorTarget.VSCode, {
        configPath,
      });
      expect(await installer.isInstalled("any")).toBe(false);
      expect(configPath).toEqual(installer.configPath);
      expect(await readJSONFile(configPath)).toEqual({
        foo: "bar",
        mcp: {
          servers: {},
        },
      });
    });
  });
});
