import { z } from "zod";

export const ClaudeMCPServerSchema = z.object({
  command: z.string().describe('The command to execute (e.g., "bun", "node")'),
  args: z.array(z.string()).describe("Command line arguments"),
  env: z.record(z.string()).optional().describe("Environment variables"),
});

export const ClaudeConfigSchema = z.object({
  mcpServers: z
    .record(z.string(), ClaudeMCPServerSchema)
    .describe("Map of MCP server configurations"),
});

export type ClaudeMCPServer = z.infer<typeof ClaudeMCPServerSchema>;
export type ClaudeConfig = z.infer<typeof ClaudeConfigSchema>;

/**
 * Validates an MCP configuration object
 * @param config The configuration object to validate
 * @returns The validated configuration
 * @throws {ZodError} If the configuration is invalid
 */
export function validateMCPConfig(config: unknown): ClaudeConfig {
  return ClaudeConfigSchema.parse(config);
}

/**
 * Safely validates an MCP configuration object
 * @param config The configuration object to validate
 * @returns A tuple containing the validation result and any errors
 */
export function safeValidateMCPConfig(
  config: unknown,
): [ClaudeConfig | null, z.ZodError | null] {
  const result = ClaudeConfigSchema.safeParse(config);
  if (result.success) {
    return [result.data, null];
  }
  return [null, result.error];
}

/**
 * Gets a specific MCP server configuration
 * @param config The MCP configuration
 * @param serverId The ID of the server to get
 * @returns The server configuration or undefined if not found
 */
export function getMCPServerConfig(
  config: ClaudeConfig,
  serverId: string,
): ClaudeMCPServer | undefined {
  return config.mcpServers[serverId];
}

/**
 * Adds or updates an MCP server configuration
 * @param config The MCP configuration
 * @param serverId The ID of the server to add/update
 * @param serverConfig The server configuration
 * @returns A new MCP configuration with the updated server
 */
export function setMCPServerConfig(
  config: ClaudeConfig,
  serverId: string,
  serverConfig: ClaudeMCPServer,
): ClaudeConfig {
  return {
    ...config,
    mcpServers: {
      ...config.mcpServers,
      [serverId]: serverConfig,
    },
  };
}

/**
 * Removes an MCP server configuration
 * @param config The MCP configuration
 * @param serverId The ID of the server to remove
 * @returns A new MCP configuration without the specified server
 */
export function removeMCPServerConfig(
  config: ClaudeConfig,
  serverId: string,
): ClaudeConfig {
  const { [serverId]: _, ...remainingServers } = config.mcpServers;
  return {
    ...config,
    mcpServers: remainingServers,
  };
}

/**
 * Example configuration:
 * ```json
 * {
 *   "mcpServers": {
 *     "director__claude-proxy": {
 *       "args": [
 *         "/Users/barnaby/tmp/director/apps/cli/bin/cli.ts",
 *         "sse2stdio",
 *         "http://localhost:3000/claude-proxy/sse"
 *       ],
 *       "command": "bun",
 *       "env": {
 *         "LOG_LEVEL": "silent",
 *         "PROXY_TARGET_CONNECT_RETRY_COUNT": "0"
 *       }
 *     }
 *   }
 * }
 * ```
 */
