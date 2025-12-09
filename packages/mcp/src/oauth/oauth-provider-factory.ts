import { getLogger } from "@director.run/utilities/logger";
import { joinURL } from "@director.run/utilities/url";
import { type OAuthClientProvider } from "@modelcontextprotocol/sdk/client/auth.js";
import {
  type OAuthClientInformation,
  type OAuthClientInformationFull,
  type OAuthClientMetadata,
  type OAuthTokens,
} from "@modelcontextprotocol/sdk/shared/auth.js";
import type { AbstractOAuthStorage } from "./storage/abstract-oauth-storage";
import { InMemoryOAuthStorage } from "./storage/in-memory-oauth-storage";
import { OnDiskOAuthStorage } from "./storage/on-disk-oauth-storage";

const logger = getLogger("oauth/provider");

interface OAuthProviderParams {
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
      client_name: "Director OAuth Client",
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
    this._clientInformation = await this._storage.getClientInformation(
      this._id,
    );
    return this._clientInformation;
  }

  async saveClientInformation(
    clientInformation: OAuthClientInformationFull,
  ): Promise<void> {
    this._clientInformation = clientInformation;
    await this._storage.saveClientInformation(this._id, clientInformation);
  }

  async tokens(): Promise<OAuthTokens | undefined> {
    if (this._tokens) {
      return this._tokens;
    }
    this._tokens = await this._storage.getTokens(this._id);
    return this._tokens;
  }

  async saveTokens(tokens: OAuthTokens): Promise<void> {
    this._tokens = tokens;
    await this._storage.saveTokens(this._id, tokens);
  }

  async deleteTokens(): Promise<void> {
    this._tokens = undefined;
    await this._storage.deleteTokens(this._id);
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
    await this._storage.saveCodeVerifier(this._id, codeVerifier);
  }

  async codeVerifier(): Promise<string> {
    if (this._codeVerifier) {
      return this._codeVerifier;
    }
    this._codeVerifier = await this._storage.getCodeVerifier(this._id);
    if (!this._codeVerifier) {
      throw new Error("No code verifier saved");
    }
    return this._codeVerifier;
  }
}

export class OAuthProviderFactory {
  private _baseCallbackUrl: string;
  private _storage: AbstractOAuthStorage;
  private _id: string;

  constructor(params: OAuthProviderFactoryParams) {
    this._baseCallbackUrl = params.baseCallbackUrl;
    this._id = params.id || "default";

    if (params.storage === "disk") {
      this._storage = new OnDiskOAuthStorage({
        directory: params.tokenDirectory,
        filePrefix: [params.filePrefix, this._id].filter(Boolean).join("-"),
      });
    } else if (params.storage === "custom") {
      this._storage = params.storageInstance;
    } else {
      this._storage = new InMemoryOAuthStorage();
    }
  }

  getProvider({
    providerId,
    onRedirect,
  }: {
    providerId: string;
    onRedirect?: (url: URL) => void;
  }) {
    return new OAuthProvider({
      onRedirect,
      id: providerId,
      redirectUrl: joinURL(
        this._baseCallbackUrl,
        `oauth/${this._id}/${providerId}/callback`,
      ),
      storage: this._storage,
    });
  }
}

export type OAuthProviderFactoryParams =
  | {
      storage: "disk";
      tokenDirectory: string;
      baseCallbackUrl: string;
      filePrefix?: string;
      id?: string;
    }
  | {
      storage: "memory";
      baseCallbackUrl: string;
      id?: string;
    }
  | {
      storage: "custom";
      storageInstance: AbstractOAuthStorage;
      baseCallbackUrl: string;
      id?: string;
    };
