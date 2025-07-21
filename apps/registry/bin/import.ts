import { readFile, writeFile } from "fs/promises";
import slugify from "slugify";
import { env } from "../src/config";
import { type EntryCreateParams } from "../src/db/schema";
import { createStore } from "../src/db/store";
import { PulseMCPClient } from "../src/importers/clients/pulsemcp";
import type { Server } from "../src/importers/clients/pulsemcp";

const client = new PulseMCPClient();

async function fetchAllServers(): Promise<Server[]> {
  const allServers: Server[] = [];
  let offset = 0;
  const count_per_page = 5000;
  let total_count = 0;
  let hasMore = true;

  while (hasMore) {
    const response = await client.listServers({ count_per_page, offset });
    allServers.push(...response.servers);
    total_count = response.total_count;
    offset += response.servers.length;
    hasMore = offset < total_count;
  }
  return allServers;
}

async function main() {
  const servers = await fetchAllServers();
  await writeFile("pulsemcp.json", JSON.stringify(servers, null, 2), "utf-8");
  console.log(`Wrote ${servers.length} servers to pulsemcp.json`);
}

// Function to read and return the list of servers from disk
export async function readServersFromFile(
  filePath: string = "pulsemcp.json",
): Promise<Server[]> {
  const data = await readFile(filePath, "utf-8");
  return JSON.parse(data) as Server[];
}

const servers = await readServersFromFile();

let countGithub = 0;

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

const store = createStore({ connectionString: env.DATABASE_URL });
await store.purge();
await store.entries.addEntries(entries, { state: "published" });

const stats = await store.entries.getStatistics();
console.log(`Stats`, stats);
