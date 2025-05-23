import path from "node:path";
import { Gateway } from "@director.run/gateway/gateway";
import { proxyHTTPToStdio } from "@director.run/mcp/transport";
import { makeTable } from "@director.run/utilities/cli";
import {
  actionWithErrorHandler,
  printDirectorAscii,
} from "@director.run/utilities/cli";
import { isDevelopment } from "@director.run/utilities/env";
import { joinURL } from "@director.run/utilities/url";
import { Command } from "commander";
import { gatewayClient } from "../client";
import { env } from "../config";

export function registerCoreCommands(program: Command) {
  program
    .command("serve")
    .description("Start the director service")
    .action(
      actionWithErrorHandler(async () => {
        printDirectorAscii();

        await Gateway.start({
          port: env.GATEWAY_PORT,
          databaseFilePath: env.DB_FILE_PATH,
          registryURL: env.REGISTRY_URL,
          cliPath: path.join(__dirname, "../../bin/cli.ts"),
        });
      }),
    );

  program
    .command("ls")
    .description("List all proxies")
    .action(
      actionWithErrorHandler(async () => {
        const proxies = await gatewayClient.store.getAll.query();

        if (proxies.length === 0) {
          console.log("no proxies configured yet.");
        } else {
          const table = makeTable(["id", "name", "path"]);

          table.push(
            ...proxies.map((proxy) => [
              proxy.id,
              proxy.name,
              joinURL(env.GATEWAY_URL, proxy.path),
            ]),
          );

          console.log(table.toString());
        }
      }),
    );

  program
    .command("get <proxyId>")
    .description("Show proxy details")
    .action(
      actionWithErrorHandler(async (proxyId: string) => {
        const proxy = await gatewayClient.store.get.query({ proxyId });

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
            server.transport.type === "http"
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
      actionWithErrorHandler(async (name: string) => {
        const proxy = await gatewayClient.store.create.mutate({
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
      actionWithErrorHandler(async (proxyId: string) => {
        await gatewayClient.store.delete.mutate({
          proxyId,
        });

        console.log(`proxy ${proxyId} deleted`);
      }),
    );

  program
    .command("http2stdio <url>")
    .description("Proxy an HTTP connection to a stdio stream")
    .action(async (url) => {
      await proxyHTTPToStdio(url);
    });

  program
    .command("config")
    .description("Print configuration variables")
    .action(
      actionWithErrorHandler(() => {
        console.log(`config:`, env);
      }),
    );

  if (isDevelopment()) {
    program
      .command("reset")
      .description("Reset everything")
      .action(
        actionWithErrorHandler(async () => {
          await gatewayClient.store.purge.mutate();
        }),
      );
  }
}
