import { z } from "zod";
import type { ProxyServer } from "./proxy-server";
import { SimpleServer } from "./simple-server";

export function createControllerServer({ proxy }: { proxy: ProxyServer }) {
  const server = new SimpleServer(`${proxy.id}-controller`);
  server
    .tool("list_targets")
    .schema(z.object({}))
    .description("List proxy targets")
    .handle(({}) => {
      return Promise.resolve({
        status: "success",
        data: [
          {
            name: "test",
            description: "test",
            url: "https://github.com/test",
          },
        ],
      });
    });

  return server;
}
