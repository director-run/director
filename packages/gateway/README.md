# Director Gateway

This contains the core logic for the Director Gateway. You can read more about the design in the [Documentation](https://docs.director.run).

## API

#### Starting a Server
```typescript
import { Gateway } from "@director.run/gateway/gateway";

// Start the gateway
await Gateway.start(
{
  port: 8080, // which port to listen to
  databaseFilePath: '~/.director/config.json', // config file location
  registryURL: 'https://registry.director.run', // registry API URL
  allowedOrigins: ['https://studio.director.run',  /^https?:\/\/localhost(:\d+)?$/], // CORS
});
```

#### Managing a Server

```typescript
import { createGatewayClient } from "@director.run/gateway/client";
const gatewayClient = createGatewayClient('http://localhost:8080');

// Create a proxy
await gatewayClient.store.create.mutate({
  name: "my-proxy",
});

// Add a server to a proxy
await gatewayClient.store.addServer.mutate({
  proxyId: "my-proxy",
  server: {
    name: "my-server",
    transport: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@director.run/cli", "http2stdio", "http://localhost:3673/my-server/sse"],
    },
  },
});
```