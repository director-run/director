import { entriesTable } from "../../db/schema";

export interface TestEntry {
  id: string;
  name: string;
  description: string;
  verified: boolean;
  provider: string;
  providerVerified: boolean;
  createdDate: Date;
  runtime: string;
  license: string;
  sourceUrl: string;
  transport: {
    type: "stdio";
    command: string;
    args: string[];
  };
  source: {
    type: "github";
    url: string;
  };
  sourceRegistry: {
    name: string;
  };
  categories: string[];
  tools: Array<{
    name: string;
    description: string;
  }>;
  parameters: Array<{
    name: string;
    description: string;
    required?: boolean;
  }>;
  readme: string | null;
}

export function createTestEntry(overrides: Partial<TestEntry> = {}): TestEntry {
  return {
    id: "test-id",
    name: "test-server",
    description: "A test server",
    verified: false,
    provider: "github.com",
    providerVerified: false,
    createdDate: new Date(),
    runtime: "TypeScript",
    license: "MIT",
    sourceUrl: "https://github.com/test/test-server",
    transport: {
      type: "stdio",
      command: "echo",
      args: ["https://github.com/test/test-server"],
    },
    source: {
      type: "github",
      url: "https://github.com/test/test-server",
    },
    sourceRegistry: {
      name: "test-registry",
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
    readme: null,
    ...overrides,
  };
}

export function createTestEntries(count: number, baseName = "test-server"): TestEntry[] {
  return Array.from({ length: count }, (_, i) => 
    createTestEntry({
      id: `test-id-${i}`,
      name: `${baseName}-${i}`,
      description: `Test server ${i}`,
      sourceUrl: `https://github.com/test/${baseName}-${i}`,
      transport: {
        type: "stdio",
        command: "echo",
        args: [`https://github.com/test/${baseName}-${i}`],
      },
      source: {
        type: "github",
        url: `https://github.com/test/${baseName}-${i}`,
      },
    })
  );
} 