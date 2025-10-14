import { AppError, ErrorCode } from "@director.run/utilities/error";
import { ClaudeInstaller } from "./claude";
import { ClaudeCodeInstaller } from "./claude-code";
import { CursorInstaller } from "./cursor";
import type { AbstractConfigurator } from "./types";
import { VSCodeInstaller } from "./vscode";

export enum ConfiguratorTarget {
  Claude = "claude",
  Cursor = "cursor",
  VSCode = "vscode",
  ClaudeCode = "claude-code",
}

export async function getAllClients() {
  return await Promise.all(
    allTargets().map(
      async (target) => await getConfigurator(target).getStatus(),
    ),
  );
}

export function getConfigurator(
  target: ConfiguratorTarget,
  params: {
    configPath?: string;
  } = {},
): AbstractConfigurator<unknown> {
  switch (target) {
    case "claude":
      return new ClaudeInstaller(params);
    case "cursor":
      return new CursorInstaller(params);
    case "vscode":
      return new VSCodeInstaller(params);
    case "claude-code":
      return new ClaudeCodeInstaller(params);
    default:
      throw new AppError(
        ErrorCode.BAD_REQUEST,
        `Client ${target} is not supported`,
      );
  }
}

export async function resetAllClients() {
  const installers = await Promise.all(
    allTargets().map((target) => getConfigurator(target)),
  );
  for (const installer of installers) {
    console.log("resetting", installer.name);
    if (await installer.isClientPresent()) {
      await installer.reset();
    } else {
      console.log("client not present:", installer.name);
    }
  }
}

export function allTargets() {
  return Object.values(ConfiguratorTarget);
}
