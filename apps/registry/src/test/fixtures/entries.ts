import type { EntryCreateParams } from "../../db/types";

export function createTestEntry(overrides: Partial<EntryCreateParams> = {}): EntryCreateParams {
  return {
    name: "test-server",
    title: "Test Server",
    description: "A test server",
    transport: {
      type: "stdio",
      command: "echo",
      args: ["https://github.com/test/test-server"],
    },
    ...overrides,
  };
}

export function createTestEntries(count: number, baseName = "test-server"): EntryCreateParams[] {
  return Array.from({ length: count }, (_, i) => 
    createTestEntry({
      id: crypto.randomUUID(),
      name: `${baseName}-${i}`,
      title: `Test Server ${i}`,
      description: `Test server ${i}`,
      transport: {
        type: "stdio",
        command: "echo",
        args: [`https://github.com/test/${baseName}-${i}`],
      },
      homepage: `https://github.com/test/${baseName}-${i}`,
      source_registry: {
        name: "test-registry",
        entryId: `test-registry-id-${i}`,
      },
    })
  );
} 