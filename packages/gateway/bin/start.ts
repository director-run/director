import { Config } from "../src/config";
import { SERVER_PORT } from "../src/env";
import { Gateway } from "../src/gateway";

async function start() {
  await Gateway.start({
    config: await Config.createMemoryBasedConfig({
      defaults: {},
    }),
    baseUrl: `http://localhost:${SERVER_PORT}`,
    port: SERVER_PORT,
  });
}

await start();
