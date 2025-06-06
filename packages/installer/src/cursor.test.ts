vi.mock("@director.run/utilities/os", () => ({
  isAppInstalled: vi.fn(() => true),
  isFilePresent: vi.fn(() => true),
  App: {
    CURSOR: "Cursor",
  },
}));

import fs from "node:fs/promises";
import path from "node:path";
import { writeJSONFile } from "@director.run/utilities/json";
import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import { CURSOR_CONFIG_KEY_PREFIX, CursorInstaller } from "./cursor";
import { createInstallable } from "./test/fixtures";
import { createCursorConfig } from "./test/fixtures/cursor";

describe("cursor installer", () => {
  const configFilePath = path.join(__dirname, "test/cursor.config.test.json");
  let installer: CursorInstaller;

  beforeEach(async () => {
    await writeJSONFile(configFilePath, createCursorConfig([]));
    installer = await CursorInstaller.create(configFilePath);
  });

  afterAll(async () => {
    await fs.unlink(configFilePath);
  });

  test("should correctly check if a server is installed", async () => {
    const installable = createInstallable();
    expect(installer.isInstalled(installable.name)).toBe(false);
    await installer.install(installable);
    expect(installer.isInstalled(installable.name)).toBe(true);
    await installer.uninstall(installable.name);
    expect(installer.isInstalled(installable.name)).toBe(false);
  });

  test("should be able to install a server", async () => {
    const installable = createInstallable();
    await installer.install(installable);
    const servers = await installer.list();
    const installedServer = servers.find(
      (s) => s.name === `${CURSOR_CONFIG_KEY_PREFIX}${installable.name}`,
    );
    expect(installedServer).toBeDefined();
    expect(installedServer).toEqual({
      name: `${CURSOR_CONFIG_KEY_PREFIX}${installable.name}`,
      url: installable.url,
    });
  });

  test("should be able to uninstall a server", async () => {
    const installable = createInstallable();
    await installer.install(installable);
    expect(await installer.list()).toHaveLength(1);
    await installer.uninstall(installable.name);
    expect(await installer.list()).toHaveLength(0);
  });

  test("should be able to purge all servers", async () => {
    await installer.install(createInstallable());
    await installer.install(createInstallable());
    await installer.purge();
    expect(await installer.list()).toHaveLength(0);
  });
});
