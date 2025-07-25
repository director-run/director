import {} from "@director.run/utilities/env";
import { getLogger } from "@director.run/utilities/logger";
import {} from "@director.run/utilities/secure-json";
import {
  type OAuthClientInformationFull,
  type OAuthTokens,
} from "@modelcontextprotocol/sdk/shared/auth.js";
import { AbstractOAuthStorage } from "./abstract-oauth-storage";

const logger = getLogger("oauth/storage/memory");

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
