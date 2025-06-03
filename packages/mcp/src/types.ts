export type HTTPTransport = {
  type: "http";
  url: string;
};

export type STDIOTransport = {
  type: "stdio";
  command: string;
  args?: string[];
  env?: Record<string, string>;
};

export type ProxyTransport = HTTPTransport | STDIOTransport;

export type ProxyTargetAttributes = {
  name: string;
  transport: ProxyTransport;
  source?: {
    name: "registry";
    entryId: string;
    entryData?: unknown;
  };
};

export type ProxyServerAttributes = {
  id: string;
  name: string;
  description?: string;
  servers: ProxyTargetAttributes[];
};
