import { AppError, ErrorCode } from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import { AbstractClient } from "./abstract-client";

const logger = getLogger("client/stdio");

export class StdioClient extends AbstractClient {
  public readonly command: string;
  public readonly args: string[];
  public readonly env?: Record<string, string>;

  constructor(params: {
    name: string;
    command: string;
    args: string[];
    env?: Record<string, string>;
  }) {
    super(params.name);
    this.command = params.command;
    this.args = params.args;
    this.env = params.env;
  }

  public async connectToTarget({ throwOnError }: { throwOnError: boolean }) {
    try {
      await this.connect(
        new StdioClientTransport({
          command: this.command,
          args: this.args,
          env: this.env,
        }),
      );
      this.status = "connected";
    } catch (e) {
      if (e instanceof Error && (e as ErrnoException).code === "ENOENT") {
        throw new AppError(
          ErrorCode.CONNECTION_REFUSED,
          `[${this.name}] command not found: '${this.command}'. Please make sure it is installed and available in your $PATH.`,
          {
            targetName: this.name,
            command: this.command,
            args: this.args,
            env: this.env,
          },
        );
      } else if (e instanceof McpError) {
        throw new AppError(
          ErrorCode.CONNECTION_REFUSED,
          `[${this.name}] failed to run '${[this.command, ...this.args].join(" ")}'. Please check the logs for more details.`,
          {
            targetName: this.name,
            command: this.command,
            args: this.args,
            env: this.env,
          },
        );
      } else {
        throw e;
      }
    }
  }

  public static async createAndConnectToStdio(
    command: string,
    args: string[],
    env?: Record<string, string>,
  ) {
    const client = new StdioClient({
      name: "test client",
      command,
      args,
      env,
    });
    await client.connectToTarget({ throwOnError: true });
    return client;
  }
}
