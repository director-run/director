import type { EntryCreateParams } from "../../db/types";
import { faker } from '@faker-js/faker';

export function createTestEntry(overrides: Partial<EntryCreateParams> = {}): EntryCreateParams {
  return {
    name: faker.company.name(),
    title: faker.company.name(),
    description: faker.company.catchPhrase(),
    transport: {
      type: "stdio",
      command: "echo",
      args: ["https://github.com/test/test-server"],
    },
    ...overrides,
  };
}

export function createTestEntries(count: number): EntryCreateParams[] {
  return Array.from({ length: count }, (_, i) => 
    createTestEntry()
  );
} 