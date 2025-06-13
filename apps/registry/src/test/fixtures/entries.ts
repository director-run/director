import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import type { EntryCreateParams, EntryGetParams } from "../../db/schema";
import { faker } from '@faker-js/faker';

const makeEntryName = () => faker.hacker.noun() + '_' + faker.string.uuid();

export function makeTestEntry(overrides: Partial<EntryCreateParams> = {}): EntryCreateParams {
  const name = makeEntryName();
  return {
    name,
    title: name,
    description: faker.company.catchPhrase(),
    homepage: faker.internet.url(),
    parameters: [],
    transport: {
      type: "stdio",
      command: "echo",
      args: ["https://github.com/test/test-server"],
    },
    ...overrides,
  };
}


type MakeStdioTransportOptions = {
  command?: string;
  args?: string[];
  type?: "stdio";
  env?: Record<string, string>;
}

export function makeStdioTransport(overrides: MakeStdioTransportOptions = {}) {
  return {
    type: "stdio" as const,
    command: "echo",
    args: ["https://github.com/test/test-server"],
    ...overrides,
  };
}

export function makeTestEntries(count: number): EntryCreateParams[] {
  return Array.from({ length: count }, (_, i) => 
    makeTestEntry()
  );
} 