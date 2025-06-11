import { afterAll, beforeEach, describe, expect, test } from "vitest";
import { ConfiguratorTarget } from ".";
import {
  createConfigFile,
  createInstallable,
  createTestInstaller,
  deleteConfigFile,
  expectToThrowInitializtionErrors,
} from "./test/fixtures";

[ConfiguratorTarget.Claude, ConfiguratorTarget.Cursor].forEach((target) => {
  describe(`${target} installer`, () => {
    beforeEach(async () => {
      await createConfigFile(target);
    });

    afterAll(async () => {
      await deleteConfigFile(target);
    });

    describe("isInstalled", () => {
      test("should correctly check if a server is installed", async () => {
        const entry = createInstallable();
        const installer = createTestInstaller(target);
        expect(await installer.isInstalled(entry.name)).toBe(false);
        await installer.install(entry);
        expect(await installer.isInstalled(entry.name)).toBe(true);
        await installer.uninstall(entry.name);
        expect(await installer.isInstalled(entry.name)).toBe(false);
      });

      expectToThrowInitializtionErrors(target, (installer) =>
        installer.isInstalled("something"),
      );
    });

    describe("install", () => {
      test("should be able to install a server", async () => {
        const installable = createInstallable();
        const installer = createTestInstaller(target);
        expect(await installer.isInstalled(installable.name)).toBe(false);
        await installer.install(installable);
        expect(await installer.isInstalled(installable.name)).toBe(true);
      });

      expectToThrowInitializtionErrors(target, (installer) =>
        installer.install(createInstallable()),
      );
    });

    describe("uninstall", () => {
      test("should be able to uninstall a server", async () => {
        const installable = createInstallable();
        const installer = createTestInstaller(target);
        await installer.install(installable);
        expect(await installer.list()).toHaveLength(1);
        await installer.uninstall(installable.name);
        expect(await installer.list()).toHaveLength(0);
      });

      expectToThrowInitializtionErrors(target, (installer) =>
        installer.uninstall("something"),
      );
    });

    describe("reset", () => {
      test("should clear all servers", async () => {
        const installer = createTestInstaller(target);
        await installer.install(createInstallable());
        await installer.install(createInstallable());
        await installer.reset();
        expect(await installer.list()).toHaveLength(0);
      });

      expectToThrowInitializtionErrors(target, (installer) =>
        installer.reset(),
      );
    });

    describe("list", () => {
      test("should return the list of servers", async () => {
        const installer = createTestInstaller(target);
        await installer.install(createInstallable());
        expect(await installer.list()).toHaveLength(1);
      });
      expectToThrowInitializtionErrors(target, (installer) =>
        installer.reset(),
      );
    });

    describe("reload", () => {
      expectToThrowInitializtionErrors(target, (installer) =>
        installer.reload("any"),
      );
    });

    describe("restart", () => {
      expectToThrowInitializtionErrors(target, (installer) =>
        installer.reload("any"),
      );
    });
  });
});
