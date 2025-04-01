export type StdioTransport = {
  type?: "stdio";
  command: string;
  args?: string[];
  env?: string[];
};

export type SSETransport = {
  type: "sse";
  url: string;
};

export type MCPServer = {
  name: string;
  transport: SSETransport | StdioTransport;
};

export type Proxy = {
  name: string;
  servers: Array<MCPServer>;
};

export type ProxyDB = {
  proxies: Proxy[];
};
