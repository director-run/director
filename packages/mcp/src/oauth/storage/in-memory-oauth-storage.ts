import { getLogger } from "@director.run/utilities/logger";
import {
  type OAuthClientInformationFull,
  type OAuthTokens,
} from "@modelcontextprotocol/sdk/shared/auth.js";
import { AbstractOAuthStorage } from "./abstract-oauth-storage";

const logger = getLogger("oauth/storage/memory");

interface OAuthData {
  clientInformation?: OAuthClientInformationFull;
  tokens?: OAuthTokens;
  codeVerifier?: string;
}

export class InMemoryOAuthStorage extends AbstractOAuthStorage {
  private _data: Map<string, OAuthData> = new Map();

  constructor() {
    super();
  }

  getClientInformation(
    providerId: string,
  ): Promise<OAuthClientInformationFull | undefined> {
    const data = this._data.get(providerId);
    return Promise.resolve(data?.clientInformation);
  }

  saveClientInformation(
    providerId: string,
    clientInformation: OAuthClientInformationFull,
  ): Promise<void> {
    logger.info({
      message: "saveClientInformation",
      providerId,
      clientInformation,
    });
    const data = this._data.get(providerId) || {};
    data.clientInformation = clientInformation;
    this._data.set(providerId, data);
    return Promise.resolve();
  }

  getTokens(providerId: string): Promise<OAuthTokens | undefined> {
    logger.info({ message: "getting tokens...", providerId });
    const data = this._data.get(providerId);
    return Promise.resolve(data?.tokens);
  }

  saveTokens(providerId: string, tokens: OAuthTokens): Promise<void> {
    logger.info({ message: "saving tokens", providerId });
    const data = this._data.get(providerId) || {};
    data.tokens = tokens;
    this._data.set(providerId, data);
    return Promise.resolve();
  }

  deleteTokens(providerId: string): Promise<void> {
    logger.info({ message: "deleting tokens", providerId });
    this._data.delete(providerId);
    return Promise.resolve();
  }

  getCodeVerifier(providerId: string): Promise<string | undefined> {
    const data = this._data.get(providerId);
    return Promise.resolve(data?.codeVerifier);
  }

  saveCodeVerifier(providerId: string, codeVerifier: string): Promise<void> {
    logger.info({ message: "saving code verifier", providerId, codeVerifier });
    const data = this._data.get(providerId) || {};
    data.codeVerifier = codeVerifier;
    this._data.set(providerId, data);
    return Promise.resolve();
  }
}
