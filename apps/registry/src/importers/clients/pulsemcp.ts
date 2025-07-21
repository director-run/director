/**
 * Server interface representing an MCP server
 */
export interface Server {
  name: string;
  url: string;
  external_url: string;
  short_description: string;
  source_code_url: string;
  github_stars: number;
  package_registry: string;
  package_name: string;
  package_download_count: number;
  EXPERIMENTAL_ai_generated_description: string;
}

/**
 * Error response interface
 */
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

/**
 * List servers response interface
 */
export interface ListServersResponse {
  servers: Server[];
  next?: string;
  total_count: number;
}

/**
 * Parameters for listing servers
 */
export interface ListServersParams {
  query?: string;
  count_per_page?: number;
  offset?: number;
}

/**
 * Configuration options for the PulseMCP client
 */
export interface PulseMCPConfig {
  baseUrl?: string;
  headers?: Record<string, string>;
  fetch?: typeof fetch;
}

/**
 * Custom error class for API errors
 */
export class PulseMCPError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = "PulseMCPError";
  }
}

/**
 * Pulse MCP API Client
 */
export class PulseMCPClient {
  private baseUrl: string;
  private headers: Record<string, string>;
  private fetchFn: typeof fetch;

  constructor(config: PulseMCPConfig = {}) {
    this.baseUrl = config.baseUrl || "https://api.pulsemcp.com/v0beta";
    this.headers = {
      ...config.headers,
    };
    this.fetchFn = config.fetch || fetch;
  }

  /**
   * Make an HTTP request to the API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await this.fetchFn(url, {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse;
        throw new PulseMCPError(
          errorData.error.code,
          errorData.error.message,
          response.status,
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof PulseMCPError) {
        throw error;
      }
      throw new PulseMCPError(
        "NETWORK_ERROR",
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    }
  }

  /**
   * List MCP Servers
   * Retrieve a paginated list of MCP servers with optional search query & filtering
   */
  listServers(params: ListServersParams = {}): Promise<ListServersResponse> {
    const queryParams = new URLSearchParams();

    if (params.query !== undefined) {
      queryParams.append("query", params.query);
    }

    if (params.count_per_page !== undefined) {
      if (params.count_per_page > 5000) {
        throw new PulseMCPError(
          "INVALID_PARAMETER",
          "count_per_page cannot exceed 5000",
        );
      }
      queryParams.append("count_per_page", params.count_per_page.toString());
    }

    if (params.offset !== undefined) {
      queryParams.append("offset", params.offset.toString());
    }

    const queryString = queryParams.toString();
    const endpoint = `/servers${queryString ? `?${queryString}` : ""}`;

    return this.request<ListServersResponse>(endpoint, {
      method: "GET",
    });
  }

  async fetchAllServers(): Promise<Server[]> {
    const allServers: Server[] = [];
    let offset = 0;
    const count_per_page = 5000;
    let total_count = 0;
    let hasMore = true;

    while (hasMore) {
      const response = await this.listServers({ count_per_page, offset });
      allServers.push(...response.servers);
      total_count = response.total_count;
      offset += response.servers.length;
      hasMore = offset < total_count;
    }
    return allServers;
  }
}
