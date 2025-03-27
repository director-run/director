import { getPrismaClient } from "./getPrismaClient";

const prisma = getPrismaClient();

export const addProxy = async (proxy: {
  name: string;
  servers: Array<{
    name: string;
    transport:
      | { command: string; args: string[] }
      | { type: "sse"; url: string };
  }>;
}) => {
  await prisma.proxy.create({
    data: {
      name: proxy.name,
      servers: {
        create: proxy.servers.map((server) => {
          if ("command" in server.transport) {
            // Command-based transport
            return {
              name: server.name,
              transport: {
                create: {
                  command: server.transport.command,
                  args: JSON.stringify(server.transport.args),
                  // Use empty strings instead of null
                  type: "",
                  url: "",
                },
              },
            };
          } else {
            // SSE-based transport
            return {
              name: server.name,
              transport: {
                create: {
                  // Use empty strings instead of null
                  command: "",
                  args: "",
                  type: server.transport.type,
                  url: server.transport.url,
                },
              },
            };
          }
        }),
      },
    },
  });
};
