import { ClaudeInstaller } from "@director.run/client-configurator/claude";
import { ClaudeCodeInstaller } from "@director.run/client-configurator/claude-code";
import { CursorInstaller } from "@director.run/client-configurator/cursor";
import type { AbstractClient } from "@director.run/client-configurator/types";
import { VSCodeInstaller } from "@director.run/client-configurator/vscode";
import { AppError, ErrorCode } from "@director.run/utilities/error";

export type ClientId = "claude" | "claude-code" | "cursor" | "vscode";

export type ConnectionDetails = {
  streamableUrl: string;
};

export class ClientStore {
  private readonly configKeyPrefix: string;

  public constructor(params: { configKeyPrefix: string }) {
    this.configKeyPrefix = params.configKeyPrefix;
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
      new ClaudeInstaller({ configKeyPrefix: this.configKeyPrefix }),
      new CursorInstaller({ configKeyPrefix: this.configKeyPrefix }),
      new VSCodeInstaller({ configKeyPrefix: this.configKeyPrefix }),
      new ClaudeCodeInstaller({ configKeyPrefix: this.configKeyPrefix }),
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
    name,
    connectionDetails,
  }: {
    clientId: ClientId;
    name: string;
    connectionDetails: ConnectionDetails;
  }): Promise<void> {
    const client = this.get(clientId);

    // Uninstall first if already installed (reinstall scenario)
    if (await client.isInstalled(name)) {
      await client.uninstall(name);
    }

    const result = await client.install({
      name,
      streamableURL: connectionDetails.streamableUrl,
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
