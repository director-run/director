import { type CursorConfig } from "../../cursor";
import {type Installable } from "../../types";

export function createCursorConfig(entries: Array<Installable>): CursorConfig {
  return {
    mcpServers: entries.reduce((acc, entry) => {
      acc[entry.name] = { url: entry.url };
      return acc;
    }, {} as Record<string, { url: string }>),
  };
}

