import { HTTPClient } from "@director.run/mcp/client/http-client";
import { expectListToolsToReturnToolNames } from "@director.run/mcp/test/helpers";
import { streamableRouter } from "@director.run/mcp/transport";
import express from "express";
import { describe, it } from "vitest";
import { SLACK_BOT_TOKEN, SLACK_CHANNEL_IDS, SLACK_TEAM_ID } from "./config";
import { npxToMCPServer } from "./npx-to-mcp-server";

const TEST_PORT = 5002;

describe("transport", () => {
  it("should create a server with a tool", async () => {
    const app = express();

    app.use(express.json());
    app.use(
      streamableRouter(() =>
        npxToMCPServer({
          packageName: "@modelcontextprotocol/server-slack",
          env: {
            SLACK_TEAM_ID: SLACK_TEAM_ID,
            SLACK_BOT_TOKEN: SLACK_BOT_TOKEN,
            SLACK_CHANNEL_IDS: SLACK_CHANNEL_IDS,
          },
        }),
      ),
    );

    const server = app.listen(TEST_PORT);

    console.log(`--> Creating client`);
    const client = await HTTPClient.createAndConnectToHTTP(
      `http://localhost:${TEST_PORT}/mcp`,
    );

    await expectListToolsToReturnToolNames(client, [
      "slack_add_reaction",
      "slack_get_channel_history",
      "slack_get_thread_replies",
      "slack_get_user_profile",
      "slack_get_users",
      "slack_list_channels",
      "slack_post_message",
      "slack_reply_to_thread",
    ]);

    await client.close();
    await server.close();
  });
});
