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

// Abstract storage interface
export abstract class AbstractOAuthStorage {
  abstract getClientInformation(): Promise<
    OAuthClientInformationFull | undefined
  >;
  abstract saveClientInformation(
    clientInformation: OAuthClientInformationFull,
  ): Promise<void>;
  abstract getTokens(): Promise<OAuthTokens | undefined>;
  abstract saveTokens(tokens: OAuthTokens): Promise<void>;
  abstract getCodeVerifier(): Promise<string | undefined>;
  abstract saveCodeVerifier(codeVerifier: string): Promise<void>;
}

// In-memory storage implementation
export class InMemoryOAuthStorage extends AbstractOAuthStorage {
  private _clientInformation?: OAuthClientInformationFull;
  private _tokens?: OAuthTokens;
  private _codeVerifier?: string;

  constructor() {
    super();
  }

  getClientInformation(): Promise<OAuthClientInformationFull | undefined> {
    return Promise.resolve(this._clientInformation);
  }

  saveClientInformation(
    clientInformation: OAuthClientInformationFull,
  ): Promise<void> {
    logger.info({ message: "saveClientInformation", clientInformation });
    this._clientInformation = clientInformation;
    return Promise.resolve();
  }

  getTokens(): Promise<OAuthTokens | undefined> {
    logger.info("getting tokens...");
    return Promise.resolve(this._tokens);
  }

  saveTokens(tokens: OAuthTokens): Promise<void> {
    logger.info("saving tokens");
    this._tokens = tokens;
    return Promise.resolve();
  }

  getCodeVerifier(): Promise<string | undefined> {
    return Promise.resolve(this._codeVerifier);
  }

  saveCodeVerifier(codeVerifier: string): Promise<void> {
    logger.info({ message: "saving code verifier", codeVerifier });
    this._codeVerifier = codeVerifier;
    return Promise.resolve();
  }
}

// On-disk storage implementation
export class OnDiskOAuthStorage extends AbstractOAuthStorage {
  private readonly _filePath: string;

  constructor(
    private readonly _providerId: string,
    private readonly _directory: string,
    private readonly _filePrefix: string = "oauth",
  ) {
    super();
    const directory = this._directory || path.join(process.cwd(), "oauth");
    const prefix = this._filePrefix || "oauth";
    const providerId = this._providerId || "default";
    this._filePath = path.join(directory, `${prefix}-${providerId}.json`);
  }

  async getClientInformation(): Promise<
    OAuthClientInformationFull | undefined
  > {
    try {
      const data = await this._loadData();
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
    await this._saveData({ clientInformation });
  }

  async getTokens(): Promise<OAuthTokens | undefined> {
    try {
      const data = await this._loadData();
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
    await this._saveData({ tokens });
  }

  async getCodeVerifier(): Promise<string | undefined> {
    try {
      const data = await this._loadData();
      if (data.codeVerifier) {
        logger.info({
          message: "loaded code verifier from disk",
          path: this._filePath,
        });
      }
      return data.codeVerifier;
    } catch (error) {
      // Only catch file not found errors, let permission errors propagate
      if (
        error instanceof Error &&
        "code" in error &&
        (error as { code: string }).code === ErrorCode.NOT_FOUND
      ) {
        return undefined;
      }
      throw error;
    }
  }

  async saveCodeVerifier(codeVerifier: string): Promise<void> {
    logger.info({
      message: "saving code verifier to disk",
      path: this._filePath,
    });
    await this._saveData({ codeVerifier });
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

// Single OAuth provider class
export class OAuthProvider implements OAuthClientProvider {
  private _clientInformation?: OAuthClientInformationFull;
  private _tokens?: OAuthTokens;
  private _codeVerifier?: string;

  constructor(
    private readonly _redirectUrl: string | URL,
    private readonly _clientMetadata: OAuthClientMetadata,
    private readonly _storage: AbstractOAuthStorage,
    private readonly _onRedirect?: (url: URL) => void,
  ) {}

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
}

export class OAuthHandler {
  private _callbackUrl: string;
  private _storage: AbstractOAuthStorage;

  constructor({
    storage,
    directory,
    filePrefix,
  }: {
    storage?: AbstractOAuthStorage;
    directory?: string;
    filePrefix?: string;
  }) {
    this._callbackUrl = CALLBACK_URL;
    if (storage) {
      this._storage = storage;
    } else if (directory) {
      this._storage = new OnDiskOAuthStorage("default", directory, filePrefix);
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
    const clientMetadata = {
      client_name: "Simple OAuth MCP Client",
      redirect_uris: [this._callbackUrl],
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_method: "client_secret_post",
      scope: "mcp:tools",
    };

    const oauthProvider = new OAuthProvider(
      this._callbackUrl,
      clientMetadata,
      this._storage,
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

// Factory functions for convenience
export function createInMemoryOAuthHandler(): OAuthHandler {
  return new OAuthHandler({
    storage: new InMemoryOAuthStorage(),
  });
}

export function createOnDiskOAuthHandler(
  directory: string,
  filePrefix?: string,
): OAuthHandler {
  return new OAuthHandler({
    storage: new OnDiskOAuthStorage("default", directory, filePrefix),
  });
}
