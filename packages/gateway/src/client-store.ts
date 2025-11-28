import { ClaudeInstaller } from "@director.run/client-configurator/claude";
import { ClaudeCodeInstaller } from "@director.run/client-configurator/claude-code";
import { CursorInstaller } from "@director.run/client-configurator/cursor";
import type { AbstractClient } from "@director.run/client-configurator/types";
import { VSCodeInstaller } from "@director.run/client-configurator/vscode";
import { AppError, ErrorCode } from "@director.run/utilities/error";
import { joinURL } from "@director.run/utilities/url";
import { getSSEPathForPlaybook, getStreamablePathForPlaybook } from "./helpers";
import type { Playbook } from "./playbooks/playbook";

export type ClientId = "claude" | "claude-code" | "cursor" | "vscode";

export class ClientStore {
  public constructor() {}

  public async getClientsByPlaybook(playbookId: string) {
    const clients: AbstractClient<unknown>[] = [];
    for (const client of this.all()) {
      if (!(await client.isClientPresent())) {
        continue;
      }
      const installed = await client.list();
      if (installed.some((installable) => installable.name === playbookId)) {
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

  public async resetAll(
    { restartIfNeeded }: { restartIfNeeded: boolean } = {
      restartIfNeeded: true,
    },
  ): Promise<void> {
    for (const client of this.all()) {
      if (!(await client.isClientPresent())) {
        continue;
      }
      const result = await client.reset();
      if (result.requiresRestart && restartIfNeeded) {
        await client.restart();
      }
    }
  }

  public async install({
    clientId,
    playbook,
    baseUrl,
  }: {
    clientId: ClientId;
    playbook: Playbook;
    baseUrl: string;
  }): Promise<void> {
    const client = this.get(clientId);

    const result = await client.install({
      name: playbook.id,
      sseURL: joinURL(baseUrl, getSSEPathForPlaybook(playbook.id)),
      streamableURL: joinURL(
        baseUrl,
        getStreamablePathForPlaybook(playbook.id),
      ),
    });

    if (result.requiresRestart) {
      await client.restart();
    }
  }

  public async uninstall(
    clientId: ClientId,
    playbookId: string,
  ): Promise<void> {
    const client = this.get(clientId);
    const result = await client.uninstall(playbookId);

    if (result.requiresRestart) {
      await client.restart();
    }
  }

  public async toPlainObject() {
    return await Promise.all(this.all().map((client) => client.getStatus()));
  }
}
