import {} from "@director.run/utilities/env";
import { getLogger } from "@director.run/utilities/logger";
import {} from "@director.run/utilities/secure-json";
import { type OAuthClientProvider } from "@modelcontextprotocol/sdk/client/auth.js";
import {
  type OAuthClientInformation,
  type OAuthClientInformationFull,
  type OAuthClientMetadata,
  type OAuthTokens,
} from "@modelcontextprotocol/sdk/shared/auth.js";
import { waitForOAuthCallback } from "./helpers";
import { AbstractOAuthStorage } from "./storage/abstract-oauth-storage";
import { InMemoryOAuthStorage } from "./storage/in-memory-oauth-storage";
import { OnDiskOAuthStorage } from "./storage/on-disk-oauth-storage";

const logger = getLogger("oauth/provider");

const CALLBACK_PORT = 8090;
const CALLBACK_URL = `http://localhost:${CALLBACK_PORT}/callback`;

export interface OAuthProviderParams {
  id: string;
  redirectUrl: string | URL;
  storage: AbstractOAuthStorage;
  onRedirect?: (url: URL) => void;
}

export class OAuthProvider implements OAuthClientProvider {
  private _clientInformation?: OAuthClientInformationFull;
  private _tokens?: OAuthTokens;
  private _codeVerifier?: string;
  private _clientMetadata: OAuthClientMetadata;
  private _id: string;
  private readonly _redirectUrl: string | URL;
  private readonly _storage: AbstractOAuthStorage;
  private readonly _onRedirect?: (url: URL) => void;

  constructor(params: OAuthProviderParams) {
    this._id = params.id;
    this._redirectUrl = params.redirectUrl;
    this._storage = params.storage;
    this._onRedirect = params.onRedirect;

    this._clientMetadata = {
      client_name: "Simple OAuth MCP Client",
      redirect_uris: [this._redirectUrl.toString()],
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_method: "client_secret_post",
      scope: "mcp:tools",
    };
  }

  get redirectUrl(): string | URL {
    return this._redirectUrl;
  }

  get clientMetadata(): OAuthClientMetadata {
    return this._clientMetadata;
  }

  async clientInformation(): Promise<OAuthClientInformation | undefined> {
    if (this._clientInformation) {
      return this._clientInformation;
    }
    this._clientInformation = await this._storage.getClientInformation();
    return this._clientInformation;
  }

  async saveClientInformation(
    clientInformation: OAuthClientInformationFull,
  ): Promise<void> {
    this._clientInformation = clientInformation;
    await this._storage.saveClientInformation(clientInformation);
  }

  async tokens(): Promise<OAuthTokens | undefined> {
    if (this._tokens) {
      return this._tokens;
    }
    this._tokens = await this._storage.getTokens();
    return this._tokens;
  }

  async saveTokens(tokens: OAuthTokens): Promise<void> {
    this._tokens = tokens;
    await this._storage.saveTokens(tokens);
  }

  redirectToAuthorization(authorizationUrl: URL): void {
    if (this._onRedirect) {
      this._onRedirect(authorizationUrl);
    } else {
      logger.info(`oauth redirect required: ${authorizationUrl.toString()}`);
    }
  }

  async saveCodeVerifier(codeVerifier: string): Promise<void> {
    this._codeVerifier = codeVerifier;
    await this._storage.saveCodeVerifier(codeVerifier);
  }

  async codeVerifier(): Promise<string> {
    if (this._codeVerifier) {
      return this._codeVerifier;
    }
    this._codeVerifier = await this._storage.getCodeVerifier();
    if (!this._codeVerifier) {
      throw new Error("No code verifier saved");
    }
    return this._codeVerifier;
  }

  async onAuthorizationRequired(url: URL) {
    logger.warn({
      message: "oauth flow required, waiting for callback",
    });
    return await waitForOAuthCallback(CALLBACK_PORT);
  }
}

export interface OAuthHandlerParams {
  storage?: AbstractOAuthStorage;
  directory?: string;
  filePrefix?: string;
}

export class OAuthHandler {
  private _callbackUrl: string;
  private _storage: AbstractOAuthStorage;

  constructor(params: OAuthHandlerParams = {}) {
    this._callbackUrl = CALLBACK_URL;
    if (params.storage) {
      this._storage = params.storage;
    } else if (params.directory) {
      this._storage = new OnDiskOAuthStorage({
        providerId: "default",
        directory: params.directory,
        filePrefix: params.filePrefix,
      });
    } else {
      this._storage = new InMemoryOAuthStorage();
    }
  }

  getProvider(
    id: string,
    params: {
      onRedirect?: (url: URL) => void;
    } = {},
  ) {
    return new OAuthProvider({
      id,
      redirectUrl: this._callbackUrl,
      storage: this._storage,
      onRedirect: params.onRedirect,
    });
  }
}
