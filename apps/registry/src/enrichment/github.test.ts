import { describe, expect, test } from "vitest";
import { getGithubRawReadmeUrl } from "./github";

describe("GitHub URL parsing", () => {
  test("should parse basic repository URL", () => {
    expect(
      getGithubRawReadmeUrl("https://github.com/modelcontextprotocol/servers"),
    ).toEqual(
      "https://raw.githubusercontent.com/modelcontextprotocol/servers/main/README.md",
    );
  });
});
