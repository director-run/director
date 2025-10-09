import {} from "@director.run/utilities/error";
import { t } from "@director.run/utilities/trpc";
import { z } from "zod";
import {} from "../../config/schema";
import { WorkspaceStore } from "../../workspaces/workspace-store";

export function createToolsRouter({
  workspaceStore,
}: { workspaceStore: WorkspaceStore }) {
  return t.router({
    // callTool: t.procedure
    //   .input(
    //     z.object({
    //       workspaceId: z.string(),
    //       serverName: z.string(),
    //       toolName: z.string(),
    //       arguments: z.any(),
    //     }),
    //   )
    //   .mutation(async ({ input }) => {
    //     const workspace = await workspaceStore.get(input.workspaceId);
    //     const target = await workspace.getTarget(input.serverName);
    //     return await target.originalCallTool({
    //       name: input.toolName,
    //       arguments: input.arguments,
    //     });
    //   }),
    // list: t.procedure
    //   .input(
    //     z.object({
    //       workspaceId: z.string(),
    //       serverName: z.string().optional(),
    //     }),
    //   )
    //   .query(async ({ input }) => {
    //     const workspace = await workspaceStore.get(input.workspaceId);
    //     return await workspace.listTools();
    //   }),
    updateBatch: t.procedure
      .input(
        z.object({
          workspaceId: z.string(),
          serverName: z.string(),
          toolName: z.string(),
          arguments: z.any(),
        }),
      )
      .mutation(async ({ input }) => {
        const workspace = await workspaceStore.get(input.workspaceId);
        const target = await workspace.getTarget(input.serverName);
        return await target.originalCallTool({
          name: input.toolName,
          arguments: input.arguments,
        });
      }),
  });
}
