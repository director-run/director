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
      throw new Error(`Unsupported installer target: ${target}`);
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
