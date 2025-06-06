import { type ClaudeConfig, type ClaudeMCPServer, type ClaudeServerEntry } from "../../claude";
import { faker } from '@faker-js/faker';
import slugify from "slugify";

export function createClaudeConfig(entries: ClaudeServerEntry[]): ClaudeConfig {
  return {
    mcpServers: entries.reduce((acc, entry) => {
      acc[entry.name] = entry.transport;
      return acc;
    }, {} as Record<string, ClaudeMCPServer>),
  };
}

export function createClaudeServerEntry(params?: {name?: string, transport?: ClaudeMCPServer}): ClaudeServerEntry {
 const name = slugify(params?.name ?? faker.hacker.noun() + ' ' + faker.hacker.noun());
  return {
    name,
    transport: params?.transport ?? {
        command: name,
        args: [],
        env: {},
    },
  };
}
