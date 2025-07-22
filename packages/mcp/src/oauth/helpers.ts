import { exec } from "node:child_process";
import { URL } from "node:url";
import express, { type Request, type Response } from "express";

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
  const app = express();

  return new Promise<string>((resolve, reject) => {
    app.get("/callback", (req: Request, res: Response) => {
      console.log(`📥 Received callback: ${req.originalUrl}`);
      const parsedUrl = new URL(req.originalUrl || "", "http://localhost");
      const code = parsedUrl.searchParams.get("code");
      const error = parsedUrl.searchParams.get("error");

      if (code) {
        console.log(
          `✅ Authorization code received: ${code?.substring(0, 10)}...`,
        );
        res
          .status(200)
          .contentType("text/html")
          .send(`
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
        res
          .status(400)
          .contentType("text/html")
          .send(`
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
        res.status(400).send("Bad request");
        reject(new Error("No authorization code provided"));
      }
    });

    const server = app.listen(port, () => {
      console.log(
        `OAuth callback server (Express) started on http://localhost:${port}`,
      );
    });
  });
}
