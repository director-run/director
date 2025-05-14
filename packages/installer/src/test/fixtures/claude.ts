import { type ClaudeConfig, type ClaudeMCPServer, type ClaudeServerEntry } from "../../claude";
import { faker } from '@faker-js/faker';

export function createClaudeConfig(entries: ClaudeServerEntry[]): ClaudeConfig {
  return {
    mcpServers: entries.reduce((acc, entry) => {
      acc[entry.name] = entry.transport;
      return acc;
    }, {} as Record<string, ClaudeMCPServer>),
  };
}

export function createClaudeServerEntry(params?: {name?: string, transport?: ClaudeMCPServer}): ClaudeServerEntry {
 const name = params?.name ?? faker.hacker.noun();
  return {
    name,
    transport: params?.transport ?? {
        command: name,
        args: [],
        env: {},
    },
  };
}