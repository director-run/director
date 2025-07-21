import { readFile, writeFile } from "fs/promises";
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

main();
