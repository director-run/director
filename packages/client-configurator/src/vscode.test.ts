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
    beforeEach(async () => {});

    afterAll(async () => {});

    test("should initialize the config if it is missing the mcp.servers", async () => {
      await createConfigFile(ConfiguratorTarget.VSCode, incompleteConfig);

      const configPath = getConfigPath(ConfiguratorTarget.VSCode);

      expect(await readJSONFile(configPath)).toEqual({
        foo: "bar",
      });

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

      await deleteConfigFile(ConfiguratorTarget.VSCode);
    });
  });
});
