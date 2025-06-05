import { type CursorConfig, type CursorMCPServer, type CursorServerEntry } from "../../cursor";
import { faker } from '@faker-js/faker';
import slugify from "slugify";

export function createCursorConfig(entries: CursorServerEntry[]): CursorConfig {
  return {
    mcpServers: entries.reduce((acc, entry) => {
      acc[entry.name] = { url: entry.url };
      return acc;
    }, {} as Record<string, CursorMCPServer>),
  };
}

export function createCursorServerEntry(params?: {name?: string, url?: string}): CursorServerEntry {
  const name = slugify(params?.name ?? `${faker.hacker.noun()} ${faker.hacker.noun()}`);
  return {
    name,
    url: faker.internet.url(),
  };
}
