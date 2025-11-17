import { HTTPClient } from "@director.run/mcp/client/http-client";
import { PORT } from "./src/config";

export async function main() {
  const client = await HTTPClient.createAndConnectToHTTP(
    `http://localhost:${PORT}/mcp`,
  );

  await client.listTools();
  // console.log(await client.listTools());
  const { content } = await client.callTool({
    name: "slack_list_channels",
    arguments: {},
  });

  const json = JSON.parse(
    (content as unknown as { text: string }[])[0]?.text as string,
  );

  console.log("--------------------------------");
  console.log("status", json.ok);
  console.log(
    "channels",
    json.channels.map((channel: { name: string }) => channel.name),
  );
  console.log("--------------------------------");

  await client.close();
}

await main();
