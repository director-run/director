import _ from "lodash";
import slugify from "slugify";
import { type EntryCreateParams } from "../db/schema";
import { type Store } from "../db/store";
import { PulseMCPClient } from "../importers/clients/pulsemcp";

export async function importFromPulseMCP(store: Store) {
  const client = new PulseMCPClient();

  const servers = await client.fetchAllServers();

  const entries: EntryCreateParams[] = servers
    .filter(
      (server) =>
        server.source_code_url && server.source_code_url.includes("github.com"),
    )
    .map((server) => {
      return {
        name: slugify(server.name),
        title: server.name,
        description: server.short_description,
        transport: {
          type: "http",
          url: "http://example.com",
        },
        homepage: server.source_code_url,
        parameters: [],
      };
    });

  const uniqueEntries = _.uniqBy(entries, "name");

  await store.entries.addEntries(uniqueEntries, { state: "published" });
}
