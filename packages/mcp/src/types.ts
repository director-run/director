export type SSETransport = {
  type: "sse";
  url: string;
};

export type STDIOTransport = {
  type: "stdio";
  command: string;
  args?: string[];
  env?: string[];
};

export type ProxyTargetAttributes = {
  name: string;
  transport: SSETransport | STDIOTransport;
};

export type ProxyServerAttributes = {
  id: string;
  name: string;
  description?: string;
  servers: ProxyTargetAttributes[];
};
