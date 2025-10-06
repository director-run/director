import {
  type OAuthClientInformationFull,
  type OAuthTokens,
} from "@modelcontextprotocol/sdk/shared/auth.js";

export abstract class AbstractOAuthStorage {
  abstract getClientInformation(
    providerId: string,
  ): Promise<OAuthClientInformationFull | undefined>;
  abstract saveClientInformation(
    providerId: string,
    clientInformation: OAuthClientInformationFull,
  ): Promise<void>;
  abstract getTokens(providerId: string): Promise<OAuthTokens | undefined>;
  abstract saveTokens(providerId: string, tokens: OAuthTokens): Promise<void>;
  abstract getCodeVerifier(providerId: string): Promise<string | undefined>;
  abstract deleteTokens(providerId: string): Promise<void>;
  abstract saveCodeVerifier(
    providerId: string,
    codeVerifier: string,
  ): Promise<void>;
}
