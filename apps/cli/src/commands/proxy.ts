import { Command } from "commander";
import { withErrorHandler } from "../helpers";
import { makeTable } from "../helpers";
import { trpc } from "../trpc";

export function registerProxyCommands(program: Command) {
  program
    .command("proxy:ls")
    .description("List all proxies")
    .action(
      withErrorHandler(async () => {
        const proxies = await trpc.store.getAll.query();

        if (proxies.length === 0) {
          console.log("no proxies configured yet.");
        } else {
          const table = makeTable(["id", "name", "url"]);

          table.push(
            ...proxies.map((proxy) => [proxy.id, proxy.name, proxy.url]),
          );

          console.log(table.toString());
        }
      }),
    );

  program
    .command("proxy:get <proxyId>")
    .description("Get the details of a proxy")
    .action(
      withErrorHandler(async (proxyId: string) => {
        const proxy = await trpc.store.get.query({ proxyId });

        if (!proxy) {
          console.error(`proxy ${proxyId} not found`);
          return;
        }

        console.log(`id=${proxy.id}`);
        console.log(`name=${proxy.name}`);

        const table = makeTable(["name", "transport", "url/command"]);

        table.push(
          ...proxy.servers.map((server) => [
            server.name,
            server.transport.type,
            server.transport.type === "sse"
              ? server.transport.url
              : [
                  server.transport.command,
                  ...(server.transport.args ?? []),
                ].join(" "),
          ]),
        );

        console.log(table.toString());
      }),
    );

  program
    .command("proxy:create <name>")
    .description("Create a new proxy server")
    .action(
      withErrorHandler(async (name: string) => {
        const proxy = await trpc.store.create.mutate({
          name,
          servers: [],
        });

        console.log(`proxy ${proxy.id} created`);
      }),
    );

  program
    .command("proxy:rm <proxyId>")
    .description("Create a new proxy server")
    .action(
      withErrorHandler(async (proxyId: string) => {
        // toto
        await trpc.store.delete.mutate({
          proxyId,
        });

        console.log(`proxy ${proxyId} deleted`);
      }),
    );
}
