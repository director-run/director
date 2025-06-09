import { AppError, ErrorCode } from "@director.run/utilities/error";
import { App, isAppInstalled } from "@director.run/utilities/os";
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
): Promise<AbstractConfigurator> {
  switch (target) {
    case "claude":
      return ClaudeInstaller.create();
    case "cursor":
      return CursorInstaller.create();
    case "vscode":
      return VSCodeInstaller.create();
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

export async function isClientPresent(
  target: ConfiguratorTarget,
): Promise<boolean> {
  switch (target) {
    case ConfiguratorTarget.Claude:
      return await isAppInstalled(App.CLAUDE);
    case ConfiguratorTarget.Cursor:
      return await isAppInstalled(App.CURSOR);
    case ConfiguratorTarget.VSCode:
      return await isAppInstalled(App.VSCODE);
    default:
      throw new AppError(
        ErrorCode.BAD_REQUEST,
        `Client ${target} is not supported`,
      );
  }
}

export async function allClients() {
  return await Promise.all(
    Object.values(ConfiguratorTarget).map(async (target) => ({
      name: target,
      present: await isClientPresent(target),
    })),
  );
}
