import {} from "@director.run/utilities/cli/colors";
import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import { registerToolsCommand } from "./mcp/tools";

export function registerMCPCommands(program: DirectorCommand): void {
  const command = new DirectorCommand("mcp").description(
    "A client for interacting with proxies over MCP",
  );
  program.addCommand(command);
  registerToolsCommand(command);
}
