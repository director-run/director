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

export function getDeeeets(onRedirect?: (url: URL) => void) {
  return {
    oauthProvider: createInMemoryOAuthProvider(CALLBACK_URL, onRedirect),
    onAuthorizationRequired: async (url: URL) => {
      console.log("xxxxx onAuthorizationRequired");
      logger.warn({
        message: "oauth flow required, waiting for callback",
      });
      return await waitForOAuthCallback(CALLBACK_PORT);
    },
  };
}

export class OAuthHandler {
  private _id: string;
  private _callbackUrl: string;

  constructor({ id }: { id: string }) {
    this._id = id;
    this._callbackUrl = CALLBACK_URL;
  }

  getProvider(
    params: {
      onRedirect?: (url: URL) => void;
    } = {},
  ) {
    return {
      oauthProvider: createInMemoryOAuthProvider(
        CALLBACK_URL,
        params.onRedirect,
      ),
      onAuthorizationRequired: async (url: URL) => {
        console.log("xxxxx onAuthorizationRequired");
        logger.warn({
          message: "oauth flow required, waiting for callback",
        });
        return await waitForOAuthCallback(CALLBACK_PORT);
      },
    };
  }

  // onAuthorizationRequired() {
  //   logger.warn({
  //     message: "oauth flow required, waiting for callback",
  //   });
  //   return waitForOAuthCallback(CALLBACK_PORT);
  // }
}

export function getOAuthHandler(params: { id: string }) {
  return new OAuthHandler(params);
}

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
