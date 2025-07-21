import { URL } from "node:url";
import { HTTPClient } from "../src/client/http-client";
import { openBrowser, waitForOAuthCallback } from "../src/oauth/helpers";
import { createInMemoryOAuthProvider } from "../src/oauth/oauth-provider-factory";

const CALLBACK_PORT = 8090;
const CALLBACK_URL = `http://localhost:${CALLBACK_PORT}/callback`;

/**
 * Main OAuth test function
 */
async function main(): Promise<void> {
  const proxyTarget = new HTTPClient({
    name: "oauth-test-client",
    url: "https://mcp.notion.com/mcp",
    oauthProvider: createInMemoryOAuthProvider(
      CALLBACK_URL,
      (redirectUrl: URL) => {
        console.log(`📌 OAuth redirect handler called - opening browser`);
        console.log(`Opening browser to: ${redirectUrl.toString()}`);
        openBrowser(redirectUrl.toString());
      },
    ),
    onAuthorizationRequired: async () => {
      console.log("OAuth flow required - waiting for authorization...");
      return await waitForOAuthCallback(CALLBACK_PORT);
    },
  });

  try {
    await proxyTarget.connectToTarget({
      throwOnError: true,
    });

    console.log("proxyTarget.status", proxyTarget.status);

    if (proxyTarget.status !== "connected") {
      console.log("There was a connection issue...", proxyTarget.status);
      process.exit(1);
    }

    // console.log("✅ Connected successfully with OAuth!");

    // Test the connection by listing tools
    const tools = await proxyTarget.listTools();
    console.log("Available tools:", tools.tools?.length || 0);

    if (tools.tools && tools.tools.length > 0) {
      console.log("Tool names:", tools.tools.map((t) => t.name).join(", "));
    }

    const result = await proxyTarget.callTool({
      name: "get-self",
      arguments: {
        // query: "Hello",
      },
    });

    console.log(result);
  } catch (error) {
    console.error("❌ Connection failed:", error);
    process.exit(1);
  }

  process.on("SIGINT", () => {
    console.log("\n\n👋 Goodbye!");
    proxyTarget.close();
    process.exit(0);
  });
}

main();
