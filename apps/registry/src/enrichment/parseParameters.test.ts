import { describe, expect, it } from "vitest";
import type { EntryGetParams } from "../db/schema";
import { makeStdioTransport, makeTestEntry } from "../test/fixtures/entries";
import { parseParameters } from "./parseParameters";

describe("parseParameters", () => {
  it.skip("should de-duplicate parameters", () => {
    const entry = makeTestEntry({
      transport: makeStdioTransport({
        env: { YOUR_ACCESS_TOKEN_HERE: "<YOUR_TOKEN>" },
        args: [
          "-y",
          "--package",
          "@polar-sh/sdk",
          "--",
          "mcp",
          "start",
          "--access-token",
          "YOUR_ACCESS_TOKEN_HERE",
          "--access-token-2",
          "YOUR_ACCESS_TOKEN_HERE",
        ],
      }),
    });

    const parameters = parseParameters(entry as EntryGetParams);
    expect(parameters.length).toEqual(1);
    expect(parameters).toContainEqual({
      name: "YOUR_ACCESS_TOKEN_HERE",
      description: "<YOUR_TOKEN>",
      scope: "args",
      type: "string",
      required: true,
    });
  });

  it("should parse parameters from arguments correctly", () => {
    const entry1 = makeTestEntry({
      transport: makeStdioTransport({
        env: { GITHUB_PERSONAL_ACCESS_TOKEN: "<YOUR_TOKEN>" },
        args: [
          "-y",
          "--package",
          "@polar-sh/sdk",
          "--",
          "mcp",
          "start",
          "--access-token",
          "YOUR_ACCESS_TOKEN_HERE",
        ],
        type: "stdio",
        command: "docker",
      }),
    });

    const entry2 = makeTestEntry({
      transport: makeStdioTransport({
        env: { GITHUB_PERSONAL_ACCESS_TOKEN: "<YOUR_TOKEN>" },
        args: [
          "-y",
          "@paddle/paddle-mcp",
          "--api-key=PADDLE_API_KEY",
          "--environment=(sandbox|production)",
        ],
        type: "stdio",
        command: "docker",
      }),
    });

    const parameters1 = parseParameters(entry1 as EntryGetParams);
    const parameters2 = parseParameters(entry2 as EntryGetParams);
    expect(parameters2.length).toEqual(2);
    expect(parameters1).toContainEqual({
      name: "YOUR_ACCESS_TOKEN_HERE",
      description: "",
      scope: "args",
      type: "string",
      required: true,
    });
    expect(parameters1).toContainEqual({
      name: "GITHUB_PERSONAL_ACCESS_TOKEN",
      description: "<YOUR_TOKEN>",
      scope: "env",
      type: "string",
      required: true,
    });
    expect(parameters2.length).toEqual(2);
    expect(parameters2).toContainEqual({
      name: "PADDLE_API_KEY",
      description: "",
      scope: "args",
      type: "string",
      required: true,
    });
    expect(parameters2).toContainEqual({
      name: "GITHUB_PERSONAL_ACCESS_TOKEN",
      description: "<YOUR_TOKEN>",
      scope: "env",
      type: "string",
      required: true,
    });
  });
});
