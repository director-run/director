import { ClaudeInstaller } from "./claude";
import { CursorInstaller } from "./cursor";
import { VSCodeInstaller } from "./vscode";

export function getInstaller(target: "claude" | "cursor" | "vscode") {
  switch (target) {
    case "claude":
      return ClaudeInstaller.create();
    case "cursor":
      return CursorInstaller.create();
    case "vscode":
      return VSCodeInstaller.create();
  }
}
