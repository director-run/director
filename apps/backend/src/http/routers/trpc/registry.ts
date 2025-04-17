import { z } from "zod";
import { ErrorCode } from "../../../helpers/error";
import { AppError } from "../../../helpers/error";
import { getServer, getServers } from "../../../services/registry";
import { createTRPCRouter, loggedProcedure } from "./middleware";

export function createRegistryRouter() {
  return createTRPCRouter({
    list: loggedProcedure.query(async () => {
      const servers = await getServers();
      return servers.map((server) => ({
        name: server.name,
        description: server.description.split("\n")[0],
      }));
    }),
    get: loggedProcedure
      .input(z.object({ name: z.string() }))
      .query(async ({ input }) => {
        const server = await getServer(input.name);
        if (!server) {
          throw new AppError(
            ErrorCode.NOT_FOUND,
            `Repository item ${input.name} not found`,
          );
        }
        return server;
      }),
  });
}
