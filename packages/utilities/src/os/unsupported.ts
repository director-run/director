import { AbstractController, App } from "./abstract-controller";

export class UnsupportedController extends AbstractController {
  restartApp(_app: App) {
    return Promise.resolve();
  }
  openFileInCode(_filePath: string): Promise<void> {
    return Promise.resolve();
  }
  isCommandInPath(_command: string): boolean {
    return false;
  }
  isAppInstalled(_app: App): boolean {
    return false;
  }
  isFilePresent(_filePath: string): boolean {
    return false;
  }
  isAppRunning(_app: App): boolean {
    return false;
  }
  openUrl(_url: string): Promise<void> {
    return Promise.resolve();
  }
  getConfigFileForApp(_app: App): string {
    return "";
  }
}
