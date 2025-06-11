import { faker } from "@faker-js/faker";
import { type ClaudeConfig, type ClaudeMCPServer, type ClaudeServerEntry } from "../claude";
import { type CursorConfig } from "../cursor";
import {type Installable } from "../types";
import { type VSCodeConfig } from "../vscode";
import path from "node:path";
import { writeJSONFile } from "@director.run/utilities/json";
import { ConfiguratorTarget } from "..";
import fs from "node:fs/promises";

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

export async function createConfigFile(target: ConfiguratorTarget) {
  switch (target) {
    case ConfiguratorTarget.VSCode:
      await writeJSONFile(getConfigPath(target), createVSCodeConfig([]));
      break;
    case ConfiguratorTarget.Cursor:
      await writeJSONFile(getConfigPath(target), createCursorConfig([]));
      break;
    case ConfiguratorTarget.Claude:
      await writeJSONFile(getConfigPath(target), createClaudeConfig([]));
      break;
  }
}

export async function deleteConfigFile(target: ConfiguratorTarget) {
  await fs.unlink(getConfigPath(target));
}

function getConfigPath(target: ConfiguratorTarget) {
  return path.join(__dirname, `${target}.config.test.json`);
}