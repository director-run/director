import { Command } from "commander";
import packageJson from "../package.json";
import { getLogger } from "../src/helpers/logger";

const program = new Command();

const logger = getLogger("cli");

program
  .name(packageJson.name)
  .description("[DEPRECATED] CLI to operate mcp server")
  .version(packageJson.version);

program.parse();
