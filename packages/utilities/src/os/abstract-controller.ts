export enum App {
  CLAUDE = "Claude",
  CURSOR = "Cursor",
  VSCODE = "Visual Studio Code",
}

export abstract class AbstractController {
  abstract restartApp(app: App): Promise<void>;
  abstract openFileInCode(filePath: string): Promise<void>;
  abstract isCommandInPath(command: string): boolean;
  abstract isAppInstalled(app: App): boolean;
  abstract isFilePresent(filePath: string): boolean;
  abstract isAppRunning(app: App): boolean;
  abstract openUrl(url: string): Promise<void>;
  abstract getConfigFileForApp(app: App): string;
}
