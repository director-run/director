import { getLogger } from "@director.run/utilities/logger";
import { SimpleClient } from "./simple-client";
import type { ProxyTargetAttributes, ProxyTransport } from "./types";

export type ProxyTargetStatus = "connected" | "disconnected" | "error";
export type ProxyTargetType = "stdio" | "http" | "in-memory";

const logger = getLogger(`mcp/proxy-target`);

export type ProxyTargetTransport = ProxyTransport;

export class ProxyTarget extends SimpleClient {
  private attributes: ProxyTargetAttributes;
  public readonly status: ProxyTargetStatus = "disconnected";

  constructor(attributes: ProxyTargetAttributes) {
    super(attributes.name);
    this.attributes = attributes;
  }

  public async smartConnect({ throwOnError } = { throwOnError: false }) {
    const { name, transport } = this.attributes;

    try {
      logger.info({
        message: `connecting to target ${name}`,
        transport,
      });

      if (transport.type === "http") {
        await this.connectToHTTP(transport.url);
      } else {
        await this.connectToStdio(transport.command, transport.args ?? [], {
          ...(process.env as Record<string, string>),
          ...(transport?.env || {}),
        });
      }
    } catch (error) {
      logger.error({
        message: `failed to connect to target ${name}`,
        error,
      });
      if (throwOnError) {
        throw error;
      }
    }
  }
}
