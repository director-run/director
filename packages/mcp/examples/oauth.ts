import {
  green,
  red,
  whiteBold,
  yellow,
} from "@director.run/utilities/cli/colors";
import { ErrorCode, isAppErrorWithCode } from "@director.run/utilities/error";
import { getLogger } from "@director.run/utilities/logger";
import { openUrl } from "@director.run/utilities/os";
import { sleep } from "@director.run/utilities/sleep";
import express from "express";
import { HTTPClient } from "../src/client/http-client";
import { createOauthCallbackRouter } from "../src/oauth/oauth-callback-router";
import { OAuthProviderFactory } from "../src/oauth/oauth-provider-factory";

const logger = getLogger("examples/oauth");

async function main(url: string = "https://mcp.notion.com/mcp"): Promise<void> {
  const port = 8090;
  const httpTarget = new HTTPClient(
    {
      name: "oauth-test-client",
      url,
    },
    {
      oAuthHandler: new OAuthProviderFactory({
        storage: "memory",
        baseCallbackUrl: `http://localhost:${port}`,
      }),
    },
  );

  const app = express();

  app.use(
    createOauthCallbackRouter({
      // For local CLI usage, use a mock session since there's no user auth
      getSession: async () => ({ userId: "local-example-user" }),
      onAuthorizationSuccess: async (factoryId, providerId, code) => {
        logger.info({
          message: "received authorization success",
          factoryId,
          providerId,
          code,
        });
        await httpTarget.completeAuthFlow(code);
        await runNotionMCPChecks(httpTarget);
      },
      onAuthorizationError: (factoryId, providerId, error) => {
        logger.error({
          message: "received authorization error",
          factoryId,
          providerId,
          error,
        });
      },
    }),
  );

  const _server = app.listen(port, () => {
    logger.info(
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

        if (result.result === "REDIRECT") {
          logger.info({
            message: "redirecting to oauth flow",
            redirectUrl: result.redirectUrl,
          });
          openUrl(result.redirectUrl);
        } else {
          logger.info({
            message: "oauth flow completed, trying again to connect to target",
          });
        }
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
    logger.info("waiting for oauth token...");
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

  console.log(green("ALL CHECKS PASSED!!!!"));
  await sleep(1000);
  process.exit(0);
}

const url = process.argv[2] || "https://mcp.notion.com/mcp";
main(url);
