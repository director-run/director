import { type VSCodeConfig, type VSCodeMCPServer, type VSCodeServerEntry } from "../../vscode";
import { faker } from '@faker-js/faker';
import slugify from "slugify";

export function createVSCodeConfig(entries: VSCodeServerEntry[]): VSCodeConfig {
  return {
    mcp: {
      servers: entries.reduce((acc, entry) => {
        acc[entry.name] = { url: entry.url };
        return acc;
      }, {} as Record<string, VSCodeMCPServer>),
    },
  };
}

export function createVSCodeServerEntry(params?: {name?: string, url?: string}): VSCodeServerEntry {
  const name = slugify(params?.name ?? `${faker.hacker.noun()} ${faker.hacker.noun()}`);
  return {
    name,
    url: params?.url ?? faker.internet.url(),
  };
} 