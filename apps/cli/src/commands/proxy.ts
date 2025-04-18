import { Command } from "commander";
import { withErrorHandler } from "../helpers";
import { makeTable } from "../helpers";
import { proxySSEToStdio } from "../proxySSEToStdio";
import { trpc } from "../trpc";

export function registerProxyCommands(program: Command) {
  program
    .command("ls")
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
    .command("get <proxyId>")
    .description("Show proxy details")
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
    .command("create <name>")
    .description("Create a new proxy")
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
    .command("rm <proxyId>")
    .description("Delete a proxy")
    .action(
      withErrorHandler(async (proxyId: string) => {
        await trpc.store.delete.mutate({
          proxyId,
        });

        console.log(`proxy ${proxyId} deleted`);
      }),
    );

  program
    .command("server:add <proxyId> <entryId>")
    .description("Add a server from the registry to a proxy.")
    .action(
      withErrorHandler(async (proxyId: string, entryId: string) => {
        const proxy = await trpc.store.addServerFromRegistry.mutate({
          proxyId,
          entryId,
        });
        console.log(`Registry entry ${entryId} added to ${proxy.id}`);
      }),
    );

  program
    .command("server:remove <proxyId> <serverName>")
    .description("Remove a server from a proxy")
    .action(
      withErrorHandler(async (proxyId: string, serverName: string) => {
        const proxy = await trpc.store.removeServer.mutate({
          proxyId,
          serverName,
        });
        console.log(`Server ${serverName} added to ${proxy.id}`);
      }),
    );

  program
    .command("sse2stdio <sse_url>")
    .description("Proxy a SSE connection to a stdio stream")
    .action(async (sseUrl) => {
      await proxySSEToStdio(sseUrl);
    });
}
