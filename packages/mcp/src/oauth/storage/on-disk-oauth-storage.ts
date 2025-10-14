import fs from "node:fs/promises";
import path from "node:path";
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
  directory: string;
  filePrefix?: string;
}

interface OAuthData {
  clientInformation?: OAuthClientInformationFull;
  tokens?: OAuthTokens;
  codeVerifier?: string;
}

export class OnDiskOAuthStorage extends AbstractOAuthStorage {
  private readonly _directory: string;
  private readonly _filePrefix: string;

  constructor(params: OnDiskOAuthStorageParams) {
    super();
    this._directory = params.directory || path.join(process.cwd(), "oauth");
    this._filePrefix = params.filePrefix || "oauth";
  }

  private _getFilePath(providerId: string): string {
    return path.join(this._directory, `${this._filePrefix}-${providerId}.json`);
  }

  async getClientInformation(
    providerId: string,
  ): Promise<OAuthClientInformationFull | undefined> {
    const filePath = this._getFilePath(providerId);
    try {
      const data = await this._loadData(filePath);
      if (data.clientInformation) {
        logger.info({
          message: "loaded client information from disk",
          providerId,
          path: filePath,
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
          providerId,
          path: filePath,
        });
        return undefined;
      }
      throw error;
    }
  }

  async saveClientInformation(
    providerId: string,
    clientInformation: OAuthClientInformationFull,
  ): Promise<void> {
    const filePath = this._getFilePath(providerId);
    logger.info({
      message: "saving client information to disk",
      providerId,
      path: filePath,
    });
    await this._saveData(filePath, { clientInformation });
  }

  async getTokens(providerId: string): Promise<OAuthTokens | undefined> {
    const filePath = this._getFilePath(providerId);
    try {
      const data = await this._loadData(filePath);
      if (data.tokens) {
        logger.info({
          message: "loaded tokens from disk",
          providerId,
          path: filePath,
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
          providerId,
          path: filePath,
        });
        return undefined;
      }
      throw error;
    }
  }

  async saveTokens(providerId: string, tokens: OAuthTokens): Promise<void> {
    const filePath = this._getFilePath(providerId);
    logger.info({
      message: "saving tokens to disk",
      providerId,
      path: filePath,
    });
    await this._saveData(filePath, { tokens });
  }

  async deleteTokens(providerId: string): Promise<void> {
    const filePath = this._getFilePath(providerId);
    logger.info({
      message: "deleting tokens from disk",
      providerId,
      path: filePath,
    });
    await fs.unlink(filePath);
  }

  async getCodeVerifier(providerId: string): Promise<string | undefined> {
    const filePath = this._getFilePath(providerId);
    try {
      const data = await this._loadData(filePath);
      if (data.codeVerifier) {
        logger.info({
          message: "loaded code verifier from disk",
          providerId,
          path: filePath,
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

  async saveCodeVerifier(
    providerId: string,
    codeVerifier: string,
  ): Promise<void> {
    const filePath = this._getFilePath(providerId);
    logger.info({
      message: "saving code verifier to disk",
      providerId,
      path: filePath,
    });
    await this._saveData(filePath, { codeVerifier });
  }

  private async _loadData(filePath: string): Promise<OAuthData> {
    try {
      return await readSecureJSONFile(filePath);
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

  private async _saveData(
    filePath: string,
    data: Partial<OAuthData>,
  ): Promise<void> {
    const existingData = await this._loadData(filePath);
    const mergedData = {
      ...existingData,
      ...data,
    };
    await writeSecureJSONFile(filePath, mergedData);
  }
}
