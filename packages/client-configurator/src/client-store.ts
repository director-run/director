import { AppError, ErrorCode } from "@director.run/utilities/error";
import { ClaudeInstaller } from "./claude";
import { ClaudeCodeInstaller } from "./claude-code";
import { CursorInstaller } from "./cursor";
import type { AbstractClient } from "./types";
import { VSCodeInstaller } from "./vscode";

export class ClientStore {
  //   constructor(config: Config) {
  //     this.config = config;
  //   }

  //    function getClient(
  //     target: ClientNames,
  //     params: {
  //       configPath?: string;
  //     } = {},
  //   ): AbstractClient<unknown> {
  //     switch (target) {
  //       case "claude":
  //         return new ClaudeInstaller(params);
  //       case "cursor":
  //         return new CursorInstaller(params);
  //       case "vscode":
  //         return new VSCodeInstaller(params);
  //       case "claude-code":
  //         return new ClaudeCodeInstaller(params);
  //       default:
  //         throw new AppError(
  //           ErrorCode.BAD_REQUEST,
  //           `Client ${target} is not supported`,
  //         );
  //     }
  //   }}

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
