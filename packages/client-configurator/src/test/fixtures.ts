import fs from "node:fs/promises";
import path from "node:path";
import { ErrorCode } from "@director.run/utilities/error";
import { writeJSONFile } from "@director.run/utilities/json";
import { isFilePresent } from "@director.run/utilities/os";
import { expectToThrowAppError } from "@director.run/utilities/test";
import { faker } from "@faker-js/faker";
import { test, vi } from "vitest";
import { getConfigurator } from "..";
import { ConfiguratorTarget } from "..";
import {
  type ClaudeConfig,
  type ClaudeMCPServer,
  type ClaudeServerEntry,
} from "../claude";
import { type CursorConfig } from "../cursor";
import { type Installable } from "../types";
import { AbstractConfigurator } from "../types";
import { type VSCodeConfig } from "../vscode";

export function createVSCodeConfig(entries: Array<Installable>): VSCodeConfig {
  return {
    mcp: {
      servers: entries.reduce(
        (acc, entry) => {
          acc[entry.name] = { url: entry.url };
          return acc;
        },
        {} as Record<string, { url: string }>,
      ),
    },
  };
}

export function createCursorConfig(entries: Array<Installable>): CursorConfig {
  return {
    mcpServers: entries.reduce(
      (acc, entry) => {
        acc[entry.name] = { url: entry.url };
        return acc;
      },
      {} as Record<string, { url: string }>,
    ),
  };
}

export function createClaudeConfig(entries: ClaudeServerEntry[]): ClaudeConfig {
  return {
    mcpServers: entries.reduce(
      (acc, entry) => {
        acc[entry.name] = entry.transport;
        return acc;
      },
      {} as Record<string, ClaudeMCPServer>,
    ),
  };
}

export function createInstallable(): { url: string; name: string } {
  return {
    url: faker.internet.url(),
    name: [faker.hacker.noun(), faker.string.uuid()].join("-"),
  };
}

export async function createConfigFile(
  target: ConfiguratorTarget,
  config?: unknown,
) {
  switch (target) {
    case ConfiguratorTarget.VSCode:
      await writeJSONFile(
        getConfigPath(target),
        config ?? createVSCodeConfig([]),
      );
      break;
    case ConfiguratorTarget.Cursor:
      await writeJSONFile(
        getConfigPath(target),
        config ?? createCursorConfig([]),
      );
      break;
    case ConfiguratorTarget.Claude:
      await writeJSONFile(
        getConfigPath(target),
        config ?? createClaudeConfig([]),
      );
      break;
  }
}

export async function deleteConfigFile(target: ConfiguratorTarget) {
  if (isFilePresent(getConfigPath(target))) {
    await fs.unlink(getConfigPath(target));
  }
}

export function getConfigPath(target: ConfiguratorTarget) {
  return path.join(__dirname, `${target}.config.test.json`);
}

export function createTestInstaller(
  target: ConfiguratorTarget,
  params: {
    isClientPresent: boolean;
  } = {
    isClientPresent: true,
  },
) {
  const installer = getConfigurator(target, {
    configPath: getConfigPath(target),
  });
  // In CI, the client is not present, so we mock the method to return false
  vi.spyOn(installer, "isClientPresent").mockResolvedValue(
    params.isClientPresent,
  );
  // We do not mock the config present method because we want to rw properly
  return installer;
}

export function expectToThrowInitializtionErrors(
  target: ConfiguratorTarget,
  fn: (installer: AbstractConfigurator<unknown>) => Promise<unknown>,
) {
  test("should throw an AppError if the client is not present", async () => {
    const installer = createTestInstaller(target, {
      isClientPresent: false,
    });
    await expectToThrowAppError(() => fn(installer), {
      code: ErrorCode.COMMAND_NOT_FOUND,
      props: { name: installer.name, configPath: installer.configPath },
    });
  });

  // test("should throw an AppError if the config is not present", async () => {
  //   const installer = createTestInstaller(target);
  //   vi.spyOn(installer, "isClientConfigPresent").mockResolvedValue(false);
  //   await expectToThrowAppError(() => fn(installer), {
  //     code: ErrorCode.FILE_NOT_FOUND,
  //     props: { name: installer.name, configPath: installer.configPath },
  //   });
  // });
}
