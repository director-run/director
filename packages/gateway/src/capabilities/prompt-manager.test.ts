import {
  expectGetPromptToReturn,
  expectListPromptsToReturn,
  expectMCPError,
} from "@director.run/mcp/test/helpers";
import { AppError, ErrorCode } from "@director.run/utilities/error";
import { ErrorCode as MCPErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { beforeEach, describe, expect, test } from "vitest";
import { PromptManager } from "./prompt-manager";

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
      const firstPrompt = {
        name: "test-prompt",
        title: "Test Prompt",
        description: "A test prompt",
        body: "This is a test prompt body",
      };

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

      const secondPrompt = {
        name: "test-prompt-2",
        title: "Test Prompt 2",
        description: "A test prompt 2",
        body: "This is a test prompt body 2",
      };

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
      const prompt = {
        name: "duplicate-prompt",
        title: "Duplicate Prompt",
        description: "A duplicate prompt",
        body: "This is a duplicate prompt body",
      };

      await promptManager.addPromptEntry(prompt);

      await expect(promptManager.addPromptEntry(prompt)).rejects.toThrow(
        new AppError(
          ErrorCode.DUPLICATE,
          "Prompt duplicate-prompt already exists",
        ),
      );
    });
  });

  describe("removePromptEntry", () => {
    test("should remove an existing prompt", async () => {
      const prompt = {
        name: "prompt-to-remove",
        title: "Prompt to Remove",
        description: "A prompt to remove",
        body: "This prompt will be removed",
      };

      await promptManager.addPromptEntry(prompt);
      await promptManager.removePromptEntry("prompt-to-remove");

      // Verify it's removed by trying to get it
      expect(() => promptManager.getPromptEntry("prompt-to-remove")).toThrow(
        new AppError(ErrorCode.NOT_FOUND, "Prompt prompt-to-remove not found"),
      );
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
      const prompt = {
        name: "test-prompt",
        title: "Test Prompt",
        description: "A test prompt",
        body: "This is a test prompt body",
      };

      await promptManager.addPromptEntry(prompt);
      const retrievedPrompt = promptManager.getPromptEntry("test-prompt");

      expect(retrievedPrompt).toEqual(prompt);
    });

    test("should throw error when getting non-existent prompt", () => {
      expect(() => promptManager.getPromptEntry("non-existent")).toThrow(
        new AppError(ErrorCode.NOT_FOUND, "Prompt non-existent not found"),
      );
    });
  });
});
