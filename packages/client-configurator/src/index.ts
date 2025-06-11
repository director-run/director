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

export async function allClientStatuses() {
  return await Promise.all(
    allTargets()
      .map((target) => getConfigurator(target))
      .map((c) => c.getStatus()),
  );
}

export function allTargets() {
  return Object.values(ConfiguratorTarget);
}

export async function getProxyInstalledStatus(
  proxyId: string,
): Promise<Record<ConfiguratorTarget, boolean>> {
  const installers = await Promise.all(
    allTargets().map((target) => getConfigurator(target)),
  );

  const result: Record<ConfiguratorTarget, boolean> = {
    [ConfiguratorTarget.Claude]: false,
    [ConfiguratorTarget.Cursor]: false,
    [ConfiguratorTarget.VSCode]: false,
  };

  await Promise.all(
    installers.map(async (installer) => {
      const isInstalled = await installer.isInstalled(proxyId);
      result[installer.name as ConfiguratorTarget] = isInstalled;
    }),
  );

  return result;
}
