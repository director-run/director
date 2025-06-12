# Client Configurator

This packages contains an SDK to help manage MCP Client configuration (checking client status, adding / removing servers, etc). Currently it supports Claude, Cursor & VSCode.

## API

```ts

import { ConfiguratorTarget, getConfigurator } from "@director.run/client-configurator/index";

const claudeConfigurator = getConfigurator(ConfiguratorTarget.Claude);
// Is Claude installed on this machine?
await claudeConfigurator.isClientPresent();
await claudeConfigurator.isInstalled("my-proxy");
// Install an MCP server using a URL. If the client doesn't support HTTP, we use proxies.
await claudeConfigurator.install({
  name: "my-proxy",
  url: "http://localhost:3673/my-proxy/sse",
});
await claudeConfigurator.uninstall("my-proxy");
// Clear the config file. Useful for development
await claudeConfigurator.reset();
```

## Adding support for a new client

```ts
// Create a new configurator in ./src/
export class NewClientConfigurator extends AbstractConfigurator<ClaudeConfig> {
  // Implement the protected methods
}
```
