import type { AppRouter } from "@director.run/registry/routers/trpc/index";
import {
  DirectorCommand,
  makeOption,
} from "@director.run/utilities/cli/director-command";
import { actionWithErrorHandler } from "@director.run/utilities/cli/index";
import { spinnerWrap } from "@director.run/utilities/cli/loader";
import { input, password } from "@inquirer/prompts";
import type { inferRouterOutputs } from "@trpc/server";
import { gatewayClient, registryClient } from "../../client";

type RegistryEntry = inferRouterOutputs<AppRouter>["entries"]["getEntryByName"];

export function registerAddCommand(program: DirectorCommand) {
  return program
    .command("add <playbookId>")
    .description("Add a server to a playbook.")
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
        description: "add an HTTP server by specifying the url",
      }),
    )
    .addOption(
      makeOption({
        flags: "-c,--command <command>",
        description: "add a stdio server by specifying the command",
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
          playbookId: string,
          options: {
            entry: string;
            url: string;
            name: string;
            command: string;
          },
        ) => {
          if (options.entry) {
            console.log(`adding ${options.entry} to ${playbookId}`);
            await addServerFromRegistry(playbookId, options.entry);
          } else if (options.url) {
            if (!options.name) {
              throw new Error(
                "No server name provided. use --name to specify the name of the server",
              );
            }
            console.log(`adding ${options.url} to ${playbookId}`);
            await addServerFromUrl(playbookId, options.url, options.name);
          } else if (options.command) {
            if (!options.name) {
              throw new Error(
                "No server name provided. use --name to specify the name of the server",
              );
            }
            console.log(`adding ${options.command} to ${playbookId}`);

            const [command, ...args] = options.command.split(" ");

            await addServerFromStdio(playbookId, command, args, options.name);
          } else {
            console.warn(
              "No entry name or url provided. You must specify --entry or --url and --name, alternatively update the config file directly and restart the gateway:",
            );
            console.log();
          }
        },
      ),
    );
}

async function addServerFromStdio(
  playbookId: string,
  command: string,
  args: string[],
  name: string,
) {
  await spinnerWrap(async () => {
    await gatewayClient.store.addStdioServer.mutate({
      playbookId,
      name,
      command,
      args,
    });
  })
    .start("installing server...")
    .succeed(`Stdio server ${command} added to ${playbookId}`)
    .run();
}

async function addServerFromUrl(playbookId: string, url: string, name: string) {
  await spinnerWrap(async () => {
    await gatewayClient.store.addHTTPServer.mutate({
      playbookId,
      name,
      url,
    });
  })
    .start("installing server...")
    .succeed(`HTTP server ${url} added to ${playbookId}`)
    .run();
}

async function addServerFromRegistry(playbookId: string, entryName: string) {
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
    await gatewayClient.store.addRegistryServer.mutate({
      playbookId,
      registryEntryName: entryName,
      parameters,
    });
  })
    .start("installing server...")
    .succeed(`Registry entry ${entryName} added to ${playbookId}`)
    .run();
}

async function promptForParameters(
  entry: RegistryEntry,
): Promise<Record<string, string>> {
  const answers: Record<string, string> = {};

  if (!entry.parameters) {
    return {};
  }

  for (const parameter of entry.parameters) {
    if (parameter.required) {
      answers[parameter.name] = await password({
        message: parameter.name,
        mask: "*",
      });
    } else {
      answers[parameter.name] = await input({ message: parameter.name });
    }
  }

  return answers;
}
