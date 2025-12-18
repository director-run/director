import { type ClientId } from "@director.run/client-configurator/client-store";
import { proxyHTTPToStdio } from "@director.run/mcp/transport";
import {
  DirectorCommand,
  makeOption,
} from "@director.run/utilities/cli/director-command";
import { makeTable } from "@director.run/utilities/cli/index";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { joinURL } from "@director.run/utilities/url";
import { gatewayClient } from "../client";
import { clientStore } from "../client-store";
import { env } from "../env";
import { registerAddCommand } from "./core/add";
import { registerAuthCommand } from "./core/authenticate";
import { registerConnectCommand } from "./core/connect";
import { registerDebugCommands } from "./core/debug";
import { registerConfigCommand } from "./core/env";
import { registerGetCommand } from "./core/get";
import { registerLoginCommand } from "./core/login";
import { registerRemoveCommand } from "./core/remove";
import { registerSignupCommand } from "./core/signup";
import { registerStudioCommand } from "./core/studio";
import { registerUpdateCommand } from "./core/update";

export function registerCoreCommands(program: DirectorCommand): void {
  registerStudioCommand(program);
  registerSignupCommand(program);
  registerLoginCommand(program);

  program
    .command("ls")
    .alias("list")
    .description("List playbooks")
    .action(
      actionWithErrorHandler(async () => {
        const playbooks = await gatewayClient.store.getAll.query();

        if (playbooks.length === 0) {
          console.log("no playbooks configured yet.");
        } else {
          const table = makeTable(["id", "name", "path"]);

          table.push(
            ...playbooks.map((playbook) => [
              playbook.id,
              playbook.name,
              joinURL(env.GATEWAY_URL, playbook.paths.streamable),
            ]),
          );

          console.log(table.toString());
        }
      }),
    );

  registerGetCommand(program);
  registerAuthCommand(program);

  program
    .command("create <name>")
    .description("Create a new playbook")
    .action(
      actionWithErrorHandler(async (name: string) => {
        const playbook = await gatewayClient.store.create.mutate({
          name,
        });

        console.log(`playbook ${playbook.id} created`);
      }),
    );

  program
    .command("destroy <playbookId>")
    .description("Delete a playbook")
    .action(
      actionWithErrorHandler(async (playbookId: string) => {
        await gatewayClient.store.delete.mutate({
          playbookId: playbookId,
        });

        console.log(`playbook ${playbookId} deleted`);
      }),
    );

  registerConnectCommand(program);

  program
    .command("disconnect <playbookId>")
    .description("Disconnect a playbook from an MCP client")
    .addOption(
      makeOption({
        flags: "-t,--target <target>",
        description: "target client",
      }).makeOptionMandatory(),
    )
    .action(
      actionWithErrorHandler(
        async (playbookId: string, options: { target: string }) => {
          // Verify playbook exists via gateway
          const playbook = await gatewayClient.store.get.query({
            playbookId: playbookId,
          });
          // Uninstall directly using client configurator (no TRPC)
          await clientStore.uninstall(options.target as ClientId, playbook.id);
        },
      ),
    );

  registerAddCommand(program);
  registerRemoveCommand(program);
  registerUpdateCommand(program);

  program
    .command("http2stdio <url>")
    .description("Proxy an HTTP connection to a stdio stream")
    .action(async (url) => {
      await proxyHTTPToStdio(url);
    });

  registerConfigCommand(program);

  registerDebugCommands(program);
}
