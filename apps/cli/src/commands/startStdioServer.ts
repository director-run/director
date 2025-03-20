import type { Config } from "@director/core";
import { AppError, ErrorCode } from "@director/core";
import { createProxyServer } from "@director/core";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

export async function startStdioServer({
  name,
  config,
}: {
  name: string;
  config: Config;
}) {
  const proxyConfig = config.proxies.find((proxy) => proxy.name === name);

  if (!proxyConfig) {
    throw new AppError(ErrorCode.NOT_FOUND, `Proxy config for ${name} not found`);
  }

  const transport = new StdioServerTransport();
  const { server, cleanup } = await createProxyServer(proxyConfig);

  await server.connect(transport);

  // Cleanup on exit
  process.on("SIGINT", async () => {
    await cleanup();
    await server.close();
    process.exit(0);
  });
}
