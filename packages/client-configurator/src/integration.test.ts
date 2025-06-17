import fs from "node:fs";
import { ErrorCode } from "@director.run/utilities/error";
import { readJSONFile } from "@director.run/utilities/json";
import { isFilePresent } from "@director.run/utilities/os";
import { expectToThrowAppError } from "@director.run/utilities/test";
import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import { ConfiguratorTarget, getConfigurator } from ".";
import type { ClaudeConfig } from "./claude";
import type { CursorConfig } from "./cursor";
import {
  createConfigFile,
  createInstallable,
  createTestInstaller,
  deleteConfigFile,
  expectToThrowInitializtionErrors,
  getConfigPath,
} from "./test/fixtures";
import type { AbstractConfigurator } from "./types";
import type { VSCodeConfig } from "./vscode";
[
  ConfiguratorTarget.Claude,
  ConfiguratorTarget.Cursor,
  ConfiguratorTarget.VSCode,
].forEach((target) => {
  describe(`${target} installer`, () => {
    describe("corrupt config", () => {
      beforeEach(async () => {});
      test("should throw an error if the config file is corrupt", async () => {
        const configPath = getConfigPath(target);
        expect(isFilePresent(configPath)).toBe(false);
        await fs.promises.writeFile(configPath, "{'invalid': 'json'");
        const installer = getConfigurator(target, {
          configPath,
        });
        await expectToThrowAppError(() => installer.isInstalled("any"), {
          code: ErrorCode.JSON_PARSE_ERROR,
          props: { path: configPath },
        });
      });
    });

    describe("config missing", () => {
      let installer: AbstractConfigurator<unknown>;
      beforeEach(async () => {
        installer = getConfigurator(target);
        if (isFilePresent(installer.configPath)) {
          await fs.promises.unlink(installer.configPath);
        }
      });

      test("should initialize the config", async () => {
        expect(isFilePresent(installer.configPath)).toBe(false);
        expect(await installer.isClientConfigPresent()).toBe(false);
        expect(await installer.isInstalled("any")).toBe(false);
        expect(isFilePresent(installer.configPath)).toBe(true);
      });
    });

    describe("config present", () => {
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

          const configFile = await readJSONFile(installer.configPath);
          let servers: Record<string, unknown> = {};

          switch (target) {
            case ConfiguratorTarget.VSCode:
              servers = (configFile as VSCodeConfig).mcp.servers;
              break;
            case ConfiguratorTarget.Claude:
              servers = (configFile as ClaudeConfig).mcpServers;
              break;
            case ConfiguratorTarget.Cursor:
              servers = (configFile as CursorConfig).mcpServers;
              break;
          }

          expect(Object.keys(servers)).toContain(
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
});

describe("getProxyInstalledStatus", () => {
  test.skip("should work", async () => {});
});
