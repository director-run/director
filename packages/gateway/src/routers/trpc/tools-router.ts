import { t } from "@director.run/utilities/trpc";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import _ from "lodash";
import { z } from "zod";
import { WorkspaceStore } from "../../workspaces/workspace-store";

type EnhancedTool = Tool & {
  serverName: string;
  disabled?: boolean;
};

export function createToolsRouter({
  workspaceStore,
}: { workspaceStore: WorkspaceStore }) {
  return t.router({
    callTool: t.procedure
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
    list: t.procedure
      .input(
        z.object({
          workspaceId: z.string(),
          serverName: z.string().optional(),
        }),
      )
      .query(async ({ input }) => {
        console.log("listTools", input);
        const workspace = await workspaceStore.get(input.workspaceId);
        const ret: EnhancedTool[] = [];
        for (const target of workspace.targets) {
          if (input.serverName && input.serverName !== target.name) {
            continue;
          }

          const tools = await target.originalListTools();
          ret.push(
            ...tools.tools.map((tool) => ({
              ...tool,
              serverName: target.name,
              disabled: target.disabledTools?.includes(tool.name) ?? false,
            })),
          );
        }
        return ret;
      }),
    updateBatch: t.procedure
      .input(
        z.object({
          workspaceId: z.string(),
          tools: z.array(
            z.object({
              serverName: z.string(),
              name: z.string(),
              disabled: z.boolean(),
            }),
          ),
        }),
      )
      .mutation(async ({ input }) => {
        const workspace = await workspaceStore.get(input.workspaceId);
        const groupedTools = _.groupBy(input.tools, "serverName");
        for (const serverName in groupedTools) {
          await workspace.updateTarget(serverName, {
            disabledTools: groupedTools[serverName]
              .filter((tool) => tool.disabled)
              .map((tool) => tool.name),
          });
        }
      }),
  });
}
