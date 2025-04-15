import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ProxyServer } from "./ProxyServer";

export async function proxySSEToStdio(sseUrl: string) {
  const transport = new StdioServerTransport();
  const proxy = await ProxyServer.create([
    {
      name: "test-sse-transport",
      transport: {
        type: "sse",
        url: sseUrl,
      },
    },
  ]);

  await proxy.getServer().connect(transport);

  // Cleanup on exit
  process.on("SIGINT", async () => {
    await close();
    await proxy.getServer().close();
    process.exit(0);
  });
}
