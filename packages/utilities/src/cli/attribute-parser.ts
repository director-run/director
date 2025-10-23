import { z } from "zod";

// Schema for attribute values that can be strings, booleans, arrays, objects, or empty values
const attributeValueSchema = z.union([
  z.string(),
  z.boolean(),
  z.array(z.string()),
  z.record(z.unknown()),
  z.literal(""),
]);

// Schema for the parsed attributes object
const parsedAttributesSchema = z.record(z.string(), attributeValueSchema);

export type ParsedAttributes = z.infer<typeof parsedAttributesSchema>;

// Schema for the allowed attributes configuration
const allowedAttributesConfigSchema = z.object({
  allowedAttributes: z.array(z.string()).default([]),
});

export type AllowedAttributesConfig = z.infer<
  typeof allowedAttributesConfigSchema
>;

/**
 * Parses key-value attribute strings into a structured object
 *
 * Supports:
 * - String values: "name=value"
 * - Boolean values: "enabled=true" or "enabled=false"
 * - Array values: "disabledTools=['tool1', 'tool2']"
 * - JSON objects: "tools={\"prefix\":\"p_\",\"exclude\":[\"tool1\"]}"
 * - Empty values: "toolPrefix=''" or "disabledTools=[]"
 *
 * @param attributeStrings - Array of key=value strings
 * @param config - Configuration for allowed attributes and validation
 * @returns Parsed attributes object
 */
export function parseKeyValueAttributes(
  attributeStrings: string[],
  config: AllowedAttributesConfig = { allowedAttributes: [] },
): ParsedAttributes {
  const attributes: Record<string, unknown> = {};

  for (const attr of attributeStrings) {
    if (!attr.includes("=")) {
      throw new Error(`Invalid attribute format: ${attr}. Expected key=value`);
    }

    const [key, ...valueParts] = attr.split("=");
    const value = valueParts.join("="); // Rejoin in case value contains '='

    if (!key) {
      throw new Error(`Invalid attribute format: ${attr}. Expected key=value`);
    }

    // Validate that the attribute is allowed if allowedAttributes is specified
    if (
      config.allowedAttributes.length > 0 &&
      !config.allowedAttributes.includes(key)
    ) {
      throw new Error(
        `Attribute '${key}' is not allowed. Allowed attributes: ${config.allowedAttributes.join(", ")}`,
      );
    }

    // Parse the value based on its format
    const parsedValue = parseAttributeValue(key, value);
    attributes[key] = parsedValue;
  }

  // Validate the entire result with zod
  return parsedAttributesSchema.parse(attributes);
}

/**
 * Parses a single attribute value based on its format
 */
function parseAttributeValue(
  key: string,
  value: string,
): string | boolean | string[] | Record<string, unknown> {
  // Handle empty values
  if (value === "" || value === "''" || value === '""') {
    return "";
  }

  // Handle boolean values
  if (value.toLowerCase() === "true" || value === "1") {
    return true;
  }
  if (value.toLowerCase() === "false" || value === "0") {
    return false;
  }

  // Handle JSON objects (format: {key: value})
  if (value.startsWith("{") && value.endsWith("}")) {
    try {
      return JSON.parse(value) as Record<string, unknown>;
    } catch (_error) {
      throw new Error(
        `Invalid JSON object format for ${key}: ${value}. Expected valid JSON`,
      );
    }
  }

  // Handle array values (format: ['item1', 'item2'] or [item1, item2])
  if (value.startsWith("[") && value.endsWith("]")) {
    try {
      const arrayContent = value.slice(1, -1);
      if (arrayContent.trim() === "") {
        return [];
      }

      // Parse array items, handling both quoted and unquoted strings
      const items = arrayContent
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
        .map((item) => {
          // Remove quotes if present
          if (
            (item.startsWith("'") && item.endsWith("'")) ||
            (item.startsWith('"') && item.endsWith('"'))
          ) {
            return item.slice(1, -1);
          }
          return item;
        });

      return items;
    } catch (_error) {
      throw new Error(
        `Invalid array format for ${key}: ${value}. Expected format: ['item1', 'item2']`,
      );
    }
  }

  // Handle quoted strings
  if (
    (value.startsWith("'") && value.endsWith("'")) ||
    (value.startsWith('"') && value.endsWith('"'))
  ) {
    return value.slice(1, -1);
  }

  // Default to string value
  return value;
}
