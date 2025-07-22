import { URL } from "node:url";
import {
  green,
  red,
  whiteBold,
  yellow,
} from "@director.run/utilities/cli/colors";
import { ErrorCode, isAppErrorWithCode } from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import { openUrl } from "@director.run/utilities/os";
import { HTTPClient } from "../src/client/http-client";
import { waitForOAuthCallback } from "../src/oauth/helpers";
import { createInMemoryOAuthProvider } from "../src/oauth/oauth-provider-factory";

const CALLBACK_PORT = 8090;
const CALLBACK_URL = `http://localhost:${CALLBACK_PORT}/callback`;

const logger = getLogger("examples/oauth");

async function main(): Promise<void> {
  const httpTarget = new HTTPClient({
    name: "oauth-test-client",
    url: "https://mcp.notion.com/mcp",
    oauthProvider: createInMemoryOAuthProvider(
      CALLBACK_URL,
      (redirectUrl: URL) => {
        logger.warn({
          message: "oauth redirect handler called",
          redirectUrl: redirectUrl.toString(),
        });
        openUrl(redirectUrl.toString());
      },
    ),
    onAuthorizationRequired: async () => {
      logger.warn({
        message: "oauth flow required, waiting for callback",
      });
      return await waitForOAuthCallback(CALLBACK_PORT);
    },
  });

  try {
    logger.info({
      message: "connecting to target",
    });
    await httpTarget.connectToTarget({
      throwOnError: true,
    });
  } catch (error) {
    if (isAppErrorWithCode(error, ErrorCode.UNAUTHORIZED)) {
      logger.info({
        message: "received unauthorized error, attempting oauth flow",
      });
      try {
        await httpTarget.performOAuthFlow();
        logger.info({
          message: "oauth flow completed, trying again to connect to target",
        });
        await httpTarget.connectToTarget({ throwOnError: true });
      } catch (error) {
        logger.error({
          message: "exhausted all attempts, connection failed",
          error,
        });
        throw error;
      }
    } else {
      logger.error({
        message: "massive failure, connection failed",
        error,
      });
      throw error;
    }
  }

  await runNotionMCPChecks(httpTarget);

  process.on("SIGINT", () => {
    console.log("\n\nTiding up...");
    httpTarget.close();
    process.exit(0);
  });
}

async function runNotionMCPChecks(client: HTTPClient) {
  console.log("");
  console.log(whiteBold("CLIENT CHECKS"));
  console.log("");
  console.log("");

  const prefix = yellow(">>>> ");
  console.log(
    prefix,
    "client.status =",
    client.status === "connected" ? green(client.status) : red(client.status),
  );

  const tools = await client.listTools();
  const countTools = tools.tools?.length || 0;
  console.log(
    prefix,
    "tool count =",
    countTools > 0 ? green(countTools.toString()) : red(countTools.toString()),
  );

  const result = (await client.callTool({
    name: "get-self",
    arguments: {},
  })) as { content: { text: string }[] };

  const self = result?.content[0]?.text || "{}";

  console.log(prefix, "get-self() =", self);
  console.log(green("ALL CHECKS PASSED!!!!"));
}

main();
