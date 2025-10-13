import { Config } from "@director.run/gateway/config/index";
import { Gateway } from "@director.run/gateway/gateway";
import { gatewayClient } from "../src/client";
import { env } from "../src/env";

async function main() {
  const config = await Config.createFileBasedConfig(env.CONFIG_FILE_PATH);

  const gateway = await Gateway.start({
    config,
    baseUrl: "http://localhost:3673",
  });

  await gateway.workspaceStore.purge();

  const proxy = await gateway.workspaceStore.create({
    name: "test",
    servers: [],
  });

  await proxy.addTarget({
    type: "http",
    name: "notion",
    url: "https://mcp.notion.com/mcp",
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
