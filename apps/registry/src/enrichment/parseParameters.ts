import { type EntryGetParams, type EntryParameter } from "../db/schema";

export function parseParameters(entry: EntryGetParams): Array<EntryParameter> {
  const parameters: Array<EntryParameter> = [];
  if (entry.transport.type === "stdio") {
    parameters.push(...parseArgumentParameters(entry.transport.args));
    parameters.push(...parseEnvParameters(entry.transport.env ?? {}));
  }
  return parameters;
}

function parseArgumentParameters(args: string[]): Array<EntryParameter> {
  const parameters: Array<EntryParameter> = [];

  for (const arg of args) {
    parameters.push(
      ...extractParameterPlaceholders(arg).map((name) => ({
        name,
        description: "",
        scope: "args" as const,
        type: "string" as const,
        required: true as const,
      })),
    );
  }
  return parameters;
}

function parseEnvParameters(
  env: Record<string, string>,
): Array<EntryParameter> {
  const parameters: Array<EntryParameter> = [];

  for (const [key, value] of Object.entries(env)) {
    // Extract parameters from both the key and value
    const valueParams = extractParameterPlaceholders(value);

    // Add parameters from the value
    parameters.push(
      ...valueParams.map((name) => ({
        name,
        description: "",
        scope: "env" as const,
        type: "string" as const,
        required: true as const,
      })),
    );
  }
  return parameters;
}

/**
 * Extracts all parameter placeholders enclosed in < and > symbols from a string
 * @param input The input string to search through
 * @returns An array of extracted parameter names
 */
function extractParameterPlaceholders(input: string): string[] {
  // Use regular expression to find all matches between < and >
  const matches = input.match(/<([^>]+)>/g);

  if (!matches) {
    return [];
  }

  // Remove the < and > symbols and return the parameter names
  return matches.map((match) => match.slice(1, -1));
}

// Example usage:
// const text = "Here is MY_API_KEY and another CONSTANT_VALUE with some other text";
// const extracted = extractUppercaseWithUnderscores(text);
// Result: ["MY_API_KEY", "CONSTANT_VALUE"]
