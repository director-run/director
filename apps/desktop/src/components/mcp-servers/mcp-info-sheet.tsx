import { useProxyQueryStates } from "@/hooks/use-proxy-query-states";
import { trpc } from "@/lib/trpc";
import { McpServer, Proxy } from "@director/backend/src/services/db/schema";
import { useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";

export function McpInfoSheet({ proxy }: { proxy: Proxy }) {
  const [currentMcp, setCurrentMcp] = useState<McpServer | null>(null);
  const [{ mcpId, proxyId }, setProxyQueryStates] = useProxyQueryStates();

  const mcp = proxy.servers.find((it) => it.name === mcpId);

  useEffect(() => {
    if (mcp) {
      setCurrentMcp(mcp);
    }
  }, [mcp]);

  const utils = trpc.useUtils();

  const removeMcpMutation = trpc.store.update.useMutation({
    onSuccess: () => {
      utils.store.get.refetch({ proxyId: proxyId as string });
      setProxyQueryStates({
        mcpId: null,
      });
    },
  });

  return (
    <Sheet
      open={!!mcp}
      onOpenChange={() => {
        setProxyQueryStates({
          mcpId: null,
        });
      }}
    >
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{currentMcp?.name}</SheetTitle>
          <Badge className="w-fit">
            {currentMcp?.transport.type.toUpperCase()}
          </Badge>
        </SheetHeader>
        <SheetFooter>
          <Button
            variant="destructive"
            onClick={() => {
              removeMcpMutation.mutate({
                proxyId: proxyId as string,
                attributes: {
                  servers: proxy.servers.filter(
                    (it) => it.name !== currentMcp?.name,
                  ),
                },
              });
            }}
          >
            Remove
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
