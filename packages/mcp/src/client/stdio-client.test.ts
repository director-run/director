import { ErrorCode } from "@director.run/utilities/error";
import { expectToThrowAppError } from "@director.run/utilities/test";
import { describe, it } from "vitest";
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

        await expectToThrowAppError(
          () => client.connectToTarget({ throwOnError: true }),
          {
            code: ErrorCode.CONNECTION_REFUSED,
            message: `[echo] command not found: 'not_existing_command'. Please make sure it is installed and available in your $PATH.`,
            props: {},
          },
        );
      });

      it("should bubble up command errors properly", async () => {
        const client = new StdioClient({
          name: "echo",
          command: "ls",
          args: ["not_existing_dir"],
        });

        await expectToThrowAppError(
          () => client.connectToTarget({ throwOnError: true }),
          {
            code: ErrorCode.CONNECTION_REFUSED,
            message: `[echo] failed to run 'ls not_existing_dir'. Please check the logs for more details.`,
            props: {},
          },
        );
      });
    });
  });
});
