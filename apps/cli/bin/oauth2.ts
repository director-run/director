import { exec } from "node:child_process";
import { createServer } from "node:http";
import { URL } from "node:url";
import { SimpleClient } from "@director.run/mcp/simple-client";

// Configuration
const DEFAULT_SERVER_URL = "https://mcp.notion.com/mcp";
const CALLBACK_PORT = 8090;
const CALLBACK_URL = `http://localhost:${CALLBACK_PORT}/callback`;

/**
 * Opens the authorization URL in the user's default browser
 */
async function openBrowser(url: string): Promise<void> {
  console.log(`🌐 Opening browser for authorization: ${url}`);

  const command = `open "${url}"`;

  exec(command, (error) => {
    if (error) {
      console.error(`Failed to open browser: ${error.message}`);
      console.log(`Please manually open: ${url}`);
    }
  });
}

/**
 * Starts a temporary HTTP server to receive the OAuth callback
 */
function waitForOAuthCallback(port: number): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const server = createServer((req, res) => {
      // Ignore favicon requests
      if (req.url === "/favicon.ico") {
        res.writeHead(404);
        res.end();
        return;
      }

      console.log(`📥 Received callback: ${req.url}`);
      const parsedUrl = new URL(req.url || "", "http://localhost");
      const code = parsedUrl.searchParams.get("code");
      const error = parsedUrl.searchParams.get("error");

      if (code) {
        console.log(
          `✅ Authorization code received: ${code?.substring(0, 10)}...`,
        );
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(`
          <html>
            <body>
              <h1>Authorization Successful!</h1>
              <p>You can close this window and return to the terminal.</p>
              <script>setTimeout(() => window.close(), 2000);</script>
            </body>
          </html>
        `);

        resolve(code);
        setTimeout(() => server.close(), 3000);
      } else if (error) {
        console.log(`❌ Authorization error: ${error}`);
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
        console.log(`❌ No authorization code or error in callback`);
        res.writeHead(400);
        res.end("Bad request");
        reject(new Error("No authorization code provided"));
      }
    });

    server.listen(port, () => {
      console.log(
        `OAuth callback server started on http://localhost:${port}`,
      );
    });
  });
}

/**
 * Main OAuth test function
 */
async function main(): Promise<void> {
  const serverUrl = process.env.MCP_SERVER_URL || DEFAULT_SERVER_URL;

  console.log("🚀 Simple MCP OAuth Client");
  console.log(`Connecting to: ${serverUrl}`);
  console.log();

  // Create OAuth provider
  const oauthProvider = SimpleClient.createOAuthProvider(
    CALLBACK_URL,
    {
      client_name: "Simple OAuth MCP Client",
      redirect_uris: [CALLBACK_URL],
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_method: "client_secret_post",
      scope: "mcp:tools",
    },
    (redirectUrl: URL) => {
      console.log(`📌 OAuth redirect handler called - opening browser`);
      console.log(`Opening browser to: ${redirectUrl.toString()}`);
      openBrowser(redirectUrl.toString());
    },
  );

  const client = new SimpleClient("oauth-test-client");

  try {
    // Use the unified connectToHTTP method with OAuth support
    await client.connectToHTTP(
      serverUrl,
      undefined,
      oauthProvider,
      async () => {
        console.log("OAuth flow required - waiting for authorization...");
        return await waitForOAuthCallback(CALLBACK_PORT);
      },
    );

    console.log("✅ Connected successfully with OAuth!");

    // Test the connection by listing tools
    const tools = await client.listTools();
    console.log("Available tools:", tools.tools?.length || 0);
    
    if (tools.tools && tools.tools.length > 0) {
      console.log("Tool names:", tools.tools.map(t => t.name).join(", "));
    }

  } catch (error) {
    console.error("❌ Connection failed:", error);
    process.exit(1);
  }

  process.on("SIGINT", () => {
    console.log("\n\n👋 Goodbye!");
    client.close();
    process.exit(0);
  });
}

main();
