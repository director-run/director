import { getLogger } from "@director.run/utilities/logger";
import type { inferRouterOutputs } from "@trpc/server";
import type { RegistryClient } from "../client";
import { type AppRouter } from "../routers/trpc";
import { type Transport } from "../schemas";

type Entry =
  inferRouterOutputs<AppRouter>["entries"]["getEntries"]["entries"][number];

const logger = getLogger("enrich/transports");

export async function enrichEntryTransports(registryClient: RegistryClient) {
  // TODO: make sure they have a readme?
  const entries = await registryClient.entries.getEntries.query({
    pageIndex: 0,
    pageSize: 100,
  });

  for (const entry of entries.entries) {
    const transport = await extractTransportForEntry(entry);
    logger.info(`enriching ${entry.name} with transport ${transport.type}`);
    await registryClient.entries.updateEntry.mutate({
      id: entry.id,
      transport,
    });
  }
}

function extractTransportForEntry(_entry: Entry): Promise<Transport> {
  return Promise.resolve({
    type: "http",
    url: "http://some-extracted-transport-url.com",
  });
}
