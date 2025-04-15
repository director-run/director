import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ProxyServer } from "../../backend/src/services/proxy/ProxyServer";

export async function proxySSEToStdio(sseUrl: string) {
  const transport = new StdioServerTransport();
  const proxy = await ProxyServer.create({
    id: "sse2stdio",
    targets: [
      {
        name: "director-sse",
        transport: {
          type: "sse",
          url: sseUrl,
        },
      },
    ],
  });

  await proxy.getServer().connect(transport);

  // Cleanup on exit
  process.on("SIGINT", async () => {
    await close();
    await proxy.getServer().close();
    process.exit(0);
  });
}
