import { readJSONFile } from "@director.run/utilities/json";
import { afterAll, beforeEach, describe, expect, test } from "vitest";
import { ClientNames } from ".";
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
        target: ClientNames.Claude,
        config: incompleteConfig,
      });
    });

    afterAll(async () => {
      await deleteConfigFile(ClientNames.Claude);
    });

    test("should initialize the config if it is missing the mcp.servers", async () => {
      const installer = createTestClient(ClientNames.Claude);
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
