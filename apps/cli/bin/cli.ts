import { Command, Option } from "commander";
import packageJson from "../package.json";

const program = new Command();

program
  .name(packageJson.name)
  .description("Director CLI")
  .version(packageJson.version);

program
  .command("ls")
  .alias("list")
  .description("List all configured MCP proxies")
  .action(async () => {
    console.log("todo");
  });

program
  .command("start")
  .description("Start the proxy server for all proxies")
  .action(async () => {
    console.log("todo");
  });

program.command("debug").action(async () => {
  console.log("todo");
});

program.command("seed").action(() => {
  console.log("todo");
});

program
  .command("sse2stdio <sse_url>")
  .description("Proxy a SSE connection to a stdio stream")
  .action(async (sseUrl) => {
    console.log("todo");
  });

function mandatoryOption(flags: string, description?: string) {
  const option = new Option(flags, description);
  option.makeOptionMandatory(true);
  return option;
}

program
  .command("install <proxyId>")
  .description("Install an mcp server to a client app")
  .addOption(
    mandatoryOption("-c, --client [type]", "client to install to").choices([
      "claude",
      "cursor",
    ]),
  )
  .action(async (proxyId, options) => {
    console.log("todo");
  });

program
  .command("uninstall <proxyId>")
  .description("Uninstall an mcp server from a client app")
  .addOption(
    mandatoryOption("-c, --client [type]", "client to uninstall from").choices([
      "claude",
      "cursor",
    ]),
  )
  .action(async (proxyId, options) => {
    console.log("todo");
  });

program
  .command("claude:restart")
  .description("Restart Claude")
  .action(async () => {
    console.log("todo");
  });

program.parse();
