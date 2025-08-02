import { InMemoryClient } from "@director.run/mcp/client/in-memory-client";
import { AppError, ErrorCode } from "@director.run/utilities/error";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { GetPromptResult } from "@modelcontextprotocol/sdk/types.js";
import _ from "lodash";

export const PROMPT_MANAGER_TARGET_NAME = "__prompts__";

export class PromptManager extends InMemoryClient {
  private _prompts: Prompt[];

  constructor(prompts: Prompt[]) {
    super({
      name: PROMPT_MANAGER_TARGET_NAME,
      server: makePromptServer(_.cloneDeep(prompts)),
    });
    this._prompts = _.cloneDeep(prompts);
  }

  get prompts() {
    return this._prompts;
  }

  async addPromptEntry(prompt: Prompt) {
    const existingPrompt = this._prompts.find((p) => p.name === prompt.name);

    if (existingPrompt) {
      throw new AppError(
        ErrorCode.DUPLICATE,
        `Prompt ${prompt.name} already exists`,
      );
    }

    this._prompts.push(prompt);
    await this.reconnectToServer();
    return prompt;
  }

  async updatePrompt(
    promptId: string,
    prompt: Partial<Pick<Prompt, "title" | "description" | "body">>,
  ) {
    const index = this._prompts.findIndex((p) => p.name === promptId);
    if (index === -1) {
      throw new AppError(ErrorCode.NOT_FOUND, `Prompt ${promptId} not found`);
    }
    this._prompts[index] = { ...this._prompts[index], ...prompt };
    await this.reconnectToServer();
    return this._prompts[index];
  }

  async removePromptEntry(promptId: string) {
    const index = this._prompts.findIndex((p) => p.name === promptId);
    if (index === -1) {
      throw new AppError(ErrorCode.NOT_FOUND, `Prompt ${promptId} not found`);
    }
    this._prompts.splice(index, 1);
    await this.reconnectToServer();
  }

  getPromptEntry(promptId: string): Prompt {
    const prompt = this._prompts.find((p) => p.name === promptId);
    if (!prompt) {
      throw new AppError(ErrorCode.NOT_FOUND, `Prompt ${promptId} not found`);
    }
    return prompt;
  }

  private async reconnectToServer() {
    await this.close();
    await this.server.close();
    this.server = makePromptServer(this._prompts);
    await this.connectToTarget({ throwOnError: true });
  }
}

function makePromptServer(prompts: Prompt[]) {
  const server = new McpServer(
    {
      name: "prompt-manager",
      version: "1.0.0",
    },
    { capabilities: { logging: {} } },
  );

  for (const prompt of prompts) {
    server.registerPrompt(
      prompt.name,
      {
        title: prompt.title,
        description: prompt.description,
      },
      async (): Promise<GetPromptResult> => {
        return await {
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: prompt.body,
              },
            },
          ],
        };
      },
    );
  }

  return server.server;
}

export type Prompt = {
  name: string;
  title: string;
  description?: string;
  body: string;
};
