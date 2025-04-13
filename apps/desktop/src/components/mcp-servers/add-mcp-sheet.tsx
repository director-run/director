import { useProxyQueryStates } from "@/hooks/use-proxy-query-states";
import { trpc } from "@/lib/trpc";
import { Proxy } from "@director/backend/src/services/db/schema";
import { McpForm } from "../mcp-servers/mcp-form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";

export function AddMcpSheet({ proxy }: { proxy: Proxy }) {
  const [proxyQueryStates, setProxyQueryStates] = useProxyQueryStates();
  const utils = trpc.useUtils();

  const updateConfigMutation = trpc.store.update.useMutation({
    onSuccess: () => {
      utils.store.get.invalidate();
      utils.store.get.refetch();
      setProxyQueryStates({
        add: null,
      });
    },
  });

  return (
    <Sheet
      open={proxyQueryStates.add === "mcp"}
      onOpenChange={() => {
        setProxyQueryStates({
          add: null,
        });
      }}
    >
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add MCP Server</SheetTitle>
          <SheetDescription>
            Add a new MCP server to your proxy.
          </SheetDescription>
        </SheetHeader>
        <McpForm
          onSubmit={(data) => {
            updateConfigMutation.mutate({
              proxyId: proxy.id,
              attributes: {
                servers: [...proxy.servers, data],
              },
            });
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
