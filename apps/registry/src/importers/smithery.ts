// smithery-api-client.ts

/**
 * Smithery Registry API Client
 *
 * A TypeScript client for interacting with the Smithery Registry API
 * to programmatically search and retrieve MCP server information.
 */

// Types
export interface ServerListItem {
  qualifiedName: string;
  displayName: string;
  description: string;
  homepage: string;
  iconUrl: string;
  useCount: number;
  isDeployed: boolean;
  remote: boolean;
  createdAt: string;
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

export interface ServerListResponse {
  servers: ServerListItem[];
  pagination: PaginationInfo;
}

export interface ConnectionConfig {
  type: "http" | "stdio";
  url?: string;
  configSchema: Record<string, unknown>;
}

export interface SecurityInfo {
  scanPassed: boolean;
}

export interface Tool {
  name: string;
  description: string | null;
  inputSchema: {
    type: "object";
    properties?: Record<string, unknown>;
  };
}

export interface ServerDetails {
  qualifiedName: string;
  displayName: string;
  description: string;
  iconUrl: string | null;
  remote: boolean;
  deploymentUrl: string | null;
  connections: ConnectionConfig[];
  security: SecurityInfo | null;
  tools: Tool[] | null;
}

export interface ListServersOptions {
  query?: string;
  page?: number;
  pageSize?: number;
}

export class SmitheryAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: unknown,
  ) {
    super(message);
    this.name = "SmitheryAPIError";
  }
}

/**
 * Smithery Registry API Client
 */
export class SmitheryClient {
  private baseUrl = "https://registry.smithery.ai";
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("API key is required");
    }
    this.apiKey = apiKey;
  }

  /**
   * Common headers for all API requests
   */
  private getHeaders(): HeadersInit {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  }

  /**
   * Handle API responses and errors
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `API request failed with status ${response.status}`;
      let errorData;

      try {
        errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // If response is not JSON, use status text
        errorMessage = `${errorMessage}: ${response.statusText}`;
      }

      throw new SmitheryAPIError(errorMessage, response.status, errorData);
    }

    try {
      return await response.json();
    } catch (_error) {
      throw new SmitheryAPIError("Failed to parse response as JSON");
    }
  }

  /**
   * List servers with optional search and pagination
   *
   * @param options - Query parameters for listing servers
   * @returns Promise<ServerListResponse> - List of servers with pagination info
   *
   * @example
   * ```typescript
   * // Simple search
   * const results = await client.listServers({ query: 'machine learning' });
   *
   * // With filters
   * const results = await client.listServers({
   *   query: 'owner:smithery-ai is:verified',
   *   page: 1,
   *   pageSize: 20
   * });
   * ```
   */
  async listServers(
    options: ListServersOptions = {},
  ): Promise<ServerListResponse> {
    const params = new URLSearchParams();

    if (options.query) {
      params.append("q", options.query);
    }
    if (options.page !== undefined) {
      params.append("page", options.page.toString());
    }
    if (options.pageSize !== undefined) {
      params.append("pageSize", options.pageSize.toString());
    }

    const url = `${this.baseUrl}/servers${params.toString() ? "?" + params.toString() : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    });

    return this.handleResponse<ServerListResponse>(response);
  }

  /**
   * Get detailed information about a specific server
   *
   * @param qualifiedName - The qualified name of the server (e.g., 'exa' or 'owner/repository')
   * @returns Promise<ServerDetails> - Detailed server information
   *
   * @example
   * ```typescript
   * const server = await client.getServer('exa');
   * console.log(server.tools);
   * ```
   */
  async getServer(qualifiedName: string): Promise<ServerDetails> {
    if (!qualifiedName) {
      throw new Error("Qualified name is required");
    }

    const url = `${this.baseUrl}/servers/${encodeURIComponent(qualifiedName)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    });

    return this.handleResponse<ServerDetails>(response);
  }

  /**
   * Search for servers using the query syntax
   * This is a convenience method that wraps listServers
   *
   * @param query - Search query with optional filters
   * @returns Promise<ServerListItem[]> - Array of matching servers
   *
   * @example
   * ```typescript
   * // Semantic search
   * const servers = await client.search('memory management');
   *
   * // With filters
   * const servers = await client.search('owner:mem0ai is:verified memory');
   * ```
   */
  async search(query: string): Promise<ServerListItem[]> {
    const results = await this.listServers({ query, pageSize: 100 });
    return results.servers;
  }

  /**
   * Get all servers (paginated)
   * Iterates through all pages and returns complete list
   *
   * @param pageSize - Number of items per page (default: 100)
   * @returns Promise<ServerListItem[]> - Complete list of all servers
   */
  async getAllServers(pageSize: number = 100): Promise<ServerListItem[]> {
    const allServers: ServerListItem[] = [];
    let currentPage = 1;
    let totalPages = 1;

    do {
      const response = await this.listServers({
        page: currentPage,
        pageSize,
      });

      allServers.push(...response.servers);
      totalPages = response.pagination.totalPages;
      currentPage++;
    } while (currentPage <= totalPages);

    return allServers;
  }

  /**
   * Get servers by owner
   *
   * @param owner - GitHub username or organization
   * @returns Promise<ServerListItem[]> - Servers owned by the specified user
   */
  async getServersByOwner(owner: string): Promise<ServerListItem[]> {
    return await this.search(`owner:${owner}`);
  }

  /**
   * Get only verified servers
   *
   * @returns Promise<ServerListItem[]> - List of verified servers
   */
  async getVerifiedServers(): Promise<ServerListItem[]> {
    return await this.search("is:verified");
  }

  /**
   * Get only deployed servers
   *
   * @returns Promise<ServerListItem[]> - List of deployed servers
   */
  async getDeployedServers(): Promise<ServerListItem[]> {
    return await this.search("is:deployed");
  }
}

// Export a factory function for convenience
export function createSmitheryClient(apiKey: string): SmitheryClient {
  return new SmitheryClient(apiKey);
}

// Example usage:
/*
  import { createSmitheryClient } from './smithery-api-client';
  
  async function main() {
    const client = createSmitheryClient('your-smithery-api-token');
    
    // List servers with search
    const searchResults = await client.listServers({
      query: 'machine learning',
      page: 1,
      pageSize: 10
    });
    
    console.log(`Found ${searchResults.pagination.totalCount} servers`);
    searchResults.servers.forEach(server => {
      console.log(`- ${server.displayName} (${server.qualifiedName})`);
    });
    
    // Get specific server details
    const serverDetails = await client.getServer('exa');
    console.log(`\nServer: ${serverDetails.displayName}`);
    console.log(`Tools: ${serverDetails.tools?.length || 0}`);
    
    // Search with filters
    const verifiedServers = await client.search('owner:smithery-ai is:verified');
    console.log(`\nFound ${verifiedServers.length} verified servers from smithery-ai`);
  }
  
  main().catch(console.error);
  */
