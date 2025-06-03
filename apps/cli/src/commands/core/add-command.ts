import type { EntryGetParams } from "@director.run/registry/db/schema";
import { DirectorCommand } from "@director.run/utilities/cli/director-command";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { spinnerWrap } from "@director.run/utilities/cli/loader";
import { input } from "@inquirer/prompts";
import { gatewayClient, registryClient } from "../../client";

export function registerAddCommand(program: DirectorCommand) {
  return program
    .command("add <proxyId> <entryName>")
    .description("Add a server from the registry to a proxy.")
    .action(
      actionWithErrorHandler(async (proxyId: string, entryName: string) => {
        const entry = await spinnerWrap(() =>
          registryClient.entries.getEntryByName.query({
            name: entryName,
          }),
        )
          .start("fetching entry...")
          .succeed("Entry fetched.")
          .run();
        const parameters = await promptForParameters(entry);
        await spinnerWrap(async () => {
          const transport =
            await registryClient.entries.getTransportForEntry.query({
              entryName,
              parameters,
            });
          await gatewayClient.store.addServer.mutate({
            proxyId,
            server: {
              name: entryName,
              transport,
              source: {
                name: "registry",
                entryId: entry.id,
                entryData: entry,
              },
            },
          });
        })
          .start("installing server...")
          .succeed(`Registry entry ${entryName} added to ${proxyId}`)
          .run();
      }),
    );
}

async function promptForParameters(
  entry: EntryGetParams,
): Promise<Record<string, string>> {
  const answers: Record<string, string> = {};

  if (!entry.parameters) {
    return {};
  }

  for (const parameter of entry.parameters) {
    const answer = await input({ message: parameter.name });
    answers[parameter.name] = answer;
  }

  return answers;
}
