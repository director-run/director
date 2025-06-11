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

const TEST_CONFIG_PATH = path.join(__dirname, "test/claude.config.test.json");

function createInstaller({
  present = true,
  configPresent = true,
}: {
  present?: boolean;
  configPresent?: boolean;
} = {}) {
  const installer = new ClaudeInstaller({ configPath: TEST_CONFIG_PATH });
  vi.spyOn(installer, "isClientPresent").mockResolvedValue(present);
  vi.spyOn(installer, "isClientConfigPresent").mockResolvedValue(configPresent);
  return installer;
}

describe("claude installer", () => {
  beforeEach(async () => {
    await writeJSONFile(TEST_CONFIG_PATH, createClaudeConfig([]));
  });

  afterAll(async () => {
    await fs.unlink(TEST_CONFIG_PATH);
  });

  describe("isInstalled", () => {
    test("should correctly check if a server is installed", async () => {
      const entry = createInstallable();
      const installer = createInstaller();
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
      const installer = new ClaudeInstaller({ configPath: TEST_CONFIG_PATH });
      expect(await installer.isInstalled(installable.name)).toBe(false);
      await installer.install(installable);
      expect(await installer.isInstalled(installable.name)).toBe(true);
    });
    test("should throw an error if the client is not present", async () => {
      const installer = createInstaller({ present: false });
      await expect(installer.install(createInstallable())).rejects.toThrow(
        "Claude desktop app is not installed command",
      );
    });
  });

  test("should be able to uninstall a server", async () => {
    const installable = createInstallable();
    const installer = new ClaudeInstaller({ configPath: TEST_CONFIG_PATH });
    await installer.install(installable);
    expect(await installer.list()).toHaveLength(1);
    await installer.uninstall(installable.name);
    expect(await installer.list()).toHaveLength(0);
  });

  test("should be able to purge all servers", async () => {
    const installer = new ClaudeInstaller({ configPath: TEST_CONFIG_PATH });
    await installer.install(createInstallable());
    await installer.install(createInstallable());
    await installer.reset();
    expect(await installer.list()).toHaveLength(0);
  });
});
