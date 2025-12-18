import fs from "node:fs";
import { ErrorCode } from "@director.run/utilities/error";
import { readJSONFile, writeJSONFile } from "@director.run/utilities/json";
import { isFilePresent } from "@director.run/utilities/os";
import { expectToThrowAppError } from "@director.run/utilities/test";
import { faker } from "@faker-js/faker";
import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import type { ClaudeConfig } from "./claude";
import type { ClaudeCodeConfig } from "./claude-code";
import type { CursorConfig } from "./cursor";
import {
  TEST_CONFIG_KEY_PREFIX,
  createConfigFile,
  createInstallable,
  createTestClient,
  deleteConfigFile,
  expectToThrowInitializtionErrors,
  getConfigPath,
} from "./test/fixtures";
import type { AbstractClient } from "./types";
import type { VSCodeConfig } from "./vscode";

["claude", "cursor", "vscode", "claude-code"].forEach((target) => {
  describe(`${target} installer`, () => {
    describe("corrupt config", () => {
      beforeEach(async () => {});
      test("should throw an error if the config file is corrupt", async () => {
        const configPath = getConfigPath(target);
        expect(isFilePresent(configPath)).toBe(false);
        await fs.promises.writeFile(configPath, "{'invalid': 'json'");
        const installer = createTestClient(target);
        await expectToThrowAppError(() => installer.isInstalled("any"), {
          code: ErrorCode.JSON_PARSE_ERROR,
          props: { path: configPath },
        });
      });
    });

    describe("config missing", () => {
      let installer: AbstractClient<unknown>;
      beforeEach(async () => {
        installer = createTestClient(target);
        if (isFilePresent(installer.configPath)) {
          await fs.promises.unlink(installer.configPath);
        }
      });

      test("should create the config file if it doesn't exist", async () => {
        expect(isFilePresent(installer.configPath)).toBe(false);
        expect(await installer.isClientConfigPresent()).toBe(false);
        expect(await installer.isInstalled("any")).toBe(false);
        expect(isFilePresent(installer.configPath)).toBe(true);
      });
    });

    describe("config present", () => {
      beforeEach(async () => {
        await createConfigFile({
          target,
          entries: [
            {
              name: "not_managed_by_director",
              streamableURL: faker.internet.url(),
            },
          ],
        });
      });

      afterAll(async () => {
        await deleteConfigFile(target);
      });

      describe("isInstalled", () => {
        test("should correctly check if a server is installed", async () => {
          const entry = createInstallable();
          const installer = createTestClient(target);
          expect(await installer.isInstalled(entry.name)).toBe(false);
          await installer.install(entry);
          expect(await installer.isInstalled(entry.name)).toBe(true);
          await installer.uninstall(entry.name);
          expect(await installer.isInstalled(entry.name)).toBe(false);
        });

        test("should return false if the client is not present", async () => {
          const installer = createTestClient(target, {
            isClientPresent: false,
          });
          expect(await installer.isInstalled("any")).toBe(false);
        });

        test("should return false if the client config is not present", async () => {
          const installer = createTestClient(target);
          vi.spyOn(installer, "isClientConfigPresent").mockResolvedValue(false);
          expect(await installer.isInstalled("any")).toBe(false);
        });
      });

      describe("install", () => {
        const installer = createTestClient(target);
        test("should be able to install a server", async () => {
          const installable = createInstallable();
          expect(await installer.isInstalled(installable.name)).toBe(false);
          await installer.install(installable);
          expect(await installer.isInstalled(installable.name)).toBe(true);

          const configFile = await readJSONFile(installer.configPath);
          let servers: Record<string, unknown> = {};

          switch (target) {
            case "vscode":
              servers = (configFile as VSCodeConfig).mcp.servers;
              break;
            case "claude":
              servers = (configFile as ClaudeConfig).mcpServers;
              break;
            case "cursor":
              servers = (configFile as CursorConfig).mcpServers;
              break;
            case "claude-code":
              servers = (configFile as ClaudeCodeConfig).mcpServers;
              break;
          }

          expect(Object.keys(servers)).toContain(
            `${TEST_CONFIG_KEY_PREFIX}${installable.name}`,
          );
        });

        expectToThrowInitializtionErrors(target, (installer) =>
          installer.install(createInstallable()),
        );
      });

      test("should return a result with requiresRestart", async () => {
        const installer = createTestClient(target);
        const installable = createInstallable();

        expect(await installer.install(installable)).toMatchObject({
          requiresRestart:
            installer.getCapabilities().requiresRestartOnInstallOrUninstall,
        });
      });

      test("should throw an error if the server is already installed", async () => {
        const installer = createTestClient(target);
        const installable = createInstallable();
        await installer.install(installable);
        await expectToThrowAppError(() => installer.install(installable), {
          code: ErrorCode.BAD_REQUEST,
          props: {},
        });
      });

      test("should not overwrite existing config data", async () => {
        const basicData = await readJSONFile<Record<string, unknown>>(
          getConfigPath(target),
        );
        await writeJSONFile(getConfigPath(target), {
          ...basicData,
          foo: "bar",
        });
        const installer = createTestClient(target);
        await installer.install(createInstallable());
        expect(await readJSONFile(getConfigPath(target))).toMatchObject({
          foo: "bar",
        });
      });

      describe("uninstall", () => {
        test("should be able to uninstall a server", async () => {
          const installable = createInstallable();
          const installer = createTestClient(target);
          await installer.install(installable);
          expect(await installer.list()).toHaveLength(1);
          await installer.uninstall(installable.name);
          expect(await installer.list()).toHaveLength(0);
        });

        test("should throw an error if the server is not installed", async () => {
          const installer = createTestClient(target);
          const installable = createInstallable();

          await expectToThrowAppError(
            () => installer.uninstall(installable.name),
            {
              code: ErrorCode.BAD_REQUEST,
              props: {},
            },
          );
        });

        test("should not overwrite existing config data", async () => {
          const installable = createInstallable();
          const installer = createTestClient(target);

          const basicData = await readJSONFile<Record<string, unknown>>(
            getConfigPath(target),
          );

          await writeJSONFile(getConfigPath(target), {
            ...basicData,
            foo: "bar",
          });

          await installer.install(installable);
          await installer.uninstall(installable.name);

          expect(await readJSONFile(getConfigPath(target))).toMatchObject({
            foo: "bar",
          });
        });

        expectToThrowInitializtionErrors(target, (installer) =>
          installer.uninstall("something"),
        );
      });

      describe("bulk install/uninstall", () => {
        test("should return a result with requiresRestart", async () => {
          const installer = createTestClient(target);
          const installable1 = createInstallable();
          const installable2 = createInstallable();

          expect(
            await installer.install([installable1, installable2]),
          ).toMatchObject({
            requiresRestart:
              installer.getCapabilities().requiresRestartOnInstallOrUninstall,
          });
        });

        test("should install multiple and uninstall multiple", async () => {
          const a = createInstallable();
          const b = createInstallable();
          const c = createInstallable();
          const installer = createTestClient(target);

          expect(await installer.list()).toHaveLength(0);
          await installer.install([a, b, c]);
          expect(await installer.isInstalled(a.name)).toBe(true);
          expect(await installer.isInstalled(b.name)).toBe(true);
          expect(await installer.isInstalled(c.name)).toBe(true);

          expect(await installer.list()).toHaveLength(3);

          await installer.uninstall([a.name, b.name]);
          expect(await installer.isInstalled(a.name)).toBe(false);
          expect(await installer.isInstalled(b.name)).toBe(false);
          expect(await installer.isInstalled(c.name)).toBe(true);
          expect(await installer.list()).toHaveLength(1);
        });
      });

      describe("reset", () => {
        let installer: AbstractClient<unknown>;
        beforeEach(async () => {
          installer = createTestClient(target);
          await installer.install(createInstallable());
          await installer.install(createInstallable());
        });

        test("should return a result with requiresRestart", async () => {
          expect(await installer.reset()).toMatchObject({
            requiresRestart:
              installer.getCapabilities().requiresRestartOnInstallOrUninstall,
          });
        });

        test("should return a result with requiresRestart = false if nothing was reset", async () => {
          await installer.reset();
          expect(await installer.reset()).toMatchObject({
            requiresRestart: false,
          });
        });

        test("should not overwrite existing config data", async () => {
          const installable = createInstallable();
          const installer = createTestClient(target);

          const basicData = await readJSONFile<Record<string, unknown>>(
            getConfigPath(target),
          );

          await writeJSONFile(getConfigPath(target), {
            ...basicData,
            foo: "bar",
          });

          await installer.install(installable);
          await installer.reset();

          expect(await readJSONFile(getConfigPath(target))).toMatchObject({
            foo: "bar",
          });
        });

        test("should not clear servers that are not managed by director", async () => {
          await installer.reset();
          expect(await installer.list({ includeUnmanaged: true })).toHaveLength(
            1,
          );
        });

        test("should clear servers that are unmanaged by director if includeUnmanaged is true", async () => {
          await installer.reset({ includeUnmanaged: true });
          expect(await installer.list()).toHaveLength(0);
        });

        test("should clear all servers", async () => {
          await installer.reset();
          expect(await installer.list()).toHaveLength(0);
        });

        expectToThrowInitializtionErrors(target, (installer) =>
          installer.reset(),
        );
      });

      describe("list", () => {
        test("should return servers that are not managed by director if includeUnmanaged is true", async () => {
          const installer = createTestClient(target);
          await installer.install(createInstallable());
          expect(await installer.list()).toHaveLength(1);
          expect(await installer.list({ includeUnmanaged: true })).toHaveLength(
            2,
          );
        });
        test("should return the list of servers", async () => {
          const installer = createTestClient(target);
          const installable = createInstallable();
          await installer.install(installable);

          expect(await installer.list()).toHaveLength(1);
        });

        test("should not include the internal name prefix", async () => {
          const installer = createTestClient(target);
          const installable = createInstallable();
          await installer.install(installable);

          expect(await installer.list()).toMatchObject(
            expect.arrayContaining([
              expect.objectContaining({
                name: installable.name,
              }),
            ]),
          );
        });

        expectToThrowInitializtionErrors(target, (installer) =>
          installer.reset(),
        );
      });

      describe("restart", () => {
        expectToThrowInitializtionErrors(target, (installer) =>
          installer.restart(),
        );
      });
    });
  });
});

describe("getPlaybookInstalledStatus", () => {
  test.skip("should work", () => {
    // TODO: implement this
  });
});
