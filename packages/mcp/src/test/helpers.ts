import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  type CallToolResult,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { expect } from "vitest";

export async function expectListToolsToReturnToolNames(
  client: Client,
  expectedToolNames: string[],
) {
  const toolsResult = await client.listTools();
  const actualToolNames = toolsResult.tools.map((t) => t.name);

  expect(actualToolNames.sort()).toEqual(expectedToolNames.sort());
}

export async function expectListPromptsToReturn(params: {
  client: Client;
  expectedPrompts: {
    name: string;
    title: string;
    description?: string;
  }[];
}) {
  const { client, expectedPrompts } = params;

  const result = await client.listPrompts();
  const promptNames = result.prompts.map((p) => ({
    name: p.name,
    title: p.title,
    description: p.description,
  }));

  expect(promptNames.sort()).toEqual(expectedPrompts.sort());
}

export async function expectGetPromptToReturn(params: {
  client: Client;
  promptName: string;
  expectedBody: string;
}) {
  const { client, promptName, expectedBody } = params;

  // TODO: this needs to be called first otherwise the prompt is not available as it's lazy caching
  await client.listPrompts();
  const result = await client.getPrompt({
    name: promptName,
  });
  expect(result.messages[0].content.text).toEqual(expectedBody);
}

export async function expectToolCallToHaveResult(params: {
  client: Client;
  toolName: string;
  arguments: Record<string, unknown>;
  expectedResult: unknown;
}) {
  // TODO: this needs to be called first otherwise the tool is not available as it's lazy caching
  await params.client.listTools();

  const result = (await params.client.callTool({
    name: params.toolName,
    arguments: params.arguments,
  })) as CallToolResult;

  expect(JSON.parse(result.content?.[0].text as string)).toEqual(
    params.expectedResult,
  );
}

export async function expectUnknownToolError(params: {
  client: Client;
  toolName: string;
  arguments: Record<string, unknown>;
}) {
  // TODO: this needs to be called first otherwise the tool is not available as it's lazy caching
  await params.client.listTools();

  const error = await params.client
    .callTool({
      name: params.toolName,
      arguments: params.arguments,
    })
    .catch((e) => e);

  expect(error).toBeInstanceOf(McpError);
  expect((error as McpError).code).toEqual(ErrorCode.InternalError);
  expect((error as McpError).message).toContain("Unknown tool");
}

export async function expectMCPError(
  fn: () => Promise<unknown>,
  expectedErrorCode: ErrorCode,
  expectedMessage?: string,
) {
  const error = await fn().catch((e) => e);

  expect(error).toBeInstanceOf(McpError);
  expect((error as McpError).code).toEqual(expectedErrorCode);
  if (expectedMessage) {
    expect((error as McpError).message).toContain(expectedMessage);
  }
}
