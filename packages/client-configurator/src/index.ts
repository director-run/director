import { AppError, ErrorCode } from "@director.run/utilities/error";
import { ClaudeInstaller } from "./claude";
import { CursorInstaller } from "./cursor";
import type { AbstractConfigurator } from "./types";
import { VSCodeInstaller } from "./vscode";

export enum ConfiguratorTarget {
  Claude = "claude",
  Cursor = "cursor",
  VSCode = "vscode",
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
    default:
      throw new AppError(
        ErrorCode.BAD_REQUEST,
        `Client ${target} is not supported`,
      );
  }
}

export async function resetAllClients() {
  const installers = await Promise.all(
    Object.values(ConfiguratorTarget).map((target) => getConfigurator(target)),
  );
  for (const installer of installers) {
    await installer.reset();
  }
}

export async function allClientStatuses() {
  return await Promise.all(
    Object.values(ConfiguratorTarget)
      .map((target) => getConfigurator(target))
      .map((c) => c.getStatus()),
  );
}
