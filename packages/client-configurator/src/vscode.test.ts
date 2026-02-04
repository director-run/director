import fs from "node:fs/promises";
import { readJSONFile } from "@director.run/utilities/json";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import {
  createConfigFile,
  createTestClient,
  deleteConfigFile,
  getConfigPath,
} from "./test/fixtures";

describe(`vscode config`, () => {
  // Cleanup after each test to avoid file conflicts with integration tests
  afterEach(async () => {
    await deleteConfigFile("vscode");
  });

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

  describe("JSONC support (JSON with comments)", () => {
    const configPath = getConfigPath("vscode");

    beforeEach(async () => {
      // Write a config file with comments (JSONC format)
      const jsoncContent = `{
  // This is a comment
  "editor.fontSize": 14,
  /* Multi-line
     comment */
  "mcp": {
    "servers": {}
  }
}`;
      await fs.writeFile(configPath, jsoncContent);
    });

    test("should parse settings.json files with comments", async () => {
      const installer = createTestClient("vscode");

      // Should not throw when parsing a file with comments
      expect(await installer.isInstalled("any")).toBe(false);

      // Should preserve other settings
      expect(await readJSONFile(installer.configPath, { jsonc: true })).toEqual(
        expect.objectContaining({
          "editor.fontSize": 14,
        }),
      );
    });
  });
});
