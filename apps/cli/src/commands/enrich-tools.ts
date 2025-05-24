import { SimpleClient } from "@director.run/mcp/simple-client";
import { type EntryGetParams } from "@director.run/registry/db/schema";
import {} from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import { registryClient } from "../client";

const logger = getLogger("enrich-tools");

export async function enrichTools() {
  const entries = await registryClient.entries.getEntries.query({
    pageIndex: 0,
    pageSize: 10,
  });

  for (const entry of entries.entries) {
    try {
      await fetchToolsForEntry(entry);
    } catch (error) {
      logger.error(`error enriching ${entry.name}: ${error}`);
    }
  }
}

async function fetchToolsForEntry(entry: EntryGetParams) {
  const transport = entry.transport;
  const client = new SimpleClient(`${entry.name}-client`);
  logger.info(`processing ${entry.name}...`);

  if (transport.type === "stdio") {
    await client.connectToStdio(transport.command, transport.args, {
      ...process.env,
      ...transport.env,
    });
    logger.info(`connected to ${entry.name}, fetching tools...`);
    const tools = await client.listTools();
    //   console.log(JSON.stringify(tools, null, 2));
    logger.info(`closing client ${entry.name}`);
    await client.close();
  } else {
    logger.warn(
      `skipping ${entry.name}, unsupported transport type: ${transport.type}`,
    );
  }
}
