import { exec } from "node:child_process";
import { createServer } from "node:http";
import { URL } from "node:url";

const CALLBACK_PORT = 8090;
const CALLBACK_URL = `http://localhost:${CALLBACK_PORT}/callback`;

/**
 * Opens the authorization URL in the user's default browser
 */
export async function openBrowser(url: string): Promise<void> {
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
export function waitForOAuthCallback(port: number): Promise<string> {
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
      console.log(`OAuth callback server started on http://localhost:${port}`);
    });
  });
}
