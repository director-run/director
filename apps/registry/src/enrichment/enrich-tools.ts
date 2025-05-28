import { SimpleClient } from "@director.run/mcp/simple-client";
import { getLogger } from "@director.run/utilities/logger";
import type { inferRouterOutputs } from "@trpc/server";
import type { RegistryClient } from "../client";
import { type AppRouter } from "../routers/trpc";

type Entry =
  inferRouterOutputs<AppRouter>["entries"]["getEntries"]["entries"][number];

const logger = getLogger("enrich/tools");

// Takes in a registry client because this is an unsafe operation. So you run this in a VM and push the results back over http.
// It also likely won't run in vercel because of all the stdio depedenceis (python, ux...)
export async function enrichEntryTools(registryClient: RegistryClient) {
  const entries = await registryClient.entries.getEntries.query({
    pageIndex: 0,
    pageSize: 100,
  });

  for (const entry of entries.entries) {
    if (entry.lastConnectionAttemptedAt) {
      logger.info(`skipping ${entry.name}, already processed`);
      continue;
    }
    let tools;

    try {
      tools = await fetchEntryTools(entry);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error(`error enriching ${entry.name}: ${errorMessage}`);
      await registryClient.entries.updateEntry.mutate({
        id: entry.id,
        isConnectable: false,
        lastConnectionAttemptedAt: new Date(),
        lastConnectionError: errorMessage,
      });
      continue;
    }

    await registryClient.entries.updateEntry.mutate({
      id: entry.id,
      isConnectable: true,
      lastConnectionAttemptedAt: new Date(),
      lastConnectionError: undefined,
      tools,
    });
  }
}

async function fetchEntryTools(entry: Entry) {
  const transport = entry.transport;
  const client = new SimpleClient(`${entry.name}-client`);

  if (transport.type === "stdio") {
    logger.info(`processing ${entry.name}...`);
    await client.connectToStdio(transport.command, transport.args, {
      ...(process.env as Record<string, string>),
      ...transport.env,
    });
    logger.info(`connected to ${entry.name}, fetching tools...`);
    const tools = (await client.listTools()).tools.map(
      ({ name, description, inputSchema }) => ({
        name,
        description: description ?? "",
        inputSchema: {
          type: "object",
          properties: (inputSchema?.properties ?? {}) as Record<
            string,
            {
              type?: string;
              description?: string;
              default?: unknown;
              title?: string;
              anyOf?: unknown;
            }
          >,
          required: inputSchema?.required,
        },
      }),
    );
    logger.info(`closing client ${entry.name}`);
    await client.close();
    return tools;
  } else {
    logger.warn(
      `skipping ${entry.name}, unsupported transport type: ${transport.type}`,
    );
  }
}
