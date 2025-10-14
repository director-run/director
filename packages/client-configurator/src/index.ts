import { AppError, ErrorCode } from "@director.run/utilities/error";
import { ClaudeInstaller } from "./claude";
import { ClaudeCodeInstaller } from "./claude-code";
import { CursorInstaller } from "./cursor";
import type { AbstractConfigurator } from "./types";
import { VSCodeInstaller } from "./vscode";

export enum ConfiguratorTarget {
  Claude = "claude",
  Cursor = "cursor",
  VSCode = "vscode",
  ClaudeCode = "claude-code",
}

export async function getAllClientsAsPlainObject() {
  return await Promise.all(
    (await getAllClients()).map((client) => client.getStatus()),
  );
}

export async function getAllClients() {
  return await Promise.all(
    Object.values(ConfiguratorTarget).map((target) => getConfigurator(target)),
  );
}

export async function getClientsByWorkspace(workspaceId: string) {
  const clients: AbstractConfigurator<unknown>[] = [];
  for (const client of await getAllClients()) {
    const installed = await client.list();
    if (installed.some((installable) => installable.name === workspaceId)) {
      clients.push(client);
    }
  }
  return clients;
}

export function getConfigurator(
  target: ConfiguratorTarget,
  params: {
    configPath?: string;
  } = {},
): AbstractConfigurator<unknown> {
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
    Object.values(ConfiguratorTarget).map((target) => getConfigurator(target)),
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
