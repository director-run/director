import { Config } from "@director.run/gateway/config/index";
import { Gateway } from "@director.run/gateway/gateway";
import { gatewayClient } from "../src/client";

async function main() {
  const config = await Config.createFileBasedConfig({
    filePath: "/path/to/config.yaml",
    defaults: {},
  });

  const gateway = await Gateway.start({
    config,
    baseUrl: "http://localhost:3673",
  });

  await gateway.playbookStore.purge();

  const playbook = await gateway.playbookStore.create({
    name: "test",
    servers: [],
  });

  await playbook.addTarget({
    type: "http",
    name: "notion",
    url: "https://mcp.notion.com/mcp",
  });

  const playbookDetails = await gatewayClient.store.get.query({
    proxyId: playbook.id,
  });
  console.log("--------------------------------");
  console.log("playbookDetails");
  console.log("--------------------------------");
  console.log(playbookDetails);
}

await main();
