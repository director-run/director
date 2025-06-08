import { ClaudeInstaller } from "./claude";
import { CursorInstaller } from "./cursor";
import type { AbstractInstaller } from "./types";
import { VSCodeInstaller } from "./vscode";

export enum InstallerTarget {
  Claude = "claude",
  Cursor = "cursor",
  VSCode = "vscode",
}

export function getInstaller(
  target: InstallerTarget,
): Promise<AbstractInstaller> {
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
    Object.values(InstallerTarget).map(getInstaller),
  );
  for (const installer of installers) {
    await installer.reset();
  }
}
