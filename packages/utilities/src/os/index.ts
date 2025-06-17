import { getLogger } from "../logger";
import { AbstractController, App } from "./abstract-controller";
import { MacOSController } from "./macos";
import { UnsupportedController } from "./unsupported";

let controller: AbstractController;

const logger = getLogger("os");

if (process.platform === "darwin") {
  controller = new MacOSController();
} else {
  logger.warn(
    `unsupported platform: ${process.platform}, automatic client configuration will not work`,
  );
  controller = new UnsupportedController();
}

export const os = controller;
export { App };
