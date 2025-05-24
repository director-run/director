import { SimpleClient } from "@director.run/mcp/simple-client";
import { registryClient } from "../client";

export async function enrichTools() {
  const entries = await registryClient.entries.getEntries.query({
    pageIndex: 0,
    pageSize: 10,
  });

  for (const entry of entries.entries) {
    console.log(`enriching tool ${entry.name}`);
    const client = new SimpleClient(`${entry.name}-client`);
    const transport = entry.transport;
    console.log(transport);
    if (transport.type === "stdio") {
      console.log(`connecting to stdio ${entry.name}...`);
      await client.connectToStdio(transport.command, transport.args, {
        ...process.env,
        ...transport.env,
      });
      console.log(`connected to stdio ${entry.name}, fetching tools...`);
      const tools = await client.listTools();
      //   console.log(JSON.stringify(tools, null, 2));
      console.log(`closing client ${entry.name}`);
      await client.close();
    } else {
      console.log("not supported", transport.type);
    }
  }
}
