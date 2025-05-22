vi.mock("@director.run/utilities/os", () => ({
  isCommandInstalled: vi.fn(() => true),
  isFilePresent: vi.fn(() => true),
}));

import fs from "node:fs/promises";
import path from "node:path";
import { writeJSONFile } from "@director.run/utilities/json";
import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import { CLAUDE_CONFIG_KEY_PREFIX, ClaudeInstaller } from "./claude";
import {
  createClaudeConfig,
  createClaudeServerEntry,
} from "./test/fixtures/claude";

describe("claude installer", () => {
  const configFilePath = path.join(__dirname, "test/claude.config.test.json");
  let installer: ClaudeInstaller;

  beforeEach(async () => {
    await writeJSONFile(configFilePath, createClaudeConfig([]));
    installer = await ClaudeInstaller.create(configFilePath);
  });

  afterAll(async () => {
    await fs.unlink(configFilePath);
  });

  test("should be able to install a server", async () => {
    const entry = createClaudeServerEntry();
    await installer.install(entry);
    const servers = await installer.list();
    const installedServer = servers.find(
      (s) => s.name === `${CLAUDE_CONFIG_KEY_PREFIX}${entry.name}`,
    );
    expect(installedServer).toBeDefined();
    expect(installedServer).toEqual({
      name: `${CLAUDE_CONFIG_KEY_PREFIX}${entry.name}`,
      transport: entry.transport,
    });
  });

  test("should be able to uninstall a server", async () => {
    const entry = createClaudeServerEntry();
    await installer.install(entry);
    expect(await installer.list()).toHaveLength(1);
    await installer.uninstall(entry.name);
    expect(await installer.list()).toHaveLength(0);
  });

  test("should be able to purge all servers", async () => {
    await installer.install(createClaudeServerEntry());
    await installer.install(createClaudeServerEntry());
    await installer.install(createClaudeServerEntry());
    await installer.purge();
    expect(await installer.list()).toHaveLength(0);
  });
});
