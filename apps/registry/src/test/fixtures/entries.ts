import type { EntryCreateParams } from "../../db/schema";
import { faker } from '@faker-js/faker';

const makeEntryName = () => faker.hacker.noun() + '_' + faker.string.uuid();

export function makeTestEntry(overrides: Partial<EntryCreateParams> = {}): EntryCreateParams {
  const name = makeEntryName();
  return {
    name,
    title: name,
    description: faker.company.catchPhrase(),
    transport: {
      type: "stdio",
      command: "echo",
      args: ["https://github.com/test/test-server"],
    },
    ...overrides,
  };
}

export function makeTestEntries(count: number): EntryCreateParams[] {
  return Array.from({ length: count }, (_, i) => 
    makeTestEntry()
  );
} 