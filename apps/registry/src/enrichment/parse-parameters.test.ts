import { AppError } from "@director.run/utilities/error";
import { describe, expect, it } from "vitest";
import type { EntryGetParams } from "../db/schema";
import { makeStdioTransport, makeTestEntry } from "../test/fixtures/entries";
import { parseParameters } from "./parse-parameters";

describe("parseParameters", () => {
  it("should de-duplicate parameters", () => {
    const entry = makeTestEntry({
      transport: makeStdioTransport({
        env: { YOUR_ACCESS_TOKEN_HERE: "<duplicate-param>" },
        args: [
          "-y",
          "--package",
          "@polar-sh/sdk",
          "--",
          "mcp",
          "start",
          "--access-token",
          "<duplicate-param>",
        ],
      }),
    });

    expect(() => parseParameters(entry as EntryGetParams)).toThrow(AppError);
  });

  it("should parse parameters from arguments correctly", () => {
    const entry1 = makeTestEntry({
      transport: makeStdioTransport({
        env: { GITHUB_PERSONAL_ACCESS_TOKEN: "<your-token>" },
        args: [
          "-y",
          "--package",
          "@polar-sh/sdk",
          "--",
          "mcp",
          "start",
          "--access-token",
          "<some-other-token>",
        ],
        type: "stdio",
        command: "docker",
      }),
    });

    const entry2 = makeTestEntry({
      transport: makeStdioTransport({
        env: { GITHUB_PERSONAL_ACCESS_TOKEN: "<your-token>" },
        args: [
          "-y",
          "@paddle/paddle-mcp",
          "--api-key=<paddle-api-key>",
          "--environment=<environment>",
        ],
        type: "stdio",
        command: "docker",
      }),
    });

    const parameters1 = parseParameters(entry1 as EntryGetParams);
    const parameters2 = parseParameters(entry2 as EntryGetParams);
    expect(parameters1.length).toEqual(2);
    expect(parameters1).toContainEqual({
      name: "some-other-token",
      description: "",
      scope: "args",
      type: "string",
      required: true,
    });
    expect(parameters1).toContainEqual({
      name: "your-token",
      description: "",
      scope: "env",
      type: "string",
      required: true,
    });
    expect(parameters2.length).toEqual(3);
    expect(parameters2).toContainEqual({
      name: "paddle-api-key",
      description: "",
      scope: "args",
      type: "string",
      required: true,
    });
    expect(parameters2).toContainEqual({
      name: "environment",
      description: "",
      scope: "args",
      type: "string",
      required: true,
    });
    expect(parameters2).toContainEqual({
      name: "your-token",
      description: "",
      scope: "env",
      type: "string",
      required: true,
    });
  });
});
