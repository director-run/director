import { ClaudeInstaller } from "@director.run/client-configurator/claude";
import { ClaudeCodeInstaller } from "@director.run/client-configurator/claude-code";
import { CursorInstaller } from "@director.run/client-configurator/cursor";
import type { AbstractClient } from "@director.run/client-configurator/types";
import { VSCodeInstaller } from "@director.run/client-configurator/vscode";
import { AppError, ErrorCode } from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import { sleep } from "@director.run/utilities/sleep";
import { joinURL } from "@director.run/utilities/url";
import type { Config } from "./config";
import { getSSEPathForPlaybook, getStreamablePathForPlaybook } from "./helpers";
import type { Playbook } from "./playbooks/playbook";
import type { PlaybookStore } from "./playbooks/playbook-store";

const logger = getLogger("ClientStore");

export type ClientId = "claude" | "claude-code" | "cursor" | "vscode";

export class ClientStore {
  private _config: Config;

  public constructor(params: { config: Config }) {
    this._config = params.config;
  }

  public async enforceClientConfigs({
    playbookStore,
    baseUrl,
  }: {
    playbookStore: PlaybookStore;
    baseUrl: string;
  }) {
    logger.debug({ message: "Enforcing client configs" });

    await this.resetAll({ restartIfNeeded: false });
    logger.debug({ message: "Waiting for 1 second" });
    await sleep(1000);

    logger.debug({ message: "Adding back" });
    for (const client of this.all()) {
      const playbookIds =
        this._config.get(`clients.${client.name as ClientId}`) ?? [];
      for (const playbookId of playbookIds) {
        logger.debug({
          message: `Installing ${playbookId} on ${client.name}`,
        });
        const playbook = playbookStore.get(playbookId);
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
    }
  }

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

    await this._config.push(`clients.${clientId}`, playbook.id);

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

    await this._config.remove(`clients.${clientId}`, playbookId);

    if (result.requiresRestart) {
      await client.restart();
    }
  }

  public async toPlainObject() {
    return await Promise.all(this.all().map((client) => client.getStatus()));
  }

  public async handlePlaybookListChange(playbookId: string) {
    const clients = await this.getClientsByPlaybook(playbookId);
    for (const client of clients) {
      if (!(await client.isClientPresent())) {
        continue;
      }
      if (client.getCapabilities().requiresRestartOnUpdate) {
        logger.debug({ message: `restarting ${client.name}` });
        await client.restart();
      }
    }
  }

  public async handlePlaybookRemove(playbookId: string) {
    const clients = await this.getClientsByPlaybook(playbookId);
    for (const client of clients) {
      if (!(await client.isClientPresent())) {
        continue;
      }
      const result = await client.uninstall(playbookId);
      if (result.requiresRestart) {
        await client.restart();
      }
    }
  }
}
