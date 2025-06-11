import { faker } from "@faker-js/faker";
import { type ClaudeConfig, type ClaudeMCPServer, type ClaudeServerEntry } from "../claude";
import { type CursorConfig } from "../cursor";
import {type Installable } from "../types";
import { type VSCodeConfig } from "../vscode";

export function createVSCodeConfig(entries: Array<Installable>): VSCodeConfig {
  return {
    mcp: {
      servers: entries.reduce((acc, entry) => {
        acc[entry.name] = { url: entry.url };
        return acc;
      }, {} as Record<string, { url: string }>),
    },
  };
}

export function createCursorConfig(entries: Array<Installable>): CursorConfig {
  return {
    mcpServers: entries.reduce((acc, entry) => {
      acc[entry.name] = { url: entry.url };
      return acc;
    }, {} as Record<string, { url: string }>),
  };
}


export function createClaudeConfig(entries: ClaudeServerEntry[]): ClaudeConfig {
  return {
    mcpServers: entries.reduce((acc, entry) => {
      acc[entry.name] = entry.transport;
      return acc;
    }, {} as Record<string, ClaudeMCPServer>),
  };
}

export function createInstallable(): { url: string; name: string } {
  return {
    url: faker.internet.url(),
    name: [faker.hacker.noun(), faker.number.hex()].join("-"),
  };
}