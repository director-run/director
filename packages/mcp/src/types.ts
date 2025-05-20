export type SSETransport = {
  type: "sse";
  url: string;
};

export type STDIOTransport = {
  type: "stdio";
  command: string;
  args?: string[];
  env?: Record<string, string>;
};

export type ProxyTransport = SSETransport | STDIOTransport;

export type ProxyTargetAttributes = {
  name: string;
  transport: ProxyTransport;
};

export type ProxyServerAttributes = {
  id: string;
  name: string;
  description?: string;
  servers: ProxyTargetAttributes[];
};
