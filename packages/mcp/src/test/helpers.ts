
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  type CallToolResult,
  ErrorCode,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import {
  expect,
} from "vitest";

export async function expectListToolsToReturnToolNames(
    client: Client,
    expectedToolNames: string[],
  ) {
    const toolsResult = await client.listTools();
    const actualToolNames = toolsResult.tools.map((t) => t.name);
  
    expect(actualToolNames.sort()).toEqual(expectedToolNames.sort());
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
    await params.client.listTools()

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