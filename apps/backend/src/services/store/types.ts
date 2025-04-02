export type StdioTransportConfig = {
  type?: "stdio";
  command: string;
  args?: string[];
  env?: string[];
};

export type SSETransportConfig = {
  type: "sse";
  url: string;
};

export type ServerConfigItem = {
  name: string;
  transport: SSETransportConfig | StdioTransportConfig;
};

export type ProxyConfigItem = {
  name: string;
  servers: Array<ServerConfigItem>;
};

export type ConfigDB = {
  proxies: ProxyConfigItem[];
};
