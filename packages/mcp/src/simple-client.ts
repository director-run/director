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
    onAuthorizationRequired?: (authUrl: URL) => Promise<string>,
  ) {
    const attemptStreamableConnection = async (
      useOAuth = false,
    ): Promise<boolean> => {
      try {
        const transport = new StreamableHTTPClientTransport(new URL(url), {
          requestInit: { headers },
          ...(oauthProvider && { authProvider: oauthProvider }),
        });
        await this.connect(transport);
        logger.info(
          `[${this.name}] connected successfully to ${url} via Streamable`,
        );
        return true;
      } catch (error) {
        if (error instanceof UnauthorizedError && oauthProvider && !useOAuth) {
          // First unauthorized attempt - will trigger OAuth flow
          throw error;
        }
        return false;
      }
    };

    const attemptSSEConnection = async (useOAuth = false): Promise<boolean> => {
      try {
        const transport = new SSEClientTransport(new URL(url), {
          requestInit: { headers },
          ...(oauthProvider && { authProvider: oauthProvider }),
        });
        await this.connect(transport);
        logger.info(`[${this.name}] connected successfully to ${url} via SSE`);
        return true;
      } catch (error) {
        if (error instanceof UnauthorizedError && oauthProvider && !useOAuth) {
          // First unauthorized attempt - will trigger OAuth flow
          throw error;
        }
        return false;
      }
    };

    const performOAuthFlow = async (): Promise<void> => {
      if (!onAuthorizationRequired) {
        throw new Error(
          "OAuth authentication required but no authorization handler provided",
        );
      }

      logger.info(`[${this.name}] OAuth authentication required for ${url}`);

      // Create a temporary transport just for OAuth flow
      const oauthTransport = new StreamableHTTPClientTransport(new URL(url), {
        requestInit: { headers },
        authProvider: oauthProvider,
      });

      // Get authorization code from the handler
      const authCode = await onAuthorizationRequired(new URL(url));

      // Complete OAuth flow
      await oauthTransport.finishAuth(authCode);
      logger.info(`[${this.name}] OAuth token exchange completed`);
    };

    // First attempt: Try both transports without OAuth
    try {
      if (await attemptStreamableConnection()) {
        return;
      }
    } catch (error) {
      if (error instanceof UnauthorizedError && oauthProvider) {
        // OAuth required - perform flow and retry
        await performOAuthFlow();

        // Retry both transports after OAuth
        if (await attemptStreamableConnection(true)) {
          return;
        }
        if (await attemptSSEConnection(true)) {
          return;
        }

        throw new AppError(
          ErrorCode.CONNECTION_REFUSED,
          `[${this.name}] failed to connect to ${url} even after OAuth`,
          { targetName: this.name, url },
        );
      }
      // Non-OAuth error with streamable, try SSE
    }

    try {
      if (await attemptSSEConnection()) {
        return;
      }
    } catch (error) {
      if (error instanceof UnauthorizedError && oauthProvider) {
        // OAuth required - perform flow and retry
        await performOAuthFlow();

        // Retry both transports after OAuth
        if (await attemptStreamableConnection(true)) {
          return;
        }
        if (await attemptSSEConnection(true)) {
          return;
        }

        throw new AppError(
          ErrorCode.CONNECTION_REFUSED,
          `[${this.name}] failed to connect to ${url} even after OAuth`,
          { targetName: this.name, url },
        );
      }
    }

    // If we get here, both transports failed without OAuth requirement
    throw new AppError(
      ErrorCode.CONNECTION_REFUSED,
      `[${this.name}] failed to connect to ${url}`,
      { targetName: this.name, url },
    );
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
    onAuthorizationRequired?: (authUrl: URL) => Promise<string>,
  ) {
    const client = new SimpleClient("test streamable client");
    await client.connectToHTTP(
      url,
      headers,
      oauthProvider,
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
