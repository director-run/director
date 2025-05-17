import { type EntryGetParams } from "../db/schema";

export function parseParameters(entry: EntryGetParams) {
  const parameters = [];
  if (entry.transport.type === "stdio") {
    for (const arg of entry.transport.args) {
      parameters.push(...extractUppercaseWithUnderscores(arg));
    }
  }
  return parameters;
}

/**
 * Extracts all substrings containing only uppercase letters and underscores from a string
 * @param input The input string to search through
 * @returns An array of extracted uppercase-only substrings
 */
function extractUppercaseWithUnderscores(input: string): string[] {
  // Use regular expression to find all matches of uppercase letters and underscores
  const matches = input.match(/[A-Z_]+/g);

  // Return matches if found, otherwise return empty array
  return matches ? matches.filter((match) => /^[A-Z_]+$/.test(match)) : [];
}

// Example usage:
// const text = "Here is MY_API_KEY and another CONSTANT_VALUE with some other text";
// const extracted = extractUppercaseWithUnderscores(text);
// Result: ["MY_API_KEY", "CONSTANT_VALUE"]
