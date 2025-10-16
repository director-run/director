import fs from "node:fs/promises";
import path from "node:path";
import { ErrorCode } from "@director.run/utilities/error";
import { writeJSONFile } from "@director.run/utilities/json";
import { isFilePresent } from "@director.run/utilities/os";
import { expectToThrowAppError } from "@director.run/utilities/test";
import { faker } from "@faker-js/faker";
import { test, vi } from "vitest";
import { getClient } from "..";
import { type ClientName } from "..";
import { type ClaudeConfig, type ClaudeMCPServer } from "../claude";
import { type ClaudeCodeConfig } from "../claude-code";
import { type CursorConfig } from "../cursor";
import { type Installable } from "../types";
import { AbstractClient } from "../types";
import { type VSCodeConfig } from "../vscode";

export function createVSCodeConfig(entries: Array<Installable>): VSCodeConfig {
  return {
    mcp: {
      servers: entries.reduce(
        (acc, entry) => {
          acc[entry.name] = { url: entry.sseURL };
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
        acc[entry.name] = { url: entry.sseURL };
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
          args: ["-y", "@director.run/cli@latest", "http2stdio", entry.sseURL],
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
  sseURL: string;
  name: string;
  streamableURL: string;
} {
  return {
    sseURL: faker.internet.url(),
    name: [faker.hacker.noun(), faker.string.uuid()].join("-"),
    streamableURL: faker.internet.url(),
  };
}

export async function createConfigFile(params: {
  target: ClientName;
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

export async function deleteConfigFile(target: ClientName) {
  if (isFilePresent(getConfigPath(target))) {
    await fs.unlink(getConfigPath(target));
  }
}

export function getConfigPath(target: ClientName) {
  return path.join(__dirname, `${target}.config.test.json`);
}

export function createTestClient(
  target: ClientName,
  params: {
    isClientPresent: boolean;
  } = {
    isClientPresent: true,
  },
) {
  const installer = getClient(target, {
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
  target: ClientName,
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
