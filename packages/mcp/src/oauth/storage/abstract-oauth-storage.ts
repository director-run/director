import {
  type OAuthClientInformationFull,
  type OAuthTokens,
} from "@modelcontextprotocol/sdk/shared/auth.js";

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
