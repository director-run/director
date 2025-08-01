import {
  expectGetPromptToReturn,
  expectListPromptsToReturn,
  expectMCPError,
} from "@director.run/mcp/test/helpers";
import { AppError, ErrorCode } from "@director.run/utilities/error";
import { faker } from "@faker-js/faker";
import { ErrorCode as MCPErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { beforeEach, describe, expect, test } from "vitest";
import { type Prompt, PromptManager } from "./prompt-manager";

function makePrompt(params: Partial<Prompt> = {}) {
  return {
    name: [faker.company.buzzNoun(), faker.company.buzzVerb()]
      .map((w) => w.toLowerCase())
      .join("-"),
    title: faker.lorem.sentence(),
    description: faker.lorem.sentence(),
    body: faker.lorem.paragraph(),
    ...params,
  };
}

describe("PromptManager", () => {
  let promptManager: PromptManager;

  beforeEach(() => {
    promptManager = new PromptManager([]);
  });

  describe("listPrompts", () => {
    test("should throw an error when there are no prompts", async () => {
      await promptManager.connectToTarget({ throwOnError: true });
      await expectMCPError(
        () => promptManager.listPrompts(),
        MCPErrorCode.MethodNotFound,
      );
    });
  });

  describe("addPromptEntry", () => {
    test("should add a new prompt successfully", async () => {
      const firstPrompt = makePrompt();

      const firstAddedPrompt = await promptManager.addPromptEntry(firstPrompt);
      expect(firstAddedPrompt).toEqual(firstPrompt);

      await expectListPromptsToReturn({
        client: promptManager,
        expectedPrompts: [
          {
            name: firstPrompt.name,
            title: firstPrompt.title,
            description: firstPrompt.description,
          },
        ],
      });

      await expectGetPromptToReturn({
        client: promptManager,
        promptName: firstPrompt.name,
        expectedBody: firstPrompt.body,
      });

      const secondPrompt = makePrompt();

      const secondAddedPrompt =
        await promptManager.addPromptEntry(secondPrompt);
      expect(secondAddedPrompt).toEqual(secondPrompt);

      await expectListPromptsToReturn({
        client: promptManager,
        expectedPrompts: [
          {
            name: firstPrompt.name,
            title: firstPrompt.title,
            description: firstPrompt.description,
          },
          {
            name: secondPrompt.name,
            title: secondPrompt.title,
            description: secondPrompt.description,
          },
        ],
      });

      await expectGetPromptToReturn({
        client: promptManager,
        promptName: secondPrompt.name,
        expectedBody: secondPrompt.body,
      });
    });

    test("should throw error when adding duplicate prompt", async () => {
      const prompt = makePrompt();

      await promptManager.addPromptEntry(prompt);

      await expect(promptManager.addPromptEntry(prompt)).rejects.toThrow(
        new AppError(
          ErrorCode.DUPLICATE,
          `Prompt ${prompt.name} already exists`,
        ),
      );
    });
  });

  describe("removePromptEntry", () => {
    test("should remove an existing prompt", async () => {
      const firstPrompt = makePrompt();
      const secondPrompt = makePrompt();

      await promptManager.addPromptEntry(firstPrompt);
      await promptManager.addPromptEntry(secondPrompt);
      await promptManager.removePromptEntry(firstPrompt.name);

      expect(() => promptManager.getPromptEntry(firstPrompt.name)).toThrow(
        new AppError(
          ErrorCode.NOT_FOUND,
          `Prompt ${firstPrompt.name} not found`,
        ),
      );

      await expectListPromptsToReturn({
        client: promptManager,
        expectedPrompts: [
          {
            name: secondPrompt.name,
            title: secondPrompt.title,
            description: secondPrompt.description,
          },
        ],
      });
    });

    test("should throw error when removing non-existent prompt", async () => {
      await expect(
        promptManager.removePromptEntry("non-existent"),
      ).rejects.toThrow(
        new AppError(ErrorCode.NOT_FOUND, "Prompt non-existent not found"),
      );
    });
  });

  describe("getPromptEntry", () => {
    test("should retrieve an existing prompt", async () => {
      const prompt = makePrompt();

      await promptManager.addPromptEntry(prompt);
      const retrievedPrompt = promptManager.getPromptEntry(prompt.name);

      expect(retrievedPrompt).toEqual(prompt);
    });

    test("should throw error when getting non-existent prompt", () => {
      expect(() => promptManager.getPromptEntry("non-existent")).toThrow(
        new AppError(ErrorCode.NOT_FOUND, "Prompt non-existent not found"),
      );
    });
  });
});
