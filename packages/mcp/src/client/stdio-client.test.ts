import { ErrorCode } from "@director.run/utilities/error";
import { expectToThrowAppError } from "@director.run/utilities/test";
import { describe, expect, it } from "vitest";
import { makeEchoServerStdioClient } from "../test/fixtures";
import { StdioClient } from "./stdio-client";

describe("StdioClient", () => {
  describe("disabled behaviour", () => {
    it("when the client is connected, it should disconnect when disabled", async () => {
      const client = makeEchoServerStdioClient();
      await client.connectToTarget({ throwOnError: true });
      expect(client.status).toBe("connected");
      expect(client.isConnected()).toBe(true);
      expect(client.lastErrorMessage).toBeUndefined();
      expect(client.lastConnectedAt).toBeInstanceOf(Date);

      await client.setDisabled(true);
      expect(client.status).toBe("disconnected");
      expect(client.lastErrorMessage).toBeUndefined();
    });

    it("trying to connect a disabled client should not work", async () => {
      const client = makeEchoServerStdioClient();
      client.setDisabled(true);
      expect(await client.connectToTarget({ throwOnError: true })).toBe(false);
      expect(client.status).toBe("disconnected");
      expect(client.lastErrorMessage).toBeUndefined();
      expect(client.lastConnectedAt).toBeUndefined();
    });
  });

  describe("connectToTarget", () => {
    describe("error handling", () => {
      describe("throwOnError = true", () => {
        it("bubble up command not found errors", async () => {
          const client = new StdioClient({
            name: "echo",
            command: "not_existing_command",
            args: [],
          });

          const expectedErrorMessage = `[echo] command not found: 'not_existing_command'. Please make sure it is installed and available in your $PATH.`;
          await expectToThrowAppError(
            () => client.connectToTarget({ throwOnError: true }),
            {
              code: ErrorCode.CONNECTION_REFUSED,
              message: expectedErrorMessage,
              props: {},
            },
          );

          expect(client.status).toBe("error");
          expect(client.lastErrorMessage).toBe(expectedErrorMessage);
          expect(client.lastConnectedAt).toBeUndefined();
        });

        it("should bubble up command errors", async () => {
          const client = new StdioClient({
            name: "echo",
            command: "ls",
            args: ["not_existing_dir"],
          });

          const expectedErrorMessage = `[echo] failed to run 'ls not_existing_dir'. Please check the logs for more details.`;
          await expectToThrowAppError(
            () => client.connectToTarget({ throwOnError: true }),
            {
              code: ErrorCode.CONNECTION_REFUSED,
              message: expectedErrorMessage,
              props: {},
            },
          );

          expect(client.status).toBe("error");
          expect(client.lastErrorMessage).toBe(expectedErrorMessage);
          expect(client.lastConnectedAt).toBeUndefined();
        });
      });

      describe("throwOnError = false", () => {
        it("bubble up command not found errors", async () => {
          const client = new StdioClient({
            name: "echo",
            command: "not_existing_command",
            args: [],
          });

          const expectedErrorMessage = `[echo] command not found: 'not_existing_command'. Please make sure it is installed and available in your $PATH.`;
          await client.connectToTarget({ throwOnError: false }),
            expect(client.status).toBe("error");
          expect(client.lastErrorMessage).toBe(expectedErrorMessage);
          expect(client.lastConnectedAt).toBeUndefined();
        });

        it("should bubble up command errors", async () => {
          const client = new StdioClient({
            name: "echo",
            command: "ls",
            args: ["not_existing_dir"],
          });

          const expectedErrorMessage = `[echo] failed to run 'ls not_existing_dir'. Please check the logs for more details.`;
          await client.connectToTarget({ throwOnError: false }),
            expect(client.status).toBe("error");
          expect(client.lastErrorMessage).toBe(expectedErrorMessage);
          expect(client.lastConnectedAt).toBeUndefined();
        });
      });
    });
  });
});
