import { readJSONFile } from "@director.run/utilities/json";
import { afterAll, beforeEach, describe, expect, test } from "vitest";
import {
  createConfigFile,
  createTestClient,
  deleteConfigFile,
} from "./test/fixtures";

describe(`vscode config`, () => {
  describe("incomplete config", () => {
    const incompleteConfig = {
      foo: "bar",
    };
    beforeEach(async () => {
      await createConfigFile({
        target: "vscode",
        config: incompleteConfig,
      });
    });

    afterAll(async () => {
      await deleteConfigFile("vscode");
    });

    test("should initialize the config if it is missing the mcp.servers", async () => {
      const installer = createTestClient("vscode");
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
