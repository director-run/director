import path from "node:path";
import {} from "@director.run/utilities/env";
import { ErrorCode } from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import {
  readSecureJSONFile,
  writeSecureJSONFile,
} from "@director.run/utilities/secure-json";
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
  private _callbackUrl: string;
  private _storage: "memory" | "disk";
  private _directory?: string;
  private _filePrefix?: string;

  constructor({
    storage,
    directory,
    filePrefix,
  }: {
    storage?: "memory" | "disk";
    directory?: string;
    filePrefix?: string;
  }) {
    this._callbackUrl = CALLBACK_URL;
    this._storage = storage || "memory";
    this._directory = directory;
    this._filePrefix = filePrefix;
  }

  getProvider(
    id: string,
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
            id,
            this._directory,
            this._filePrefix,
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
  private readonly _filePath: string;

  constructor(
    private readonly _redirectUrl: string | URL,
    private readonly _clientMetadata: OAuthClientMetadata,
    private readonly _onRedirect?: (url: URL) => void,
    private readonly _providerId?: string,
    private readonly _directory?: string,
    private readonly _filePrefix?: string,
  ) {
    const directory = this._directory || path.join(process.cwd(), "oauth");
    const prefix = this._filePrefix || "oauth";
    const providerId = this._providerId || "default";
    this._filePath = path.join(directory, `${prefix}-${providerId}.json`);
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
      const data = await this._loadData();
      this._clientInformation = data.clientInformation;
      if (data.clientInformation) {
        logger.info({
          message: "loaded client information from disk",
          path: this._filePath,
        });
      }
      return data.clientInformation;
    } catch (error) {
      // Only catch file not found errors, let permission errors propagate
      if (
        error instanceof Error &&
        "code" in error &&
        (error as { code: string }).code === ErrorCode.NOT_FOUND
      ) {
        logger.debug({
          message: "no client information found on disk",
          path: this._filePath,
        });
        return undefined;
      }
      throw error;
    }
  }

  async saveClientInformation(
    clientInformation: OAuthClientInformationFull,
  ): Promise<void> {
    logger.info({
      message: "saving client information to disk",
      path: this._filePath,
    });
    this._clientInformation = clientInformation;
    await this._saveData({ clientInformation });
  }

  async tokens(): Promise<OAuthTokens | undefined> {
    if (this._tokens) {
      return this._tokens;
    }

    try {
      const data = await this._loadData();
      this._tokens = data.tokens;
      if (data.tokens) {
        logger.info({
          message: "loaded tokens from disk",
          path: this._filePath,
        });
      }
      return data.tokens;
    } catch (error) {
      // Only catch file not found errors, let permission errors propagate
      if (
        error instanceof Error &&
        "code" in error &&
        (error as { code: string }).code === ErrorCode.NOT_FOUND
      ) {
        logger.debug({
          message: "no tokens found on disk",
          path: this._filePath,
        });
        return undefined;
      }
      throw error;
    }
  }

  async saveTokens(tokens: OAuthTokens): Promise<void> {
    logger.info({ message: "saving tokens to disk", path: this._filePath });
    this._tokens = tokens;
    await this._saveData({ tokens });
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
      path: this._filePath,
    });
    this._codeVerifier = codeVerifier;
    await this._saveData({ codeVerifier });
  }

  async codeVerifier(): Promise<string> {
    if (this._codeVerifier) {
      return this._codeVerifier;
    }

    try {
      const data = await this._loadData();
      this._codeVerifier = data.codeVerifier;
      if (data.codeVerifier) {
        logger.info({
          message: "loaded code verifier from disk",
          path: this._filePath,
        });
      }
      if (!data.codeVerifier) {
        throw new Error("No code verifier saved");
      }
      return data.codeVerifier;
    } catch (error) {
      // Only catch file not found errors, let permission errors propagate
      if (
        error instanceof Error &&
        "code" in error &&
        (error as { code: string }).code === ErrorCode.NOT_FOUND
      ) {
        throw new Error("No code verifier saved");
      }
      throw error;
    }
  }

  private async _loadData(): Promise<{
    clientInformation?: OAuthClientInformationFull;
    tokens?: OAuthTokens;
    codeVerifier?: string;
  }> {
    try {
      return await readSecureJSONFile(this._filePath);
    } catch (error) {
      // Only catch file not found errors, let permission errors propagate
      if (
        error instanceof Error &&
        "code" in error &&
        (error as { code: string }).code === ErrorCode.NOT_FOUND
      ) {
        return {};
      }
      throw error;
    }
  }

  private async _saveData(data: {
    clientInformation?: OAuthClientInformationFull;
    tokens?: OAuthTokens;
    codeVerifier?: string;
  }): Promise<void> {
    const existingData = await this._loadData();
    const mergedData = {
      ...existingData,
      ...data,
    };
    await writeSecureJSONFile(this._filePath, mergedData);
  }
}
