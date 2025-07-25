import path from "path";
import {
  green,
  red,
  whiteBold,
  yellow,
} from "@director.run/utilities/cli/colors";
import { ErrorCode, isAppErrorWithCode } from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import { openUrl } from "@director.run/utilities/os";
import express from "express";
import { HTTPClient } from "../src/client/http-client";
import { createOauthCallbackRouter } from "../src/oauth/oauth-callback-router";
import { OAuthHandler } from "../src/oauth/oauth-provider-factory";

const logger = getLogger("examples/oauth");

async function main(): Promise<void> {
  const port = 8090;
  const httpTarget = new HTTPClient({
    name: "oauth-test-client",
    url: "https://mcp.notion.com/mcp",
    oAuthHandler: OAuthHandler.createDiskBackedHandler({
      directory: path.join(__dirname, "tokens"),
      baseCallbackUrl: `http://localhost:${port}`,
    }),
  });

  const app = express();

  app.use(
    createOauthCallbackRouter({
      onAuthorizationSuccess: async (clientId, code) => {
        console.log("GOT THE TOKEN for", clientId);
        await httpTarget.completeAuthFlow(code);

        console.log("--------------------------------");
        console.log(">", httpTarget.status);
        runNotionMCPChecks(httpTarget);
        console.log("--------------------------------");
      },
      onAuthorizationError: (error) => {},
    }),
  );

  const server = app.listen(port, () => {
    console.log(
      `OAuth callback server (Express) started on http://localhost:${port}`,
    );
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
        const result = await httpTarget.startAuthFlow();

        console.log("--------------------------------");
        console.log("--------------------------------");
        if (result.result === "REDIRECT") {
          console.log(result.redirectUrl.toString());
          openUrl(result.redirectUrl.toString());
        } else {
          console.log("----");
        }

        // await httpTarget.performOAuthFlow((url: URL) => {
        //   openUrl(url.toString());
        // });
        // logger.info({
        //   message: "oauth flow completed, trying again to connect to target",
        // });
        // await httpTarget.connectToTarget({ throwOnError: true });
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

  if (httpTarget.status === "connected") {
    await runNotionMCPChecks(httpTarget);
  } else {
    console.log("xxxxxxxxxxxxxx NO HTTP CONNECTION xxxxxxxxxxxxxxxxx");
    console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");
    // process.exit(0);
  }

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
  process.exit(0);
}

main();
