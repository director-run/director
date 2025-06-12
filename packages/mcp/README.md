# Director MCP SDK Extensions

This folder contains extensions to the official [Typescript MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk) that are needed to power the Gateway.

## API

```typescript
import { ProxyServer } from "@director.run/mcp/proxy-server";
import { SimpleClient } from "@director.run/mcp/simple-client";
import {
  serveOverSSE,
  serveOverStdio,
  serveOverStreamable,
} from "@director.run/mcp/transport";

const proxy = new ProxyServer({
  id: "my-proxy",
  name: "my-proxy",
  servers: [
    {
      name: "stdio-server",
      transport: {
        type: "stdio",
        command: "npx",
        args: [
          "-y",
          "@director.run/cli",
          "http2stdio",
          "http://example.com/sse",
        ],
      },
    },
    {
      name: "http-server",
      transport: {
        type: "http",
        // supports SSE & Streamable
        url: "http://example.com/mcp",
      },
    },
  ],
});

// Connect to the servers
await proxy.connectTargets();

// Helper methods to serve the proxy
await serveOverStreamable(proxy, 3673);
await serveOverSSE(proxy, 3674);
await serveOverStdio(proxy);

// Connect over Streamable or SSE
const httpClient = await SimpleClient.createAndConnectToHTTP(
  "http://localhost:3673/mcp",
);

// Connect over Stdio
const stdioClient = await SimpleClient.createAndConnectToStdio(
  "server-command",
  ["server-args"],
);


// List the tools
console.log(await httpClient.listTools());
```