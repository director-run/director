import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ProxyServer } from "../../backend/src/services/proxy/ProxyServer";

export async function proxySSEToStdio(sseUrl: string) {
  try {
    const transport = new StdioServerTransport();
    const proxy = new ProxyServer({
      id: "sse2stdio",
      name: "sse2stdio",
      targetConfig: [
        {
          name: "director-sse",
          transport: {
            type: "sse",
            url: sseUrl,
          },
        },
      ],
    });

    await proxy.connectTargets({ throwOnError: true });
    await proxy.getServer().connect(transport);

    process.on("SIGINT", async () => {
      await close();
      await proxy.getServer().close();
      process.exit(0);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
