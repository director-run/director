import { exec } from "node:child_process";
import { createServer } from "node:http";
import { URL } from "node:url";
import { SimpleClient } from "./simple-client.js";

/**
 * Example of how to use OAuth with SimpleClient
 * This demonstrates the OAuth flow integration
 */
export async function connectWithOAuth(
  serverUrl: string,
): Promise<SimpleClient> {
  const CALLBACK_PORT = 8090;
  const CALLBACK_URL = `http://localhost:${CALLBACK_PORT}/callback`;

  // Create OAuth provider with browser redirect handling
  const oauthProvider = SimpleClient.createOAuthProvider(
    CALLBACK_URL,
    {
      client_name: "Director MCP Client",
      redirect_uris: [CALLBACK_URL],
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_method: "client_secret_post",
      scope: "mcp:tools",
    },
    (authUrl: URL) => {
      console.log(
        `Opening browser for OAuth authorization: ${authUrl.toString()}`,
      );
      openBrowser(authUrl.toString());
    },
  );

  const client = new SimpleClient("oauth-enabled-client");

  // Use the OAuth-aware connection method that handles the complete flow
  await client.connectToHTTPWithOAuth(
    serverUrl,
    oauthProvider,
    undefined,
    async () => {
      console.log("OAuth flow required - waiting for authorization...");
      return await waitForOAuthCallback(CALLBACK_PORT);
    },
  );

  console.log("Connected successfully with OAuth!");
  return client;
}

/**
 * Opens URL in default browser
 */
function openBrowser(url: string): void {
  const command =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
        ? "start"
        : "xdg-open";

  exec(`${command} "${url}"`, (error) => {
    if (error) {
      console.error(`Failed to open browser: ${error.message}`);
      console.log(`Please manually open: ${url}`);
    }
  });
}

/**
 * Starts temporary server to receive OAuth callback
 */
function waitForOAuthCallback(port: number): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const server = createServer((req, res) => {
      if (req.url === "/favicon.ico") {
        res.writeHead(404);
        res.end();
        return;
      }

      const parsedUrl = new URL(req.url || "", "http://localhost");
      const code = parsedUrl.searchParams.get("code");
      const error = parsedUrl.searchParams.get("error");

      if (code) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(`
          <html>
            <body>
              <h1>Authorization Successful!</h1>
              <p>You can close this window and return to the application.</p>
              <script>setTimeout(() => window.close(), 2000);</script>
            </body>
          </html>
        `);

        resolve(code);
        setTimeout(() => server.close(), 3000);
      } else if (error) {
        res.writeHead(400, { "Content-Type": "text/html" });
        res.end(`
          <html>
            <body>
              <h1>Authorization Failed</h1>
              <p>Error: ${error}</p>
            </body>
          </html>
        `);
        reject(new Error(`OAuth authorization failed: ${error}`));
      } else {
        res.writeHead(400);
        res.end("Bad request");
        reject(new Error("No authorization code provided"));
      }
    });

    server.listen(port, () => {
      console.log(`OAuth callback server started on http://localhost:${port}`);
    });
  });
}
