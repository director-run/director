import {
  expectGetPromptToReturn,
  expectListPromptsToReturn,
  expectMCPError,
} from "@director.run/mcp/test/helpers";
import { AppError, ErrorCode } from "@director.run/utilities/error";
import { ErrorCode as MCPErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { beforeEach, describe, expect, test } from "vitest";
import { makePrompt } from "../test/fixtures";
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

  describe("updatePrompt", () => {
    test("should update an existing prompt with partial data", async () => {
      const originalPrompt = makePrompt();
      await promptManager.addPromptEntry(originalPrompt);

      const updateData = {
        title: "Updated Title",
        description: "Updated Description",
      };

      const updatedPrompt = await promptManager.updatePrompt(
        originalPrompt.name,
        updateData,
      );

      expect(updatedPrompt).toEqual({
        ...originalPrompt,
        ...updateData,
      });

      // Verify the prompt is actually updated in the manager
      const retrievedPrompt = promptManager.getPromptEntry(originalPrompt.name);
      expect(retrievedPrompt).toEqual({
        ...originalPrompt,
        ...updateData,
      });

      // Verify the prompt is updated in the MCP server
      await expectGetPromptToReturn({
        client: promptManager,
        promptName: originalPrompt.name,
        expectedBody: originalPrompt.body, // body should remain unchanged
      });
    });

    test("should update only the body of an existing prompt", async () => {
      const originalPrompt = makePrompt();
      await promptManager.addPromptEntry(originalPrompt);

      const newBody = "This is a completely new body content";
      const updateData = { body: newBody };

      const updatedPrompt = await promptManager.updatePrompt(
        originalPrompt.name,
        updateData,
      );

      expect(updatedPrompt).toEqual({
        ...originalPrompt,
        ...updateData,
      });

      // Verify the prompt is updated in the MCP server
      await expectGetPromptToReturn({
        client: promptManager,
        promptName: originalPrompt.name,
        expectedBody: newBody,
      });
    });

    test("should update multiple fields of an existing prompt", async () => {
      const originalPrompt = makePrompt();
      await promptManager.addPromptEntry(originalPrompt);

      const updateData = {
        title: "New Title",
        description: "New Description",
        body: "New body content",
      };

      const updatedPrompt = await promptManager.updatePrompt(
        originalPrompt.name,
        updateData,
      );

      expect(updatedPrompt).toEqual({
        ...originalPrompt,
        ...updateData,
      });

      // Verify the prompt is updated in the MCP server
      await expectGetPromptToReturn({
        client: promptManager,
        promptName: originalPrompt.name,
        expectedBody: updateData.body,
      });
    });

    test("should throw error when updating non-existent prompt", async () => {
      const updateData = {
        title: "Updated Title",
        description: "Updated Description",
      };

      await expect(
        promptManager.updatePrompt("non-existent", updateData),
      ).rejects.toThrow(
        new AppError(ErrorCode.NOT_FOUND, "Prompt non-existent not found"),
      );
    });

    test("should handle empty update object", async () => {
      const originalPrompt = makePrompt();
      await promptManager.addPromptEntry(originalPrompt);

      const updatedPrompt = await promptManager.updatePrompt(
        originalPrompt.name,
        {},
      );

      expect(updatedPrompt).toEqual(originalPrompt);

      // Verify the prompt remains unchanged in the MCP server
      await expectGetPromptToReturn({
        client: promptManager,
        promptName: originalPrompt.name,
        expectedBody: originalPrompt.body,
      });
    });

    test("should preserve other prompts when updating one prompt", async () => {
      const firstPrompt = makePrompt();
      const secondPrompt = makePrompt();

      await promptManager.addPromptEntry(firstPrompt);
      await promptManager.addPromptEntry(secondPrompt);

      const updateData = { title: "Updated First Prompt" };
      await promptManager.updatePrompt(firstPrompt.name, updateData);

      // Verify first prompt is updated
      const updatedFirstPrompt = promptManager.getPromptEntry(firstPrompt.name);
      expect(updatedFirstPrompt).toEqual({
        ...firstPrompt,
        ...updateData,
      });

      // Verify second prompt remains unchanged
      const unchangedSecondPrompt = promptManager.getPromptEntry(
        secondPrompt.name,
      );
      expect(unchangedSecondPrompt).toEqual(secondPrompt);

      // Verify both prompts are still available in the MCP server
      await expectListPromptsToReturn({
        client: promptManager,
        expectedPrompts: [
          {
            name: firstPrompt.name,
            title: updateData.title,
            description: firstPrompt.description,
          },
          {
            name: secondPrompt.name,
            title: secondPrompt.title,
            description: secondPrompt.description,
          },
        ],
      });
    });
  });
});
