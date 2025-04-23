import { exec } from "node:child_process";
import { promisify } from "node:util";
import { sleep } from "bun";
import { getLogger } from "./logger";

const execAsync = promisify(exec);

const logger = getLogger("restartApp");

export enum App {
  CLAUDE = "Claude",
}

export async function restartApp(app: App): Promise<void> {
  logger.info(`restarting ${app}...`);
  await execAsync(`osascript -e 'tell application "${app}" to quit'`);
  await sleep(2000);
  await execAsync(`open -a ${app}`);
  logger.info(`${app} has been restarted`);
}
