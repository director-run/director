import { AppError, ErrorCode } from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import {
  type OAuthClientProvider,
  UnauthorizedError,
} from "@modelcontextprotocol/sdk/client/auth.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  type OAuthClientInformation,
  type OAuthClientInformationFull,
  type OAuthClientMetadata,
  type OAuthTokens,
} from "@modelcontextprotocol/sdk/shared/auth.js";
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import packageJson from "../package.json";

// const CONNECT_RETRY_INTERVAL = 2500;
// const CONNECT_RETRY_COUNT = 3;

const logger = getLogger("SimpleClient");

export class SimpleClient extends Client {
  public name: string;

  constructor(name: string) {
    super(
      {
        name,
        version: packageJson.version,
      },
      {
        capabilities: {
          prompts: {},
          resources: { subscribe: true },
          tools: {},
        },
      },
    );
    this.name = name;
  }

  public toPlainObject() {
    return {
      name: this.name,
    };
  }

  public async connectToHTTP(
    url: string,
    headers?: Record<string, string>,
    oauthProvider?: OAuthClientProvider,
  ) {
    try {
      const streamableTransport = new StreamableHTTPClientTransport(
        new URL(url),
        {
          requestInit: {
            headers,
          },
          ...(oauthProvider && { authProvider: oauthProvider }),
        },
      );
      await this.connect(streamableTransport);
      logger.info(`[${this.name}] connected successfully to ${url}`);
    } catch (e) {
      if (e instanceof UnauthorizedError && oauthProvider) {
        // Re-throw OAuth errors for the caller to handle OAuth flow
        throw e;
      }

      try {
        const sseTransport = new SSEClientTransport(new URL(url), {
          requestInit: {
            headers,
          },
          ...(oauthProvider && { authProvider: oauthProvider }),
        });
        await this.connect(sseTransport);
        logger.info(`[${this.name}] connected successfully to ${url}`);
      } catch (e) {
        if (e instanceof UnauthorizedError && oauthProvider) {
          // Re-throw OAuth errors for the caller to handle OAuth flow
          throw e;
        }

        throw new AppError(
          ErrorCode.CONNECTION_REFUSED,
          `[${this.name}] failed to connect to ${url}`,
          {
            targetName: this.name,
            url,
            error: e,
          },
        );
      }
    }
  }

  /**
   * Connect to HTTP server with full OAuth flow handling.
   * This method handles the complete OAuth flow internally, including
   * waiting for authorization and token exchange.
   */
  public async connectToHTTPWithOAuth(
    url: string,
    oauthProvider: OAuthClientProvider,
    headers?: Record<string, string>,
    onAuthorizationRequired?: (authUrl: URL) => Promise<string>,
  ) {
    const attemptConnectionWithOAuth = async (
      transport: StreamableHTTPClientTransport,
    ): Promise<void> => {
      try {
        await this.connect(transport);
        logger.info(`[${this.name}] connected successfully to ${url}`);
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          logger.info(
            `[${this.name}] OAuth authentication required for ${url}`,
          );

          if (!onAuthorizationRequired) {
            throw new Error(
              "OAuth authentication required but no authorization handler provided",
            );
          }

          // Get authorization code from the handler
          const authCode = await onAuthorizationRequired(new URL(url));

          // Complete OAuth flow with the transport
          await transport.finishAuth(authCode);
          logger.info(`[${this.name}] OAuth token exchange completed`);

          // Create a NEW transport instance for retry - the old one is already started
          const newTransport = new StreamableHTTPClientTransport(new URL(url), {
            requestInit: {
              headers,
            },
            authProvider: oauthProvider,
          });

          // Retry connection with new transport after OAuth completion
          await this.connect(newTransport);
          logger.info(
            `[${this.name}] connected successfully after OAuth flow to ${url}`,
          );
        } else {
          throw error;
        }
      }
    };

