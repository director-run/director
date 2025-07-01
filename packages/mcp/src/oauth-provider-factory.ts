import { type OAuthClientProvider } from "@modelcontextprotocol/sdk/client/auth.js";
import {
  type OAuthClientInformation,
  type OAuthClientInformationFull,
  type OAuthClientMetadata,
  type OAuthTokens,
} from "@modelcontextprotocol/sdk/shared/auth.js";

/**
 * Creates a basic in-memory OAuth provider for testing and simple use cases.
 * For production use, use createPersistentOAuthProvider.
 */
export function createInMemoryOAuthProvider(
  callbackUrl: string,
  onRedirect?: (url: URL) => void,
): OAuthClientProvider {
  return new InMemoryOAuthProvider(
    callbackUrl,
    {
      client_name: "Simple OAuth MCP Client",
      redirect_uris: [callbackUrl],
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_method: "client_secret_post",
      scope: "mcp:tools",
    },
    onRedirect,
  );
}

/**
 * Simple in-memory OAuth client provider for basic OAuth flows.
 * Based on the oauth.ts example but simplified for library use.
 */
class InMemoryOAuthProvider implements OAuthClientProvider {
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
    console.log("saveClientInformation", clientInformation);
    this._clientInformation = clientInformation;
  }

  tokens(): OAuthTokens | undefined {
    console.log("getting tokens...");
    return this._tokens;
  }

  saveTokens(tokens: OAuthTokens): void {
    console.log("Saving tokens", tokens);
    this._tokens = tokens;
  }

  redirectToAuthorization(authorizationUrl: URL): void {
    if (this._onRedirect) {
      this._onRedirect(authorizationUrl);
    } else {
      console.log(`OAuth redirect required: ${authorizationUrl.toString()}`);
    }
  }

  saveCodeVerifier(codeVerifier: string): void {
    console.log("saving code verifier", codeVerifier);
    this._codeVerifier = codeVerifier;
  }

  codeVerifier(): string {
    if (!this._codeVerifier) {
      throw new Error("No code verifier saved");
    }
    return this._codeVerifier;
  }
}
