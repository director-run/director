import type { EntryGetParams } from "@director.run/registry/db/schema";
import { whiteBold } from "@director.run/utilities/cli/colors";
import {
  DirectorCommand,
  makeOption,
} from "@director.run/utilities/cli/director-command";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { spinnerWrap } from "@director.run/utilities/cli/loader";
import { input } from "@inquirer/prompts";
import { gatewayClient, registryClient } from "../../client";
import { env } from "../../env";

export function registerAddCommand(program: DirectorCommand) {
  return program
    .command("add <proxyId>")
    .description("Add a server to a proxy.")
    .addOption(
      makeOption({
        flags: "-e,--entry <entryName>",
        description:
          "add a server from the registry by specifying the entry name",
      }),
    )
    .addOption(
      makeOption({
        flags: "-u,--url <url>",
        description: "add a streamable or sse server by specifying the url",
      }),
    )
    .addOption(
      makeOption({
        flags: "-n,--name <serverName>",
        description:
          "the name of the server as it'll appear in the config file",
      }),
    )
    .action(
      actionWithErrorHandler(
        async (
          proxyId: string,
          options: { entry: string; url: string; name: string },
        ) => {
          if (options.entry) {
            console.log(`adding ${options.entry} to ${proxyId}`);
            await addServerFromRegistry(proxyId, options.entry);
          } else if (options.url) {
            if (!options.name) {
              throw new Error(
                "No server name provided. use --name to specify the name of the server",
              );
            }
            console.log(`adding ${options.url} to ${proxyId}`);
            await addServerFromUrl(proxyId, options.url, options.name);
          } else {
            console.warn(
              "No entry name or url provided. You must speciy --entry or --url and --name, alternatively update the config file directly and restart the gateway:",
            );
            console.log();
            console.log(
              `${whiteBold("CONFIG_FILE_PATH:")} ${env.CONFIG_FILE_PATH}`,
            );
            console.log();
          }
        },
      ),
    );
}

async function addServerFromUrl(proxyId: string, url: string, name: string) {
  await spinnerWrap(async () => {
    await gatewayClient.store.addServer.mutate({
      proxyId,
      server: {
        name,
        transport: {
          type: "http",
          url,
        },
      },
    });
  })
    .start("installing server...")
    .succeed(`HTTP server ${url} added to ${proxyId}`)
    .run();
}

async function addServerFromRegistry(proxyId: string, entryName: string) {
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
    const transport = await registryClient.entries.getTransportForEntry.query({
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
