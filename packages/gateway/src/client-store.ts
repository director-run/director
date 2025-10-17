import { ClaudeInstaller } from "@director.run/client-configurator/claude";
import { ClaudeCodeInstaller } from "@director.run/client-configurator/claude-code";
import { CursorInstaller } from "@director.run/client-configurator/cursor";
import type { AbstractClient } from "@director.run/client-configurator/types";
import { VSCodeInstaller } from "@director.run/client-configurator/vscode";
import { AppError, ErrorCode } from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import { joinURL } from "@director.run/utilities/url";
import type { Config } from "./config";
import { getSSEPathForProxy, getStreamablePathForProxy } from "./helpers";
import type { Workspace } from "./workspaces/workspace";
import type { WorkspaceStore } from "./workspaces/workspace-store";

const logger = getLogger("ClientStore");

export type ClientId = "claude" | "claude-code" | "cursor" | "vscode";

export class ClientStore {
  private _config: Config;

  public constructor(params: { config: Config }) {
    this._config = params.config;
  }

  public async enforceClientConfigs({
    workspaceStore,
    baseUrl,
  }: {
    workspaceStore: WorkspaceStore;
    baseUrl: string;
  }) {
    logger.debug({ message: "Enforcing client configs" });
    for (const client of this.all()) {
      logger.debug({ message: `Resetting ${client.name}` });
      await client.reset();
      const workspaceIds =
        this._config.get(`clients.${client.name as ClientId}`) ?? [];
      for (const workspaceId of workspaceIds) {
        logger.debug({
          message: `Installing ${workspaceId} on ${client.name}`,
        });
        const workspace = workspaceStore.get(workspaceId);
        const result = await client.install({
          name: workspace.id,
          sseURL: joinURL(baseUrl, getSSEPathForProxy(workspace.id)),
          streamableURL: joinURL(
            baseUrl,
            getStreamablePathForProxy(workspace.id),
          ),
        });
        if (result.requiresRestart) {
          await client.restart();
        }
      }
    }
  }

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

  public async install({
    clientId,
    workspace,
    baseUrl,
  }: {
    clientId: ClientId;
    workspace: Workspace;
    baseUrl: string;
  }): Promise<void> {
    const client = this.get(clientId);

    const result = await client.install({
      name: workspace.id,
      sseURL: joinURL(baseUrl, getSSEPathForProxy(workspace.id)),
      streamableURL: joinURL(baseUrl, getStreamablePathForProxy(workspace.id)),
    });

    await this._config.push(`clients.${clientId}`, workspace.id);

    if (result.requiresRestart) {
      await client.restart();
    }
  }

  public async uninstall(
    clientId: ClientId,
    workspaceId: string,
  ): Promise<void> {
    const client = this.get(clientId);
    const result = await client.uninstall(workspaceId);

    await this._config.remove(`clients.${clientId}`, workspaceId);

    if (result.requiresRestart) {
      await client.restart();
    }
  }

  public async toPlainObject() {
    return await Promise.all(this.all().map((client) => client.getStatus()));
  }

  public async handleWorkspaceListChange(workspaceId: string) {
    const clients = await this.getClientsByWorkspace(workspaceId);
    for (const client of clients) {
      if (client.getCapabilities().requiresRestartOnUpdate) {
        logger.debug({ message: `restarting ${client.name}` });
        await client.restart();
      }
    }
  }

  public async handleWorkspaceRemove(workspaceId: string) {
    const clients = await this.getClientsByWorkspace(workspaceId);
    for (const client of clients) {
      const result = await client.uninstall(workspaceId);
      if (result.requiresRestart) {
        await client.restart();
      }
    }
  }
}
