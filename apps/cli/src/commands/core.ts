import { Gateway } from "@director.run/gateway/gateway";
import {
  getSSEPathForProxy,
  getStreamablePathForProxy,
} from "@director.run/gateway/helpers";
import { proxyHTTPToStdio } from "@director.run/mcp/transport";
import { blue, whiteBold } from "@director.run/utilities/cli/colors";
import {
  DirectorCommand,
  makeOption,
} from "@director.run/utilities/cli/director-command";
import { makeTable } from "@director.run/utilities/cli/index";
import {
  actionWithErrorHandler,
  printDirectorAscii,
} from "@director.run/utilities/cli/index";
import { loader } from "@director.run/utilities/cli/loader";
import { openUrl } from "@director.run/utilities/os";
import { joinURL } from "@director.run/utilities/url";
import { gatewayClient } from "../client";
import { env } from "../env";
import { registerAddCommand } from "./core/add-command";
import { registerRemoveCommand } from "./core/remove-command";

export async function startGateway() {
  await Gateway.start({
    port: env.GATEWAY_PORT,
    databaseFilePath: env.DB_FILE_PATH,
    registryURL: env.REGISTRY_API_URL,
    allowedOrigins: [env.STUDIO_URL, /^https?:\/\/localhost(:\d+)?$/],
  });
}

export function registerCoreCommands(program: DirectorCommand): void {
  program
    .command("serve")
    .description("Start the web service")
    .action(
      actionWithErrorHandler(async () => {
        try {
          printDirectorAscii();
          await startGateway();
        } catch (error) {
          console.error("Fatal error starting gateway", error);
          process.exit(1);
        }
      }),
    );

  program
    .command("studio")
    .description("Open the UI in your browser")
    .action(
      actionWithErrorHandler(async () => {
        const spinner = loader();
        spinner.start("opening studio...");
        try {
          await gatewayClient.health.query();
        } catch (error) {
          spinner.fail(
            "Failed to connect to gateway. Have you ran `director serve`?",
          );
          process.exit(1);
        }
        try {
          await openUrl(env.STUDIO_URL);
        } catch (error) {
          spinner.fail(`failed to open ${env.STUDIO_URL}, try manually`);
        }
        spinner.stop();
      }),
    );

  program
    .command("ls")
    .description("List proxies")
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
    .command("destroy <proxyId>")
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
    .command("connect <proxyId>")
    .description("connect a proxy to a MCP client")
    .addOption(
      makeOption({
        flags: "-t,--target <target>",
        description: "target client",
        choices: ["claude", "cursor"],
      }),
    )
    .action(
      actionWithErrorHandler(
        async (proxyId: string, options: { target: "claude" | "cursor" }) => {
          if (options.target) {
            const result = await gatewayClient.installer.byProxy.install.mutate(
              {
                proxyId,
                baseUrl: env.GATEWAY_URL,
                client: options.target,
              },
            );
            console.log(result);
          } else {
            console.log();
            console.log(
              blue("--target not provided, manual connection details:"),
            );
            console.log();
            const proxy = await gatewayClient.store.get.query({ proxyId });
            const baseUrl = env.GATEWAY_URL;
            const sseURL = joinURL(baseUrl, getSSEPathForProxy(proxy.id));
            const streamableURL = joinURL(
              baseUrl,
              getStreamablePathForProxy(proxy.id),
            );

            const stdioCommand = {
              command: env.DIRECTOR_CLI_PATH,
              args: ["http2stdio", streamableURL],
              env: {
                LOG_LEVEL: "silent",
              },
            };

            console.log(whiteBold("SSE URL:") + " " + sseURL);
            console.log(whiteBold("Streamable URL:") + " " + streamableURL);
            console.log(
              whiteBold("Stdio Command:"),
              JSON.stringify(stdioCommand, null, 2),
            );
            console.log();
          }
        },
      ),
    );

  program
    .command("disconnect <proxyId>")
    .description("disconnect a proxy from an MCP client")
    .addOption(
      makeOption({
        flags: "-t,--target <target>",
        description: "target client",
        choices: ["claude", "cursor"],
      }).makeOptionMandatory(),
    )
    .action(
      actionWithErrorHandler(
        async (proxyId: string, options: { target: "claude" | "cursor" }) => {
          console.log(
            await gatewayClient.installer.byProxy.uninstall.mutate({
              proxyId,
              client: options.target,
            }),
          );
        },
      ),
    );

  registerAddCommand(program);
  registerRemoveCommand(program);

  program
    .command("http2stdio <url>")
    .description("Proxy an HTTP connection to a stdio stream")
    .action(async (url) => {
      await proxyHTTPToStdio(url);
    });

  program
    .command("env")
    .description("Print environment variables")
    .action(
      actionWithErrorHandler(() => {
        console.log(`env`, env);
      }),
    );

  program
    .debugCommand("reset")
    .description("Delete proxies & clear the config file")
    .action(
      actionWithErrorHandler(async ({ target }) => {
        await gatewayClient.store.purge.mutate();
      }),
    );
}
