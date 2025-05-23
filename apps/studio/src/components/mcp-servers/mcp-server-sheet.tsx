"use client";

import { Badge } from "@/components/ui/badge";
import {
  Section,
  SectionHeader,
  SectionSeparator,
  SectionTitle,
} from "@/components/ui/section";
import {
  Sheet,
  SheetActions,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useProxy } from "@/hooks/use-proxy";
import { useProxyQuery } from "@/hooks/use-proxy-query";
import { McpDeleteConfirmation } from "./mcp-delete-confirmation";
import { McpDescriptionList } from "./mcp-description-list";
import { McpToolsTable } from "./mcp-tools-table";

interface McpServerSheetProps {
  proxyId: string;
}

export function McpServerSheet({ proxyId }: McpServerSheetProps) {
  const { serverId, setProxyQuery } = useProxyQuery();
  const { proxy } = useProxy(proxyId);

  const server = proxy?.servers.find((server) => server.name === serverId);

  return (
    <Sheet
      open={serverId !== null && !!server}
      onOpenChange={() => setProxyQuery({ serverId: null })}
    >
      <SheetContent>
        {server && (
          <>
            <SheetActions>
              <McpDeleteConfirmation proxyId={proxyId} serverId={server.name} />
              <Badge className="mr-auto" variant="secondary">
                MCP Server
              </Badge>
            </SheetActions>

            <SheetHeader className="pt-6">
              <SheetTitle>{server?.name.replace("registry__", "")}</SheetTitle>
              <SheetDescription>
                Installed on{" "}
                <span className="text-foreground">{proxy?.name}</span>
              </SheetDescription>
            </SheetHeader>

            <McpDescriptionList className="mt-6" transport={server.transport} />

            <SectionSeparator className="my-10" />

            <Section>
              <SectionHeader>
                <SectionTitle variant="h2" asChild>
                  <h3>Tools</h3>
                </SectionTitle>
              </SectionHeader>

              <McpToolsTable proxyId={proxyId} serverId={server.name} />
            </Section>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
