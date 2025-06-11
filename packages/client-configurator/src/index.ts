import { AppError, ErrorCode } from "@director.run/utilities/error";
import {} from "@director.run/utilities/os";
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
): AbstractConfigurator<unknown> {
  switch (target) {
    case "claude":
      return new ClaudeInstaller();
    case "cursor":
      return new CursorInstaller();
    case "vscode":
      return new VSCodeInstaller();
    default:
      throw new AppError(
        ErrorCode.BAD_REQUEST,
        `Client ${target} is not supported`,
      );
  }
}

export async function resetAllClients() {
  const installers = await Promise.all(
    Object.values(ConfiguratorTarget).map(getConfigurator),
  );
  for (const installer of installers) {
    await installer.reset();
  }
}

export async function allClientStatuses() {
  return await Promise.all(
    Object.values(ConfiguratorTarget)
      .map(getConfigurator)
      .map((c) => c.getStatus()),
  );
}
