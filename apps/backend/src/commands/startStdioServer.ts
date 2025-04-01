import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { makeMCPProxyServer } from "../services/proxy/makeMCPProxyServer";
import { getProxy } from "../services/store";

export async function startStdioServer(name: string) {
  const proxy = await getProxy(name);
  const transport = new StdioServerTransport();
  const { server, cleanup } = await makeMCPProxyServer(proxy.servers);

  await server.connect(transport);

  // Cleanup on exit
  process.on("SIGINT", async () => {
    await cleanup();
    await server.close();
    process.exit(0);
  });
}
