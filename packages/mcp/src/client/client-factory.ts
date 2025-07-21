import type { ProxyTargetAttributes } from "@director.run/utilities/schema";
import { HTTPClient } from "./http-client";
import { StdioClient } from "./stdio-client";

export function createClientForTarget(target: ProxyTargetAttributes) {
  switch (target.transport.type) {
    case "http":
      return new HTTPClient({
        url: target.transport.url,
        name: target.name,
      });
    case "stdio":
      return new StdioClient({
        name: target.name,
        command: target.transport.command,
        args: target.transport.args,
        env: {
          ...(process.env as Record<string, string>),
          ...target.transport.env,
        },
      });
  }
}
