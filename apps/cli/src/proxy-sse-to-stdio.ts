import { ProxyServer } from "@director.run/mcp/proxy-server";
import { serveOverStdio } from "@director.run/mcp/transport";

export async function proxySSEToStdio(sseUrl: string) {
  try {
    const proxy = new ProxyServer({
      id: "sse2stdio",
      name: "sse2stdio",
      servers: [
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
    await serveOverStdio(proxy);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
