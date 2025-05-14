import { describe, test } from "vitest";
import {
  createClaudeConfig,
  createClaudeServerEntry,
} from "./test/fixtures/claude";

describe("claude installer", () => {
  test("should do something", () => {
    const config = createClaudeConfig([
      createClaudeServerEntry(),
      createClaudeServerEntry(),
    ]);
    console.log(config);
  });
});
