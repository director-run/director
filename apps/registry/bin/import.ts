import { env } from "../src/config";
import { createStore } from "../src/db/store";
import { importFromPulseMCP } from "../src/importers/pulsemcp";

const store = createStore({ connectionString: env.DATABASE_URL });
console.log(`purging store`);
await store.purge();

await importFromPulseMCP(store);

const stats = await store.entries.getStatistics();

console.log(`imported ${stats.total} entries`);
console.log(`stats:`, stats);

await store.close();
