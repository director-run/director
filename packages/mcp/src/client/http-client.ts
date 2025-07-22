import { AppError, ErrorCode } from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import {
  type OAuthClientProvider,
  UnauthorizedError,
} from "@modelcontextprotocol/sdk/client/auth.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { AbstractClient } from "./abstract-client";

const logger = getLogger("client/http");

export class HTTPClient extends AbstractClient {
  public readonly url: string;
  private oauthProvider?: OAuthClientProvider;
  private headers?: Record<string, string>;
  private onAuthorizationRequired?: (authUrl: URL) => Promise<string>;

  constructor(params: {
    url: string;
    name: string;
    oauthProvider?: OAuthClientProvider;
    onAuthorizationRequired?: (authUrl: URL) => Promise<string>;
    headers?: Record<string, string>;
  }) {
    super(params.name);
    this.url = params.url;
    this.oauthProvider = params.oauthProvider;
    this.headers = params.headers;
    this.onAuthorizationRequired = params.onAuthorizationRequired;
  }

  async connectToSSE(): Promise<boolean> {
    try {
      const transport = new SSEClientTransport(new URL(this.url), {
        requestInit: { headers: this.headers },
        ...(this.oauthProvider && { authProvider: this.oauthProvider }),
      });
      await this.connect(transport);
      logger.info(
        `[${this.name}] connected successfully to ${this.url} via SSE`,
      );
      this.status = "connected";
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedError && this.oauthProvider) {
        // First unauthorized attempt - will trigger OAuth flow
        this.status = "unauthorized";
        throw error;
      }
      this.status = "disconnected";
      return false;
    }
  }

  async connectToStreamable(): Promise<boolean> {
    try {
      const transport = new StreamableHTTPClientTransport(new URL(this.url), {
        requestInit: { headers: this.headers },
        ...(this.oauthProvider && { authProvider: this.oauthProvider }),
      });
      await this.connect(transport);
      logger.info(
        `[${this.name}] connected successfully to ${this.url} via Streamable`,
      );
      this.status = "connected";
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedError && this.oauthProvider) {
        // First unauthorized attempt - will trigger OAuth flow
        this.status = "unauthorized";
        throw error;
      }
      this.status = "disconnected";
      return false;
    }
  }

  public async connectToTarget(
    {
      throwOnError,
    }: {
      throwOnError: boolean;
    } = { throwOnError: true },
  ) {
    const performOAuthFlow = async (): Promise<void> => {
      if (!this.onAuthorizationRequired) {
        throw new AppError(
          ErrorCode.UNAUTHORIZED,
          "OAuth authentication required but no authorization handler provided",
        );
      }

      logger.info(
        `[${this.name}] OAuth authentication required for ${this.url}`,
      );

      // Create a temporary transport just for OAuth flow
      const oauthTransport = new StreamableHTTPClientTransport(
        new URL(this.url),
        {
          requestInit: { headers: this.headers },
          authProvider: this.oauthProvider,
        },
      );

      // Get authorization code from the handler
      const authCode = await this.onAuthorizationRequired(new URL(this.url));

      // Complete OAuth flow
      await oauthTransport.finishAuth(authCode);
      logger.info(`[${this.name}] OAuth token exchange completed`);
    };

    // First attempt: Try both transports without OAuth
    try {
      if (await this.connectToStreamable()) {
        return;
      }
    } catch (error) {
      if (error instanceof UnauthorizedError && this.oauthProvider) {
        // OAuth required - perform flow and retry
        await performOAuthFlow();

        // Retry both transports after OAuth
        if (await this.connectToStreamable()) {
          return;
        }
        if (await this.connectToSSE()) {
          return;
        }

        throw new AppError(
          ErrorCode.CONNECTION_REFUSED,
          `[${this.name}] failed to connect to ${this.url} even after OAuth`,
          { targetName: this.name, url: this.url },
        );
      }
      // Non-OAuth error with streamable, try SSE
    }

    try {
      if (await this.connectToSSE()) {
        return;
      }
    } catch (error) {
      if (error instanceof UnauthorizedError && this.oauthProvider) {
        // OAuth required - perform flow and retry
        await performOAuthFlow();

        // Retry both transports after OAuth
        if (await this.connectToStreamable()) {
          return;
        }
        if (await this.connectToSSE()) {
          return;
        }

        throw new AppError(
          ErrorCode.CONNECTION_REFUSED,
          `[${this.name}] failed to connect to ${this.url} even after OAuth`,
          { targetName: this.name, url: this.url },
        );
      }
    }

    // If we get here, both transports failed without OAuth requirement
    throw new AppError(
      ErrorCode.CONNECTION_REFUSED,
      `[${this.name}] failed to connect to ${this.url}`,
      { targetName: this.name, url: this.url },
    );
  }

  public static async createAndConnectToHTTP(
    url: string,
    headers?: Record<string, string>,
    oauthProvider?: OAuthClientProvider,
    onAuthorizationRequired?: (authUrl: URL) => Promise<string>,
  ) {
    const client = new HTTPClient({
      name: "test streamable client",
      url,
      headers,
      oauthProvider,
      onAuthorizationRequired,
    });
    await client.connectToTarget();
    return client;
  }
}
