import { t } from "@director.run/utilities/trpc";
import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import _ from "lodash";
import { z } from "zod";
import type { GatewayContext } from "./index";

type EnhancedTool = Tool & {
  serverName?: string;
  disabled?: boolean;
};

export function createToolsRouter() {
  return t.router({
    callTool: t.procedure
      .input(
        z.object({
          playbookId: z.string(),
          serverName: z.string(),
          toolName: z.string(),
          arguments: z.any(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { playbookStore } = ctx as GatewayContext;
        const playbook = await playbookStore.get(input.playbookId);
        const target = await playbook.getTarget(input.serverName);
        return await target.originalCallTool({
          name: input.toolName,
          arguments: input.arguments,
        });
      }),
    list: t.procedure
      .input(
        z.object({
          playbookId: z.string(),
          serverName: z.string().optional(),
        }),
      )
      .query(async ({ ctx, input }) => {
        const { playbookStore } = ctx as GatewayContext;
        const playbook = await playbookStore.get(input.playbookId);
        const ret: EnhancedTool[] = [];
        for (const target of playbook.targets) {
          if (input.serverName && input.serverName !== target.name) {
            continue;
          }

          const tools = await target.originalListTools();
          ret.push(
            ...tools.tools.map((tool) => {
              // Check if tool is disabled via exclude list or not in include list
              const isExcluded =
                target.tools?.exclude?.includes(tool.name) ?? false;
              const isNotIncluded =
                target.tools?.include &&
                target.tools.include.length > 0 &&
                !target.tools.include.includes(tool.name);
              const disabled = isExcluded || !!isNotIncluded;

              return {
                ...tool,
                serverName: target.name,
                disabled,
              };
            }),
          );
        }
        return ret.sort((a, b) => a.name.localeCompare(b.name));
      }),
    updateBatch: t.procedure
      .input(
        z.object({
          playbookId: z.string(),
          tools: z.array(
            z.object({
              serverName: z.string(),
              name: z.string(),
              disabled: z.boolean(),
            }),
          ),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const { playbookStore } = ctx as GatewayContext;
        const playbook = await playbookStore.get(input.playbookId);
        const groupedTools = _.groupBy(input.tools, "serverName");
        for (const serverName in groupedTools) {
          await playbook.updateTarget(serverName, {
            tools: {
              exclude: groupedTools[serverName]
                .filter((tool) => tool.disabled)
                .map((tool) => tool.name),
            },
          });
        }
      }),
  });
}
