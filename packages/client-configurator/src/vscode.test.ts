import { readJSONFile } from "@director.run/utilities/json";
import { afterAll, beforeEach, describe, expect, test } from "vitest";
import { ClientNames } from ".";
import {
  createConfigFile,
  createTestInstaller,
  deleteConfigFile,
} from "./test/fixtures";

describe(`vscode config`, () => {
  describe("incomplete config", () => {
    const incompleteConfig = {
      foo: "bar",
    };
    beforeEach(async () => {
      await createConfigFile({
        target: ClientNames.VSCode,
        config: incompleteConfig,
      });
    });

    afterAll(async () => {
      await deleteConfigFile(ClientNames.VSCode);
    });

    test("should initialize the config if it is missing the mcp.servers", async () => {
      const installer = createTestInstaller(ClientNames.VSCode);
      expect(await readJSONFile(installer.configPath)).toEqual({
        foo: "bar",
      });

      expect(await installer.isInstalled("any")).toBe(false);
      expect(await readJSONFile(installer.configPath)).toEqual({
        foo: "bar",
        mcp: {
          servers: {},
        },
      });
    });
  });
});
