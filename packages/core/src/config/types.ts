type TransportConfigStdio = {
  type?: "stdio";
  command: string;
  args?: string[];
  env?: string[];
};

type TransportConfigSSE = {
  type: "sse";
  url: string;
};

type TransportConfig = TransportConfigSSE | TransportConfigStdio;
export interface ServerConfig {
  name: string;
  transport: TransportConfig;
}

export interface ProxyConfig {
  name: string;
  servers: ServerConfig[];
}

export interface Config {
  ssePort: number;
  proxies: ProxyConfig[];
}
