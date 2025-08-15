import { ChildProcess, spawn } from "node:child_process";
import path from "node:path";
import { AppError, ErrorCode } from "@director.run/utilities/error";
import { afterAll, beforeAll, describe, test } from "vitest";

describe("CLI integration tests", () => {
  let serveProcess: ChildProcess;
  beforeAll(async () => {
    serveProcess = await runCLIServe({ verbose: true });
  }, 30000);

  afterAll(() => {
    serveProcess.kill();
  });

  test("should proxy an SSE server to stdio", () => {
    console.log("Hello, world!");
  });
});

function runCLIServe({
  timeout = 10000,
  verbose = false,
}: {
  timeout?: number;
  verbose?: boolean;
} = {}): Promise<ChildProcess> {
  return new Promise((resolve, reject) => {
    const command = ["bun", path.join(__dirname, "../bin/cli.ts"), "serve"];

    const child = spawn(command[0], command.slice(1), {
      detached: false,
      env: {
        ...process.env,
        LOG_LEVEL: "debug",
      },
    });

    let stderrOutput = "";

    const killTimeout = setTimeout(() => {
      if (verbose) {
        console.log("[timeout] --> killing child");
      }
      child.kill();
      reject(
        new AppError(ErrorCode.TIMEOUT, "child took too long to start", {
          stderr: stderrOutput,
        }),
      );
    }, timeout);

    child.stdout.on("data", (data) => {
      if (verbose) {
        console.log("[stdout] -->", data.toString());
      }
      if (data.toString().includes("gateway running on port")) {
        clearTimeout(killTimeout);
        resolve(child);
      }
    });

    child.stderr.on("data", (data) => {
      if (verbose) {
        console.log("[stderr] -->", data.toString());
      }
      stderrOutput += data.toString();
    });

    child.on("close", (code) => {
      if (code) {
        if (verbose) {
          console.log("[close] --> child process exited with code", code);
        }
        clearTimeout(killTimeout);
        reject(
          new AppError(
            ErrorCode.CHILD_PROCESS_ERROR,
            `child process exited with code ${code}`,
            {
              stderr: stderrOutput,
            },
          ),
        );
      }
    });

    child.on("error", (error) => {
      reject(error);
    });
  });
}
