import { InMemoryClient } from "@director.run/mcp/client/in-memory-client";
import { AppError, ErrorCode } from "@director.run/utilities/error";
import { requiredStringSchema } from "@director.run/utilities/schema";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { GetPromptResult } from "@modelcontextprotocol/sdk/types.js";
import _ from "lodash";
import { z } from "zod";

export const PROMPT_MANAGER_TARGET_NAME = "__prompts__";

export const PromptSchema = z.object({
  name: requiredStringSchema,
  title: requiredStringSchema,
  description: z.string().trim().optional(),
  body: requiredStringSchema,
});

export type Prompt = z.infer<typeof PromptSchema>;

export const PromptManagerSchema = z.object({
  prompts: z.array(PromptSchema).optional(),
});

export type PromptManagerParams = z.infer<typeof PromptManagerSchema>;

export class PromptManager extends InMemoryClient {
  private _promptList: Prompt[];

  constructor(prompts: Prompt[] = []) {
    super(
      {
        name: PROMPT_MANAGER_TARGET_NAME,
      },
      {
        server: makePromptServer(_.cloneDeep(prompts)),
      },
    );
    this._promptList = _.cloneDeep(prompts);
  }

  get promptList() {
    return this._promptList;
  }

  async addPromptEntry(prompt: Prompt) {
    const existingPrompt = this._promptList.find((p) => p.name === prompt.name);

    if (existingPrompt) {
      throw new AppError(
        ErrorCode.DUPLICATE,
        `Prompt ${prompt.name} already exists`,
      );
    }

    this._promptList.push(prompt);
    await this.reconnectToServer();
    return prompt;
  }

  async updatePrompt(
    promptId: string,
    prompt: Partial<Pick<Prompt, "title" | "description" | "body">>,
  ) {
    const index = this._promptList.findIndex((p) => p.name === promptId);
    if (index === -1) {
      throw new AppError(ErrorCode.NOT_FOUND, `Prompt ${promptId} not found`);
    }
    this._promptList[index] = { ...this._promptList[index], ...prompt };
    await this.reconnectToServer();
    return this._promptList[index];
  }

  async removePromptEntry(promptId: string) {
    const index = this._promptList.findIndex((p) => p.name === promptId);
    if (index === -1) {
      throw new AppError(ErrorCode.NOT_FOUND, `Prompt ${promptId} not found`);
    }
    this._promptList.splice(index, 1);
    await this.reconnectToServer();
  }

  getPromptEntry(promptId: string): Prompt {
    const prompt = this._promptList.find((p) => p.name === promptId);
    if (!prompt) {
      throw new AppError(ErrorCode.NOT_FOUND, `Prompt ${promptId} not found`);
    }
    return prompt;
  }

  private async reconnectToServer() {
    await this.close();
    await this.server.close();
    this.server = makePromptServer(this._promptList);
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
