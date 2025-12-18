import fs from "node:fs/promises";
import path from "node:path";
import { ErrorCode } from "@director.run/utilities/error";
import { writeJSONFile } from "@director.run/utilities/json";
import { isFilePresent } from "@director.run/utilities/os";
import { expectToThrowAppError } from "@director.run/utilities/test";
import { faker } from "@faker-js/faker";
import { test, vi } from "vitest";
import {
  type ClaudeConfig,
  ClaudeInstaller,
  type ClaudeMCPServer,
} from "../claude";
import { type ClaudeCodeConfig, ClaudeCodeInstaller } from "../claude-code";
import { type CursorConfig, CursorInstaller } from "../cursor";
import { type Installable } from "../types";
import { AbstractClient } from "../types";
import { type VSCodeConfig, VSCodeInstaller } from "../vscode";

export const TEST_CONFIG_KEY_PREFIX = "drctr-test__";

export function createVSCodeConfig(entries: Array<Installable>): VSCodeConfig {
  return {
    mcp: {
      servers: entries.reduce(
        (acc, entry) => {
          acc[entry.name] = { url: entry.streamableURL };
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
        acc[entry.name] = { url: entry.streamableURL };
        return acc;
      },
      {} as Record<string, { url: string }>,
    ),
  };
}

export function createClaudeConfig(entries: Array<Installable>): ClaudeConfig {
  return {
    mcpServers: entries.reduce(
      (acc, entry) => {
        acc[entry.name] = {
          command: "npx",
          args: [
            "-y",
            "@director.run/cli@latest",
            "http2stdio",
            entry.streamableURL,
          ],
          env: {
            LOG_LEVEL: "silent",
          },
        };
        return acc;
      },
      {} as Record<string, ClaudeMCPServer>,
    ),
  };
}

export function createClaudeCodeConfig(
  entries: Array<Installable>,
): ClaudeCodeConfig {
  return {
    mcpServers: entries.reduce(
      (acc, entry) => {
        acc[entry.name] = { type: "http", url: entry.streamableURL };
        return acc;
      },
      {} as Record<string, { type: "http"; url: string }>,
    ),
  };
}

export function createInstallable(): {
  name: string;
  streamableURL: string;
} {
  return {
    name: [faker.hacker.noun(), faker.string.uuid()].join("-"),
    streamableURL: faker.internet.url(),
  };
}

export async function createConfigFile(params: {
  target: string;
  config?: unknown;
  entries?: Array<Installable>;
}) {
  const { target, config, entries } = params;
  switch (target) {
    case "vscode":
      await writeJSONFile(
        getConfigPath(target),
        config ?? createVSCodeConfig(entries ?? []),
      );
      break;
    case "cursor":
      await writeJSONFile(
        getConfigPath(target),
        config ?? createCursorConfig(entries ?? []),
      );
      break;
    case "claude":
      await writeJSONFile(
        getConfigPath(target),
        config ?? createClaudeConfig(entries ?? []),
      );
      break;
    case "claude-code":
      await writeJSONFile(
        getConfigPath(target),
        config ?? createClaudeCodeConfig(entries ?? []),
      );
      break;
  }
}

export async function deleteConfigFile(target: string) {
  if (isFilePresent(getConfigPath(target))) {
    await fs.unlink(getConfigPath(target));
  }
}

export function getConfigPath(target: string) {
  return path.join(__dirname, `${target}.config.test.json`);
}

export function createTestClient(
  target: string,
  params: {
    isClientPresent: boolean;
  } = {
    isClientPresent: true,
  },
) {
  // const installer = getClient(target, {
  //   configPath: getConfigPath(target),
  // });

  let installer: AbstractClient<unknown>;
  switch (target) {
    case "vscode":
      installer = new VSCodeInstaller({
        configPath: getConfigPath(target),
        configKeyPrefix: TEST_CONFIG_KEY_PREFIX,
      });
      break;
    case "cursor":
      installer = new CursorInstaller({
        configPath: getConfigPath(target),
        configKeyPrefix: TEST_CONFIG_KEY_PREFIX,
      });
      break;
    case "claude":
      installer = new ClaudeInstaller({
        configPath: getConfigPath(target),
        configKeyPrefix: TEST_CONFIG_KEY_PREFIX,
      });
      break;
    case "claude-code":
      installer = new ClaudeCodeInstaller({
        configPath: getConfigPath(target),
        configKeyPrefix: TEST_CONFIG_KEY_PREFIX,
      });
      break;
    default:
      throw new Error(`Unknown target: ${target}`);
  }

  // In CI, the client is not present, so we mock the method to return false
  vi.spyOn(installer, "isClientPresent").mockResolvedValue(
    params.isClientPresent,
  );
  // We do not mock the config present method because we want to rw properly
  return installer;
}

export function expectToThrowInitializtionErrors(
  target: string,
  fn: (installer: AbstractClient<unknown>) => Promise<unknown>,
) {
  test("should throw an AppError if the client is not present", async () => {
    const installer = createTestClient(target, {
      isClientPresent: false,
    });
    await expectToThrowAppError(() => fn(installer), {
      code: ErrorCode.COMMAND_NOT_FOUND,
      props: { name: installer.name, configPath: installer.configPath },
    });
  });
}
