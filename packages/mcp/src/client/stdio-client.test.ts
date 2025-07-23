import { describe, expect, it } from "vitest";
import { StdioClient } from "./stdio-client";

describe("StdioClient", () => {
  describe("connectToTarget", () => {
    describe("error handling", () => {
      it("should fail if it can't connect to stdio", async () => {
        const client = new StdioClient({
          name: "echo",
          command: "not_existing_command",
          args: [],
        });

        await expect(
          client.connectToTarget({ throwOnError: true }),
        ).rejects.toThrow(
          `[echo] command not found: 'not_existing_command'. Please make sure it is installed and available in your $PATH.`,
        );
      });

      it("should bubble up command errors properly", async () => {
        const client = new StdioClient({
          name: "echo",
          command: "ls",
          args: ["not_existing_dir"],
        });

        await expect(
          client.connectToTarget({ throwOnError: true }),
        ).rejects.toThrow(
          `[echo] failed to run 'ls not_existing_dir'. Please check the logs for more details.`,
        );
      });
    });
  });
});
