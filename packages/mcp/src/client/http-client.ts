import {
  AppError,
  ErrorCode,
  isAppErrorWithCode,
} from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import { UnauthorizedError } from "@modelcontextprotocol/sdk/client/auth.js";
import {
  SSEClientTransport,
  SseError,
} from "@modelcontextprotocol/sdk/client/sse.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { OAuthHandler } from "../oauth/oauth-provider-factory";
import { AbstractClient, type SerializedClient } from "./abstract-client";

const logger = getLogger("client/http");

export class HTTPClient extends AbstractClient {
  public readonly url: string;
  private headers?: Record<string, string>;
  private oAuthHandler?: OAuthHandler;

  constructor(params: {
    url: string;
    name: string;
    oAuthHandler?: OAuthHandler;
    headers?: Record<string, string>;
  }) {
    super(params.name);
    this.url = params.url;
    this.oAuthHandler = params.oAuthHandler;
    this.headers = params.headers;
  }

  private async connectToTransport({
    throwOnError,
    transport,
  }: {
    throwOnError: boolean;
    transport: StreamableHTTPClientTransport | SSEClientTransport;
  }): Promise<boolean> {
    try {
      await this.connect(transport);
      logger.info(
        `[${this.name}] connected successfully to ${this.url} via Streamable`,
      );
      this.status = "connected";
      this.lastErrorMessage = undefined;
      this.lastConnectedAt = new Date();
      return true;
    } catch (error) {
      const { appError, lastErrorMessage, status } = transportErrorToAppError(
        error,
        this.url,
        this.name,
      );
      this.status = status;
      this.lastErrorMessage = lastErrorMessage;
      if (throwOnError) {
        throw appError;
      } else {
        return false;
      }
    }
  }

  async connectToSSE({
    throwOnError,
  }: {
    throwOnError: boolean;
  }): Promise<boolean> {
    return await this.connectToTransport({
      throwOnError,
      transport: new SSEClientTransport(new URL(this.url), {
        requestInit: { headers: this.headers },
        authProvider: this.oAuthHandler?.getProvider(this.name),
      }),
    });
  }

  async connectToStreamable({
    throwOnError,
  }: {
    throwOnError: boolean;
  }): Promise<boolean> {
    return await this.connectToTransport({
      throwOnError,
      transport: new StreamableHTTPClientTransport(new URL(this.url), {
        requestInit: { headers: this.headers },
        authProvider: this.oAuthHandler?.getProvider(this.name),
      }),
    });
  }

  async performOAuthFlow(onRedirect: (url: URL) => void): Promise<void> {
    if (!this.oAuthHandler) {
      throw new AppError(
        ErrorCode.UNAUTHORIZED,
        "OAuth authentication required but no authorization handler provided",
      );
    }

    const oAuthProvider = this.oAuthHandler.getProvider(this.name, {
      onRedirect,
    });

    try {
      await this.connectToTransport({
        throwOnError: true,
        transport: new StreamableHTTPClientTransport(new URL(this.url), {
          requestInit: { headers: this.headers },
          authProvider: oAuthProvider,
        }),
      });
    } catch (error) {
      if (isAppErrorWithCode(error, ErrorCode.UNAUTHORIZED)) {
        logger.info(
          `[${this.name}] OAuth authentication required for ${this.url}`,
        );

        // Create a temporary transport just for OAuth flow
        const oauthTransport = new StreamableHTTPClientTransport(
          new URL(this.url),
          {
            requestInit: { headers: this.headers },
            authProvider: oAuthProvider,
          },
        );

        // Get authorization code from the handler
        const authCode = await oAuthProvider.onAuthorizationRequired(
          new URL(this.url),
        );

        // Complete OAuth flow
        await oauthTransport.finishAuth(authCode);
        logger.info(`[${this.name}] oAuth token exchange completed`);
        await this.connectToTransport({
          throwOnError: true,
          transport: new StreamableHTTPClientTransport(new URL(this.url), {
            requestInit: { headers: this.headers },
            authProvider: oAuthProvider,
          }),
        });
      } else {
        throw error;
      }
    }
  }

  // TODO: returns true if connected, false if not
  public async connectToTarget(
    {
      throwOnError,
    }: {
      throwOnError: boolean;
    } = { throwOnError: true },
  ) {
    try {
      return await this.connectToStreamable({ throwOnError: true });
    } catch (error) {
      if (isAppErrorWithCode(error, ErrorCode.UNAUTHORIZED)) {
        // OAuth required - user need to authorize
        if (throwOnError) {
          throw error;
        } else {
          return false;
        }
      } else {
        return await this.connectToSSE({ throwOnError });
      }
    }
  }

  public static async createAndConnectToHTTP(
    url: string,
    headers?: Record<string, string>,
    oAuthHandler?: OAuthHandler,
  ) {
    const client = new HTTPClient({
      name: "test streamable client",
      url,
      headers,
      oAuthHandler,
    });
    await client.connectToTarget();
    return client;
  }

  public toPlainObject(): SerializedClient {
    return {
      name: this.name,
      status: this.status,
      lastConnectedAt: this.lastConnectedAt,
      lastErrorMessage: this.lastErrorMessage,
      command: this.url,
      type: "http",
    };
  }
}

function transportErrorToAppError(
  error: unknown,
  serverUrl: string,
  serverName: string,
): {
  appError: AppError;
  lastErrorMessage: string;
  status: "connected" | "unauthorized" | "error";
} {
  let status: "connected" | "unauthorized" | "error";
  let lastErrorMessage: string;
  let appError: AppError;

  if (error instanceof UnauthorizedError) {
    status = "unauthorized";
    lastErrorMessage = "unauthorized, please re-authenticate";
    appError = new AppError(
      ErrorCode.UNAUTHORIZED,
      `authorization required, [${serverName}] failed to connect to ${serverUrl}`,
      { targetName: serverName, url: serverUrl, message: error.message },
    );
  } else if (
    error instanceof SseError &&
    error.message.includes("ECONNREFUSED")
  ) {
    status = "error";
    lastErrorMessage = "connection refused";

    appError = new AppError(
      ErrorCode.CONNECTION_REFUSED,
      `connection refused, [${serverName}] failed to connect to ${serverUrl}`,
      { targetName: serverName, url: serverUrl },
    );
  } else {
    status = "error";
    lastErrorMessage = error instanceof Error ? error.message : "unknown error";
    appError = new AppError(
      ErrorCode.CONNECTION_REFUSED,
      `connection refused, [${serverName}] failed to connect to ${serverUrl}`,
      { targetName: serverName, url: serverUrl },
    );
  }
  return { appError, lastErrorMessage, status };
}
