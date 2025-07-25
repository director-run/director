import path from "node:path";
import {} from "@director.run/utilities/env";
import { ErrorCode } from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import {
  readSecureJSONFile,
  writeSecureJSONFile,
} from "@director.run/utilities/secure-json";
import {
  type OAuthClientInformationFull,
  type OAuthTokens,
} from "@modelcontextprotocol/sdk/shared/auth.js";
import { AbstractOAuthStorage } from "./abstract-oauth-storage";

const logger = getLogger("oauth/storage/disk");

export interface OnDiskOAuthStorageParams {
  providerId: string;
  directory: string;
  filePrefix?: string;
}

export class OnDiskOAuthStorage extends AbstractOAuthStorage {
  private readonly _filePath: string;

  constructor(params: OnDiskOAuthStorageParams) {
    super();
    const directory = params.directory || path.join(process.cwd(), "oauth");
    const prefix = params.filePrefix || "oauth";
    const providerId = params.providerId || "default";
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
