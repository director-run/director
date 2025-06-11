import path from "node:path";
import { ErrorCode } from "@director.run/utilities/error";
import { expectToThrowAppError } from "@director.run/utilities/test";
import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import { ConfiguratorTarget } from ".";
import { ClaudeInstaller } from "./claude";
import {
  createConfigFile,
  createInstallable,
  deleteConfigFile,
} from "./test/fixtures";
import { AbstractConfigurator } from "./types";

const TEST_CONFIG_PATH = path.join(__dirname, "test/claude.config.test.json");

function createTestInstaller(
  target: ConfiguratorTarget,
  params: {
    isClientPresent: boolean;
  } = {
    isClientPresent: true,
  },
) {
  const installer = new ClaudeInstaller({ configPath: TEST_CONFIG_PATH });
  // In CI, the client is not present, so we mock the method to return false
  vi.spyOn(installer, "isClientPresent").mockResolvedValue(
    params.isClientPresent,
  );
  // We do not mock the config present method because we want to rw properly
  return installer;
}

function expectToThrowInitializtionErrors(
  fn: (installer: AbstractConfigurator<unknown>) => Promise<unknown>,
) {
  test("should throw an AppError if the client is not present", async () => {
    const installer = createTestInstaller(ConfiguratorTarget.Claude, {
      isClientPresent: false,
    });
    await expectToThrowAppError(() => fn(installer), {
      code: ErrorCode.COMMAND_NOT_FOUND,
      props: { name: installer.name, configPath: installer.configPath },
    });
  });

  test("should throw an AppError if the config is not present", async () => {
    const installer = createTestInstaller(ConfiguratorTarget.Claude);
    vi.spyOn(installer, "isClientConfigPresent").mockResolvedValue(false);
    await expectToThrowAppError(() => fn(installer), {
      code: ErrorCode.FILE_NOT_FOUND,
      props: { name: installer.name, configPath: installer.configPath },
    });
  });
}

describe("claude installer", () => {
  beforeEach(async () => {
    await createConfigFile(ConfiguratorTarget.Claude);
  });

  afterAll(async () => {
    await deleteConfigFile(ConfiguratorTarget.Claude);
  });

  describe("isInstalled", () => {
    test("should correctly check if a server is installed", async () => {
      const entry = createInstallable();
      const installer = createTestInstaller(ConfiguratorTarget.Claude);
      expect(await installer.isInstalled(entry.name)).toBe(false);
      await installer.install(entry);
      expect(await installer.isInstalled(entry.name)).toBe(true);
      await installer.uninstall(entry.name);
      expect(await installer.isInstalled(entry.name)).toBe(false);
    });

    expectToThrowInitializtionErrors((installer) =>
      installer.isInstalled("something"),
    );
  });

  describe("install", () => {
    test("should be able to install a server", async () => {
      const installable = createInstallable();
      const installer = createTestInstaller(ConfiguratorTarget.Claude);
      expect(await installer.isInstalled(installable.name)).toBe(false);
      await installer.install(installable);
      expect(await installer.isInstalled(installable.name)).toBe(true);
    });

    expectToThrowInitializtionErrors((installer) =>
      installer.install(createInstallable()),
    );
  });

  describe("uninstall", () => {
    test("should be able to uninstall a server", async () => {
      const installable = createInstallable();
      const installer = createTestInstaller(ConfiguratorTarget.Claude);
      await installer.install(installable);
      expect(await installer.list()).toHaveLength(1);
      await installer.uninstall(installable.name);
      expect(await installer.list()).toHaveLength(0);
    });

    expectToThrowInitializtionErrors((installer) =>
      installer.uninstall("something"),
    );
  });

  describe("reset", () => {
    test("should clear all servers", async () => {
      const installer = createTestInstaller(ConfiguratorTarget.Claude);
      await installer.install(createInstallable());
      await installer.install(createInstallable());
      await installer.reset();
      expect(await installer.list()).toHaveLength(0);
    });

    expectToThrowInitializtionErrors((installer) => installer.reset());
  });

  describe("list", () => {
    test("should return the list of servers", async () => {
      const installer = createTestInstaller(ConfiguratorTarget.Claude);
      await installer.install(createInstallable());
      expect(await installer.list()).toHaveLength(1);
    });
    expectToThrowInitializtionErrors((installer) => installer.reset());
  });

  describe("reload", () => {
    expectToThrowInitializtionErrors((installer) => installer.reload("any"));
  });

  describe("restart", () => {
    expectToThrowInitializtionErrors((installer) => installer.reload("any"));
  });
});
