vi.mock("@director.run/utilities/os", () => ({
  isAppInstalled: vi.fn(() => true),
  isFilePresent: vi.fn(() => true),
  App: {
    CLAUDE: "Claude",
  },
}));

import fs from "node:fs/promises";
import path from "node:path";
import { writeJSONFile } from "@director.run/utilities/json";
import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import { ClaudeInstaller } from "./claude";
import { createClaudeConfig, createInstallable } from "./test/fixtures";

describe("claude installer", () => {
  const configFilePath = path.join(__dirname, "test/claude.config.test.json");

  beforeEach(async () => {
    await writeJSONFile(configFilePath, createClaudeConfig([]));
  });

  afterAll(async () => {
    await fs.unlink(configFilePath);
  });

  describe("isInstalled", () => {
    test("should correctly check if a server is installed", async () => {
      const entry = createInstallable();
      const installer = new ClaudeInstaller({ configPath: configFilePath });
      expect(await installer.isInstalled(entry.name)).toBe(false);
      await installer.install(entry);
      expect(await installer.isInstalled(entry.name)).toBe(true);
      await installer.uninstall(entry.name);
      expect(await installer.isInstalled(entry.name)).toBe(false);
    });
  });

  describe("install", () => {
    test("should be able to install a server", async () => {
      const installable = createInstallable();
      const installer = new ClaudeInstaller({ configPath: configFilePath });
      expect(await installer.isInstalled(installable.name)).toBe(false);
      await installer.install(installable);
      expect(await installer.isInstalled(installable.name)).toBe(true);
    });
  });

  test("should be able to uninstall a server", async () => {
    const installable = createInstallable();
    const installer = new ClaudeInstaller({ configPath: configFilePath });
    await installer.install(installable);
    expect(await installer.list()).toHaveLength(1);
    await installer.uninstall(installable.name);
    expect(await installer.list()).toHaveLength(0);
  });

  test("should be able to purge all servers", async () => {
    const installer = new ClaudeInstaller({ configPath: configFilePath });
    await installer.install(createInstallable());
    await installer.install(createInstallable());
    await installer.reset();
    expect(await installer.list()).toHaveLength(0);
  });
});
