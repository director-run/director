import { Command } from "commander";
import packageJson from "../package.json";
import { getLogger } from "../src/helpers/logger";
import { seed } from "../src/services/db/seed";
import {} from "../src/services/installer/claude";
import {} from "../src/services/installer/cursor";
import { proxySSEToStdio } from "../src/services/proxy/proxySSEToStdio";

const program = new Command();

const logger = getLogger("cli");

program
  .name(packageJson.name)
  .description("[DEPRECATED] CLI to operate mcp server")
  .version(packageJson.version);

program.command("seed").action(() => {
  seed();
});

program
  .command("sse2stdio <sse_url>")
  .description("Proxy a SSE connection to a stdio stream")
  .action(async (sseUrl) => {
    await proxySSEToStdio(sseUrl);
  });

program.parse();
