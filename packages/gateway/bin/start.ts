import { createStore } from "../src/db";
import { DATABASE_URL, SERVER_PORT } from "../src/env";
import { Gateway } from "../src/gateway";

async function start() {
  const dbStore = createStore({ connectionString: DATABASE_URL }).playbooks;

  await Gateway.start({
    dbStore,
    baseUrl: `http://localhost:${SERVER_PORT}`,
    port: SERVER_PORT,
    oauth: {
      storage: "memory",
      baseCallbackUrl: `http://localhost:${SERVER_PORT}`,
    },
  });
}

await start();
