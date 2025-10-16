import { AppError, ErrorCode } from "@director.run/utilities/error";
import { ClaudeInstaller } from "./claude";
import { ClaudeCodeInstaller } from "./claude-code";
import { CursorInstaller } from "./cursor";
import type { AbstractClient } from "./types";
import { VSCodeInstaller } from "./vscode";

export class ClientStore {
  public async getClientsByWorkspace(workspaceId: string) {
    const clients: AbstractClient<unknown>[] = [];
    for (const client of this.all()) {
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

  public get(name: string): AbstractClient<unknown> {
    const clients = this.all();
    const client = clients.find((c) => c.name === name);

    if (!client) {
      throw new AppError(
        ErrorCode.BAD_REQUEST,
        `Client ${name} is not supported`,
      );
    }
    return client;
  }

  public all(): AbstractClient<unknown>[] {
    return [
      new ClaudeInstaller({}),
      new CursorInstaller({}),
      new VSCodeInstaller({}),
      new ClaudeCodeInstaller({}),
    ];
  }

  public async resetAll(): Promise<void> {
    for (const client of this.all()) {
      const result = await client.reset();
      if (result.requiresRestart) {
        await client.restart();
      }
    }
  }

  public async toPlainObject() {
    return await Promise.all(this.all().map((client) => client.getStatus()));
  }
}
