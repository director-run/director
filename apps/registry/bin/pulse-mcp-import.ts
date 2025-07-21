import { env } from "../src/config";
import { createStore } from "../src/db/store";
import {
  PulseMCPClient,
  pulseMCPServersToCreateEntries,
} from "../src/importers/pulsemcp";

const store = createStore({ connectionString: env.DATABASE_URL });

console.log(`purging store`);
await store.purge();

const client = new PulseMCPClient();
const servers = await client.topMostStarredServers();
const entries = pulseMCPServersToCreateEntries(servers);

await store.entries.addEntries(entries, { state: "published" });

const stats = await store.entries.getStatistics();

console.log(`stats:`, stats);

await store.close();
