"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProxyQuery } from "@/hooks/use-proxy-query";
import { trpc } from "@/trpc/client";
import { EntryGetParams } from "@director.run/registry/db/schema";
import { McpInstallForm } from "../mcp-servers/mcp-install-form";

export function RegistryEntryDialog({ proxyId }: { proxyId: string }) {
  const { registryId, setProxyQuery } = useProxyQuery();
  const { data } = trpc.registry.getEntryByName.useQuery(
    {
      name: registryId as string,
    },
    {
      enabled: !!registryId,
    },
  );

  return (
    <Dialog
      open={!!data}
      onOpenChange={() => setProxyQuery({ registryId: null })}
    >
      {data && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{data?.title}</DialogTitle>
            <DialogDescription>{data?.description}</DialogDescription>
          </DialogHeader>
          <McpInstallForm entry={data as EntryGetParams} proxyId={proxyId} />
        </DialogContent>
      )}
    </Dialog>
  );
}
