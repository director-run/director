import { Gateway } from "@director.run/gateway/gateway";
import { gatewayClient } from "../src/client";
import { env } from "../src/env";

async function main() {
  const gateway = await Gateway.start({
    port: env.GATEWAY_PORT,
    databaseFilePath: env.CONFIG_FILE_PATH,
    registryURL: env.REGISTRY_API_URL,
    allowedOrigins: [env.STUDIO_URL, /^https?:\/\/localhost(:\d+)?$/],
  });

  await gateway.proxyStore.purge();

  const proxy = await gateway.proxyStore.create({
    name: "test",
    servers: [],
  });

  await proxy.addTarget({
    name: "notion",
    transport: {
      type: "http",
      url: "https://mcp.notion.com/mcp",
    },
  });

  const proxyDetails = await gatewayClient.store.get.query({
    proxyId: proxy.id,
  });
  console.log("--------------------------------");
  console.log("proxyDetails");
  console.log("--------------------------------");
  console.log(proxyDetails);
}

await main();
