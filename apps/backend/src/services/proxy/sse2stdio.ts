import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMCPProxy } from "./createMCPProxy";

export async function sse2stdio(sseUrl: string) {
  const transport = new StdioServerTransport();
  const { server, cleanup } = await createMCPProxy([
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
