import { execSync } from "node:child_process";
import type { Server } from "node:http";
import { afterAll, beforeAll, describe, test } from "vitest";
import { CONFIG_FILE_PATH } from "../../config/env.js";
import { readConfig } from "../../config/readConfig.js";
import { startSSEServer } from "../startSSEServer.js";
import { createProxyTargetServer } from "./createProxyTargetServer.js";
const testConfig = await readConfig(CONFIG_FILE_PATH);

describe("startSSEServer", () => {
  let serverInstance: Server;
  let proxyTargetServerInstance: Server;

  beforeAll(async () => {
    proxyTargetServerInstance = await createProxyTargetServer();
    serverInstance = await startSSEServer({
      name: "test-proxy",
      config: testConfig,
    });

    const stdout = execSync("curl -I http://localhost:4521/sse");
    console.log(stdout.toString());
    true;
  });

  afterAll(async () => {
    await serverInstance?.close();
    await proxyTargetServerInstance?.close();
  });

  test("should connect and list tools", async () => {
    // const client = new Client(
    //   {
    //     name: "test-client",
    //     version: "0.0.0",
    //   },
    //   {
    //     capabilities: {
    //       prompts: {},
    //       resources: {},
    //       tools: {},
    //     },
    //   },
    // );
    // const transport = new SSEClientTransport(
    //   new URL(`http://localhost:${testConfig.ssePort}/sse`),
    // );
    // console.log("iiii Transport created");
    // await client.connect(transport);
    // console.log("iiii Client connected");
    // // try {
    // const toolsResult = await client.listTools();
    // console.log("iiii Tools listed");
    // const expectedToolNames = [
    //   "get_stories",
    //   "get_user_info",
    //   "search_stories",
    //   "get_story_info",
    //   "fetch",
    //   "echo",
    // ];
    // for (const toolName of expectedToolNames) {
    //   const tool = toolsResult.tools.find((t) => t.name === toolName);
    //   expect(tool).toBeDefined();
    //   expect(tool?.name).toBe(toolName);
    // }
    // expect(
    //   toolsResult.tools.find((t) => t.name === "get_stories")?.description,
    // ).toContain("[Hackernews]");
    // expect(
    //   toolsResult.tools.find((t) => t.name === "get_user_info")?.description,
    // ).toContain("[Hackernews]");
    // expect(
    //   toolsResult.tools.find((t) => t.name === "search_stories")?.description,
    // ).toContain("[Hackernews]");
    // expect(
    //   toolsResult.tools.find((t) => t.name === "get_story_info")?.description,
    // ).toContain("[Hackernews]");
    // // Verify Fetch tool has correct description
    // expect(
    //   toolsResult.tools.find((t) => t.name === "fetch")?.description,
    // ).toContain("[Fetch]");
    // await client.close();
  });
});
