import type { ProxyTransport } from "@director.run/mcp/types";
import { createRegistryClient } from "@director.run/registry/client";
import type { EntryParameter } from "@director.run/registry/db/schema";
import {
  optionalStringSchema,
  requiredStringSchema,
} from "@director.run/utilities/schema";
import { t } from "@director.run/utilities/trpc";
import { z } from "zod";
import type { ProxyServerStore } from "../../proxy-server-store";
const REGISTRY_ENTRY_NAME_PREFIX = "registry__";
import {
  ClaudeInstaller,
  isClaudeInstalled,
} from "@director.run/installer/claude";
import { isCursorInstalled } from "@director.run/installer/cursor";
import type { ProxyServer } from "@director.run/mcp/proxy-server";
import { getLogger } from "@director.run/utilities/logger";

const logger = getLogger("registry-router");

const parameterToZodSchema = (parameter: EntryParameter) => {
  if (parameter.type === "string") {
    return parameter.required ? requiredStringSchema : optionalStringSchema;
  } else {
    throw new Error(`Unsupported parameter type: ${parameter.type}`);
  }
};

export function createRegistryRouter({
  registryURL,
  proxyStore,
}: { proxyStore: ProxyServerStore; registryURL: string }) {
  const registryClient = createRegistryClient(registryURL);

  return t.router({
    getEntries: t.procedure
      .input(
        z.object({
          pageIndex: z.number().min(0),
          pageSize: z.number().min(1),
        }),
      )
      .query(({ input }) => registryClient.entries.getEntries.query(input)),

    getEntryByName: t.procedure
      .input(z.object({ name: z.string() }))
      .query(({ input }) => registryClient.entries.getEntryByName.query(input)),

    addServerFromRegistry: t.procedure
      .input(
        z.object({
          proxyId: z.string(),
          entryName: z.string(),
          parameters: z.record(z.string(), z.string()).optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const entry = await registryClient.entries.getEntryByName.query({
          name: input.entryName,
        });

        let transport: ProxyTransport;

        if (entry.transport.type === "stdio") {
          const env: Record<string, string> = {};
          let args: string[] = [...entry.transport.args];
          // only stdio transports have parameters
          entry.parameters?.forEach((parameter) => {
            const inputValue = input.parameters?.[parameter.name];
            const schema = parameterToZodSchema(parameter);

            schema.parse(inputValue);

            if (!inputValue) {
              // Not a required parameter, so we can skip it
              return;
            }

            // Substitute the parameter into the transport command
            if (parameter.scope === "env") {
              env[parameter.name] = inputValue;
            } else if (parameter.scope === "args") {
              args = args.map((arg) => arg.replace(parameter.name, inputValue));
            }
          });

          transport = {
            env,
            args,
            type: "stdio",
            command: entry.transport.command,
          };
        } else {
          transport = {
            type: "http",
            url: entry.transport.url,
          };
        }

        const newProxy = await proxyStore.addServer(input.proxyId, {
          name: `${REGISTRY_ENTRY_NAME_PREFIX}${entry.name}`,
          transport,
        });

        await restartConnectedClients(newProxy);

        return newProxy.toPlainObject();
      }),
  });
}

async function restartConnectedClients(proxy: ProxyServer) {
  logger.info(`restarting connected clients for ${proxy.id}`);

  const serverName = proxy.id.startsWith(REGISTRY_ENTRY_NAME_PREFIX)
    ? proxy.id.slice(REGISTRY_ENTRY_NAME_PREFIX.length)
    : proxy.id;

  if (isClaudeInstalled()) {
    logger.info(`claude is installed`);
    const claudeInstaller = await ClaudeInstaller.create();
    if (claudeInstaller.isInstalled(serverName)) {
      logger.info(`${proxy.id} is intalled in claude`);
    } else {
      logger.info(`${proxy.id} is not installed in claude`);
    }
  }
  if (isCursorInstalled()) {
    logger.info(`cursor is installed`);
    const cursorInstaller = await ClaudeInstaller.create();
    if (cursorInstaller.isInstalled(serverName)) {
      logger.info(`${proxy.id} is intalled in cursor`);
    } else {
      logger.info(`${proxy.id} is not installed in cursor`);
    }
  }
}
