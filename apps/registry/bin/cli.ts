import { Command } from "commander";
import packageJson from "../package.json";

const program = new Command();

program
  .name("registry")
  .description("Registry CLI CLI")
  .version(packageJson.version);

program.parse();