    // Try StreamableHTTPClientTransport first
    try {
      const streamableTransport = new StreamableHTTPClientTransport(
        new URL(url),
        {
          requestInit: {
            headers,
          },
          authProvider: oauthProvider,
        },
      );
      await attemptConnectionWithOAuth(streamableTransport);
      return; // Success - exit early
    } catch (streamableError) {
      logger.info(`[${this.name}] StreamableHTTP failed, trying SSE transport`);

      // If StreamableHTTP fails (not due to OAuth), try SSE
      try {
        const sseTransport = new SSEClientTransport(new URL(url), {
          requestInit: {
            headers,
          },
          authProvider: oauthProvider,
        });

        // For SSE, we can't use the same OAuth flow pattern, so just try to connect
        await this.connect(sseTransport);
        logger.info(`[${this.name}] connected successfully to ${url} via SSE`);
      } catch (sseError) {
        throw new AppError(
          ErrorCode.CONNECTION_REFUSED,
          `[${this.name}] failed to connect to ${url} with OAuth`,
          {
            targetName: this.name,
            url,
            streamableError,
            sseError,
          },
        );
      }
    }
  }

  public async connectToStdio(
    command: string,
    args: string[],
    env?: Record<string, string>,
  ) {
    try {
      await this.connect(new StdioClientTransport({ command, args, env }));
    } catch (e) {
      if (e instanceof Error && (e as ErrnoException).code === "ENOENT") {
        throw new AppError(
          ErrorCode.CONNECTION_REFUSED,
          `[${this.name}] command not found: '${command}'. Please make sure it is installed and available in your $PATH.`,
          {
            targetName: this.name,
            command,
            args,
            env,
          },
        );
      } else if (e instanceof McpError) {
        throw new AppError(
          ErrorCode.CONNECTION_REFUSED,
          `[${this.name}] failed to run '${[command, ...args].join(" ")}'. Please check the logs for more details.`,
          {
            targetName: this.name,
            command,
            args,
            env,
          },
        );
      } else {
        throw e;
      }
    }
  }

  public static async createAndConnectToServer(
    server: Server,
  ): Promise<SimpleClient> {
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();

    const client = new SimpleClient("test client");

    await Promise.all([
      client.connect(clientTransport),
      server.connect(serverTransport),
    ]);

    return client;
  }

  public static async createAndConnectToHTTP(
    url: string,
    headers?: Record<string, string>,
    oauthProvider?: OAuthClientProvider,
  ) {
    const client = new SimpleClient("test streamable client");
    await client.connectToHTTP(url, headers, oauthProvider);
    return client;
  }

  /**
   * Static factory method for connecting with full OAuth flow handling
   */
  public static async createAndConnectToHTTPWithOAuth(
    url: string,
    oauthProvider: OAuthClientProvider,
    headers?: Record<string, string>,
    onAuthorizationRequired?: (authUrl: URL) => Promise<string>,
  ) {
    const client = new SimpleClient("oauth-enabled-client");
    await client.connectToHTTPWithOAuth(
      url,
      oauthProvider,
      headers,
      onAuthorizationRequired,
    );
    return client;
  }

  /**
   * Creates a basic in-memory OAuth provider for testing and simple use cases.
   * For production use, implement a persistent OAuth provider.
   */
  public static createOAuthProvider(
    redirectUrl: string | URL,
    clientMetadata: OAuthClientMetadata,
    onRedirect?: (url: URL) => void,
  ): OAuthClientProvider {
    return new InMemoryOAuthProvider(redirectUrl, clientMetadata, onRedirect);
  }

  public static async createAndConnectToStdio(
    command: string,
    args: string[],
    env?: Record<string, string>,
  ) {
    const client = new SimpleClient("test client");
    await client.connectToStdio(command, args, env);
    return client;
  }
}

/**
 * Simple in-memory OAuth client provider for basic OAuth flows.
 * Based on the oauth.ts example but simplified for library use.
 */
class InMemoryOAuthProvider implements OAuthClientProvider {
  private _clientInformation?: OAuthClientInformationFull;
  private _tokens?: OAuthTokens;
  private _codeVerifier?: string;

  constructor(
    private readonly _redirectUrl: string | URL,
    private readonly _clientMetadata: OAuthClientMetadata,
    private readonly _onRedirect?: (url: URL) => void,
  ) {}

  get redirectUrl(): string | URL {
    return this._redirectUrl;
  }

  get clientMetadata(): OAuthClientMetadata {
    return this._clientMetadata;
  }

  clientInformation(): OAuthClientInformation | undefined {
    return this._clientInformation;
  }

  saveClientInformation(clientInformation: OAuthClientInformationFull): void {
    this._clientInformation = clientInformation;
  }

  tokens(): OAuthTokens | undefined {
    return this._tokens;
  }

  saveTokens(tokens: OAuthTokens): void {
    this._tokens = tokens;
  }

  redirectToAuthorization(authorizationUrl: URL): void {
    if (this._onRedirect) {
      this._onRedirect(authorizationUrl);
    } else {
      logger.info(`OAuth redirect required: ${authorizationUrl.toString()}`);
    }
  }

  saveCodeVerifier(codeVerifier: string): void {
    this._codeVerifier = codeVerifier;
  }

  codeVerifier(): string {
    if (!this._codeVerifier) {
      throw new Error("No code verifier saved");
    }
    return this._codeVerifier;
  }

  // TODO: not sure we need retry logic?
  // async connect(transport: Transport) {
  //   let count = 0;
  //   let retry = true;

  //   while (retry) {
  //     try {
  //       await super.connect(transport);
  //       break;
  //     } catch (error) {
  //       logger.error({
  //         message: `error while connecting to server "${this.name}"`,
  //         name: this.name,
  //         retriesRemaining: CONNECT_RETRY_COUNT - count,
  //         error: error,
  //       });

  //       count++;
  //       retry = count < CONNECT_RETRY_COUNT;
  //       if (retry) {
  //         try {
  //           await this.close();
  //         } catch {}
  //         await sleep(CONNECT_RETRY_INTERVAL);
  //       } else {
  //         try {
  //           await this.close();
  //         } catch {}
  //         throw error;
  //       }
  //     }
  //   }
  // }
}
