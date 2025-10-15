import {
  ClientNames,
  getAllClientsAsPlainObject,
  getClient,
} from "@director.run/client-configurator/index";
import { t } from "@director.run/utilities/trpc";
import { joinURL } from "@director.run/utilities/url";
import { z } from "zod";
import { getSSEPathForProxy, getStreamablePathForProxy } from "../../helpers";
import type { WorkspaceStore } from "../../workspaces/workspace-store";

export function createClientRouter({
  workspaceStore,
}: { workspaceStore: WorkspaceStore }) {
  return t.router({
    allClients: t.procedure.query(() => getAllClientsAsPlainObject()),
    install: t.procedure
      .input(
        z.object({
          client: z.nativeEnum(ClientNames),
          proxyId: z.string(),
          baseUrl: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        const proxy = workspaceStore.get(input.proxyId);
        const installer = await getClient(input.client);
        const result = await installer.install({
          name: proxy.id,
          sseURL: joinURL(input.baseUrl, getSSEPathForProxy(proxy.id)),
          streamableURL: joinURL(
            input.baseUrl,
            getStreamablePathForProxy(proxy.id),
          ),
        });
        if (result.requiresRestart) {
          await installer.restart();
        }
      }),
    uninstall: t.procedure
      .input(
        z.object({
          client: z.nativeEnum(ClientNames),
          proxyId: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        const proxy = workspaceStore.get(input.proxyId);
        const installer = await getClient(input.client);
        const result = await installer.uninstall(proxy.id);
        if (result.requiresRestart) {
          await installer.restart();
        }
      }),
  });
}
