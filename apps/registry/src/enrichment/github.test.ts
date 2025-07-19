import { describe, expect, test } from "vitest";
import { getGithubRawReadmeUrl } from "./github";

describe("GitHub URL parsing", () => {
  test("should parse basic repository URL", () => {
    const expectations = {
      "https://github.com/JetBrains/mcp-jetbrains":
        "https://raw.githubusercontent.com/JetBrains/mcp-jetbrains/refs/heads/main/README.md",

      "https://github.com/e2b-dev/mcp-server/blob/main/packages/js/README.md":
        "https://raw.githubusercontent.com/e2b-dev/mcp-server/refs/heads/main/packages/js/README.md",

      "https://github.com/sonnylazuardi/cursor-talk-to-figma-mcp":
        "https://raw.githubusercontent.com/sonnylazuardi/cursor-talk-to-figma-mcp/refs/heads/main/README.md",

      "https://github.com/modelcontextprotocol/servers/tree/HEAD/src/brave-search":
        "https://raw.githubusercontent.com/modelcontextprotocol/servers/refs/heads/HEAD/src/brave-search/README.md",

      "https://github.com/modelcontextprotocol/servers/tree/main/src/fetch":
        "https://raw.githubusercontent.com/modelcontextprotocol/servers/refs/heads/main/src/fetch/README.md",
    };

    for (const [url, expected] of Object.entries(expectations)) {
      expect(getGithubRawReadmeUrl(url)).toEqual(expected);
    }
  });
});
