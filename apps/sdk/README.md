# Director SDK

#### Example
```typescript
import { createRegistryClient } from "@director.run/sdk";

const registryClient = createRegistryClient("https://registry.director.run");

const entries = await registryClient.entries.getEntries.query({
    pageIndex: 0,
    pageSize: 1,
  });

console.log(entries);

```