import { ClaudeInstaller } from "./claude";
import { CursorInstaller } from "./cursor";
import { VSCodeInstaller } from "./vscode";

export function createInstallers() {
  return {
    claude: ClaudeInstaller.create(),
    cursor: CursorInstaller.create(),
    vscode: VSCodeInstaller.create(),
  };
}
