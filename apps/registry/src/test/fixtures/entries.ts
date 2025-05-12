import { entriesTable } from "../../db/schema";

export interface TestEntry {
  id: string;
  name: string;
  title: string;
  description: string;
  isOfficial: boolean;
  transport: {
    type: "stdio";
    command: string;
    args: string[];
    env?: Record<string, string>;
  } | {
    type: "sse";
    url: string;
  };
  homepage?: string;
  source_registry: {
    name: string;
    entryId: string;
  };
  categories: string[];
  tools: Array<{
    name: string;
    description: string;
    arguments?: string[];
    inputs?: Array<{
      name: string;
      type: string;
      required?: boolean;
      description?: string;
    }>;
  }>;
  parameters: Array<{
    name: string;
    description: string;
    required?: boolean;
  }>;
  readme?: string;
}

export function createTestEntry(overrides: Partial<TestEntry> = {}): TestEntry {
  return {
    id: crypto.randomUUID(),
    name: "test-server",
    title: "Test Server",
    description: "A test server",
    isOfficial: false,
    transport: {
      type: "stdio",
      command: "echo",
      args: ["https://github.com/test/test-server"],
    },
    homepage: "https://github.com/test/test-server",
    source_registry: {
      name: "test-registry",
      entryId: "test-registry-id",
    },
    categories: ["test", "example"],
    tools: [
      {
        name: "test-tool",
        description: "A test tool",
      },
    ],
    parameters: [
      {
        name: "test_param",
        description: "A test parameter",
        required: false,
      },
    ],
    readme: undefined,
    ...overrides,
  };
}

export function createTestEntries(count: number, baseName = "test-server"): TestEntry[] {
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