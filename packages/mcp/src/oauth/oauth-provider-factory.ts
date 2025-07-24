import path from "node:path";
import {} from "@director.run/utilities/env";
import { readJSONFile, writeJSONFile } from "@director.run/utilities/json";
import { getLogger } from "@director.run/utilities/logger";
import { type OAuthClientProvider } from "@modelcontextprotocol/sdk/client/auth.js";
import {
  type OAuthClientInformation,
  type OAuthClientInformationFull,
  type OAuthClientMetadata,
  type OAuthTokens,
} from "@modelcontextprotocol/sdk/shared/auth.js";
import { waitForOAuthCallback } from "./helpers";

const logger = getLogger("oauth/provider");

const CALLBACK_PORT = 8090;
const CALLBACK_URL = `http://localhost:${CALLBACK_PORT}/callback`;

export class OAuthHandler {
  private _id: string;
  private _callbackUrl: string;
  private _storage: "memory" | "disk";

  constructor({ id, storage }: { id: string; storage?: "memory" | "disk" }) {
    this._id = id;
    this._callbackUrl = CALLBACK_URL;
    this._storage = storage || "memory";
  }

  getProvider(
    params: {
      onRedirect?: (url: URL) => void;
    } = {},
  ) {
    const clientMetadata = {
      client_name: "Simple OAuth MCP Client",
      redirect_uris: [this._callbackUrl],
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_method: "client_secret_post",
      scope: "mcp:tools",
    };

    const oauthProvider =
      this._storage === "disk"
        ? new OnDiskOAuthProvider(
            this._callbackUrl,
            clientMetadata,
            params.onRedirect,
            this._id,
          )
        : new InMemoryOAuthProvider(
            this._callbackUrl,
            clientMetadata,
            params.onRedirect,
          );

    return {
      oauthProvider,
      onAuthorizationRequired: async (url: URL) => {
        console.log("xxxxx onAuthorizationRequired");
        logger.warn({
          message: "oauth flow required, waiting for callback",
        });
        return await waitForOAuthCallback(CALLBACK_PORT);
      },
    };
  }
}

export class InMemoryOAuthProvider implements OAuthClientProvider {
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
    logger.info({ message: "saveClientInformation", clientInformation });
    this._clientInformation = clientInformation;
  }

  tokens(): OAuthTokens | undefined {
    logger.info("getting tokens...");
    return this._tokens;
  }

  saveTokens(tokens: OAuthTokens): void {
    logger.info("saving tokens");
    this._tokens = tokens;
  }

  redirectToAuthorization(authorizationUrl: URL): void {
    if (this._onRedirect) {
      this._onRedirect(authorizationUrl);
    } else {
      logger.info(`oauth redirect required: ${authorizationUrl.toString()}`);
    }
  }

  saveCodeVerifier(codeVerifier: string): void {
    logger.info({ message: "saving code verifier", codeVerifier });
    this._codeVerifier = codeVerifier;
  }

  codeVerifier(): string {
    if (!this._codeVerifier) {
      throw new Error("No code verifier saved");
    }
    return this._codeVerifier;
  }
}

export class OnDiskOAuthProvider implements OAuthClientProvider {
  private _clientInformation?: OAuthClientInformationFull;
  private _tokens?: OAuthTokens;
  private _codeVerifier?: string;
  private readonly _dataDir: string;
  private readonly _clientInfoPath: string;
  private readonly _tokensPath: string;
  private readonly _codeVerifierPath: string;

  constructor(
    private readonly _redirectUrl: string | URL,
    private readonly _clientMetadata: OAuthClientMetadata,
    private readonly _onRedirect?: (url: URL) => void,
    private readonly _providerId?: string,
  ) {
    this._dataDir = this._getDataDir();
    const providerDir = path.join(
      this._dataDir,
      "oauth",
      this._providerId || "default",
    );
    this._clientInfoPath = path.join(providerDir, "client-info.json");
    this._tokensPath = path.join(providerDir, "tokens.json");
    this._codeVerifierPath = path.join(providerDir, "code-verifier.json");
  }

  private _getDataDir(): string {
    return path.join(process.cwd(), "oauth");
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

    try {
      this._clientInformation = await readJSONFile<OAuthClientInformationFull>(
        this._clientInfoPath,
      );
      logger.info({
        message: "loaded client information from disk",
        path: this._clientInfoPath,
      });
      return this._clientInformation;
    } catch (error) {
      logger.debug({
        message: "no client information found on disk",
        path: this._clientInfoPath,
      });
      return undefined;
    }
  }

  async saveClientInformation(
    clientInformation: OAuthClientInformationFull,
  ): Promise<void> {
    logger.info({
      message: "saving client information to disk",
      path: this._clientInfoPath,
    });
    this._clientInformation = clientInformation;
    await writeJSONFile(this._clientInfoPath, clientInformation);
  }

  async tokens(): Promise<OAuthTokens | undefined> {
    if (this._tokens) {
      return this._tokens;
    }

    try {
      this._tokens = await readJSONFile<OAuthTokens>(this._tokensPath);
      logger.info({
        message: "loaded tokens from disk",
        path: this._tokensPath,
      });
      return this._tokens;
    } catch (error) {
      logger.debug({
        message: "no tokens found on disk",
        path: this._tokensPath,
      });
      return undefined;
    }
  }

  async saveTokens(tokens: OAuthTokens): Promise<void> {
    logger.info({ message: "saving tokens to disk", path: this._tokensPath });
    this._tokens = tokens;
    await writeJSONFile(this._tokensPath, tokens);
  }

  redirectToAuthorization(authorizationUrl: URL): void {
    if (this._onRedirect) {
      this._onRedirect(authorizationUrl);
    } else {
      logger.info(`oauth redirect required: ${authorizationUrl.toString()}`);
    }
  }

  async saveCodeVerifier(codeVerifier: string): Promise<void> {
    logger.info({
      message: "saving code verifier to disk",
      path: this._codeVerifierPath,
    });
    this._codeVerifier = codeVerifier;
    await writeJSONFile(this._codeVerifierPath, codeVerifier);
  }

  async codeVerifier(): Promise<string> {
    if (this._codeVerifier) {
      return this._codeVerifier;
    }

    try {
      this._codeVerifier = await readJSONFile<string>(this._codeVerifierPath);
      logger.info({
        message: "loaded code verifier from disk",
        path: this._codeVerifierPath,
      });
      return this._codeVerifier;
    } catch (error) {
      throw new Error("No code verifier saved");
    }
  }
}
