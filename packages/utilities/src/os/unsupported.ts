import { AbstractController, App } from "./abstract-controller";

export class UnsupportedController extends AbstractController {
  restartApp(app: App) {
    return Promise.resolve();
  }
  openFileInCode(filePath: string): Promise<void> {
    return Promise.resolve();
  }
  isCommandInPath(command: string): boolean {
    return false;
  }
  isAppInstalled(app: App): boolean {
    return false;
  }
  isFilePresent(filePath: string): boolean {
    return false;
  }
  isAppRunning(app: App): boolean {
    return false;
  }
  openUrl(url: string): Promise<void> {
    return Promise.resolve();
  }
  getConfigFileForApp(app: App): string {
    return "";
  }
  getMachineId(): string {
    return "";
  }
}
