import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { proxyMCPServers } from "./proxyMCPServers";

export async function proxySSEToStdio(sseUrl: string) {
  const transport = new StdioServerTransport();
  const { server, cleanup } = await proxyMCPServers([
    {
      name: "test-sse-transport",
      transport: {
        type: "sse",
        url: sseUrl,
      },
    },
  ]);

  await server.connect(transport);

  // Cleanup on exit
  process.on("SIGINT", async () => {
    await cleanup();
    await server.close();
    process.exit(0);
  });
}
