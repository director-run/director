import { ErrorCode, isAppError } from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import type {
  ProxyTargetAttributes,
  ProxyTransport,
} from "@director.run/utilities/schema";
import type { OAuthClientProvider } from "@modelcontextprotocol/sdk/client/auth.js";
import { SimpleClient } from "./simple-client";

export type ProxyTargetStatus = "connected" | "disconnected" | "unauthorized";

const logger = getLogger(`mcp/proxy-target`);

export type ProxyTargetTransport = ProxyTransport;

export class ProxyTarget extends SimpleClient {
  private attributes: ProxyTargetAttributes;
  public status: ProxyTargetStatus = "disconnected";

  constructor(attributes: ProxyTargetAttributes) {
    super(attributes.name.toLocaleLowerCase());
    this.attributes = attributes;
  }

  public async smartConnect(
    {
      throwOnError,
      headers,
      oauthProvider,
      onAuthorizationRequired,
    }: {
      throwOnError: boolean;
      headers?: Record<string, string>;
      oauthProvider?: OAuthClientProvider;
      onAuthorizationRequired?: (authUrl: URL) => Promise<string>;
    } = {
      throwOnError: false,
    },
  ) {
    const { name, transport } = this.attributes;

    try {
      logger.info({
        message: `connecting to target ${name}`,
        transport,
      });

      if (transport.type === "http") {
        try {
          console.log("connecting to http");
          await this.connectToHTTP(
            transport.url,
            {
              ...transport.headers,
              ...headers,
            },
            oauthProvider,
            onAuthorizationRequired,
          );
          this.status = "connected";
        } catch (error) {
          if (isAppError(error) && error.code === ErrorCode.UNAUTHORIZED) {
            console.log("-*xxxx------- unauthorized");
            this.status = "unauthorized";
            return;
          } else {
            throw error;
          }
        }
      } else {
        await this.connectToStdio(transport.command, transport.args ?? [], {
          ...(process.env as Record<string, string>),
          ...(transport?.env || {}),
        });
        this.status = "connected";
      }
    } catch (error) {
      logger.error({
        message: `failed to connect to target ${name}`,
        error,
      });
      this.status = "disconnected";
      if (throwOnError) {
        throw error;
      }
    }
  }
}
