import { CONFIG_FILE_PATH, getLogger, readConfig } from "@director/core";
import {} from "@director/core";
import { Command } from "commander";

const config = await readConfig(CONFIG_FILE_PATH);
const program = new Command();

const logger = getLogger("cli");

// Print out the full command that was called with all arguments
logger.info(`Hello backend`);
