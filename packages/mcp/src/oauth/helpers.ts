import express from "express";
import { createOauthCallbackRouter } from "./oauth-callback-router";

export function waitForOAuthCallback(port: number): Promise<string> {
  const app = express();

  return new Promise<string>((resolve, reject) => {
    app.use(
      createOauthCallbackRouter({
        onAuthorizationSuccess: (code) => {
          resolve(code);
          setTimeout(() => server.close(), 3000);
        },
        onAuthorizationError: (error) => {
          reject(error);
          setTimeout(() => server.close(), 3000);
        },
      }),
    );

    const server = app.listen(port, () => {
      console.log(
        `OAuth callback server (Express) started on http://localhost:${port}`,
      );
    });
  });
}
