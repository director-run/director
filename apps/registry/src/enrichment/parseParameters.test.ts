import { describe, it } from "vitest";
import { makeStdioTransport, makeTestEntry } from "../test/fixtures/entries";

describe("parseParameters", () => {
  it("should parse parameters from arguments correctly", () => {
    const entry = makeTestEntry({
      transport: makeStdioTransport({
        args: ["--foo", "--bar"],
      }),
    });
  });
});
