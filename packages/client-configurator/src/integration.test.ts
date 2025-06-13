import { readJSONFile } from "@director.run/utilities/json";
import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import { ConfiguratorTarget } from ".";
import {
  createConfigFile,
  createInstallable,
  createTestInstaller,
  deleteConfigFile,
  expectToThrowInitializtionErrors,
} from "./test/fixtures";
import type { VSCodeConfig } from "./vscode";

[
  ConfiguratorTarget.Claude,
  ConfiguratorTarget.Cursor,
  ConfiguratorTarget.VSCode,
].forEach((target) => {
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

      test("should return false if the client is not present", async () => {
        const installer = createTestInstaller(target, {
          isClientPresent: false,
        });
        expect(await installer.isInstalled("any")).toBe(false);
      });

      test("should return false if the client config is not present", async () => {
        const installer = createTestInstaller(target);
        vi.spyOn(installer, "isClientConfigPresent").mockResolvedValue(false);
        expect(await installer.isInstalled("any")).toBe(false);
      });
    });

    describe("install", () => {
      const installer = createTestInstaller(target);
      test("should be able to install a server", async () => {
        const installable = createInstallable();
        expect(await installer.isInstalled(installable.name)).toBe(false);
        await installer.install(installable);
        expect(await installer.isInstalled(installable.name)).toBe(true);

        const configFile: VSCodeConfig = await readJSONFile(
          installer.configPath,
        );

        expect(Object.keys(configFile.mcp.servers)).toContain(
          `director__${installable.name}`,
        );
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

describe("getProxyInstalledStatus", () => {
  test.skip("should work", async () => {});
});
