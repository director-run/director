import { AppError, ErrorCode } from "@director.run/utilities/error";
import { ClaudeInstaller } from "./claude";
import { ClaudeCodeInstaller } from "./claude-code";
import { CursorInstaller } from "./cursor";
import type { AbstractClient } from "./types";
import { VSCodeInstaller } from "./vscode";

export const ALL_CLIENT_NAMES = [
  "claude",
  "cursor",
  "vscode",
  "claude-code",
] as const;

export async function getAllClientsAsPlainObject() {
  return await Promise.all(
    (await getAllClients()).map((client) => client.getStatus()),
  );
}

export async function getAllClients() {
  return await Promise.all(ALL_CLIENT_NAMES.map((target) => getClient(target)));
}

export async function getClientsByWorkspace(workspaceId: string) {
  const clients: AbstractClient<unknown>[] = [];
  for (const client of await getAllClients()) {
    if (!(await client.isClientPresent())) {
      continue;
    }
    const installed = await client.list();
    if (installed.some((installable) => installable.name === workspaceId)) {
      clients.push(client);
    }
  }
  return clients;
}

export function getClient(
  target: string,
  params: {
    configPath?: string;
  } = {},
): AbstractClient<unknown> {
  switch (target) {
    case "claude":
      return new ClaudeInstaller(params);
    case "cursor":
      return new CursorInstaller(params);
    case "vscode":
      return new VSCodeInstaller(params);
    case "claude-code":
      return new ClaudeCodeInstaller(params);
    default:
      throw new AppError(
        ErrorCode.BAD_REQUEST,
        `Client ${target} is not supported`,
      );
  }
}

export async function resetAllClients() {
  const installers = await Promise.all(
    ALL_CLIENT_NAMES.map((target) => getClient(target)),
  );
  for (const installer of installers) {
    console.log("resetting", installer.name);
    if (await installer.isClientPresent()) {
      const result = await installer.reset();
      if (result.requiresRestart) {
        console.log(`requires restart: ${installer.name}`);
        await installer.restart();
      } else {
        console.log(`no restart needed: ${installer.name}`);
      }
    } else {
      console.log("client not present:", installer.name);
    }
  }
}
