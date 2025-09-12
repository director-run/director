"use client";

import { LayoutView, LayoutViewContent } from "@/components/layout/layout";
import { RegistryItemDetail } from "@/components/pages/registry-item-detail";
import { RegistryEntrySkeleton } from "@/components/registry/registry-entry-skeleton";
import { toast } from "@/components/ui/toast";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { trpc } from "@/state/client";
import { useRegistryQuery } from "@/state/use-registry-query";
import { registryQuerySerializer } from "@/state/use-registry-query";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RegistryEntryPage() {
  const router = useRouter();
  const { registryId } = useParams<{ registryId: string }>();
  const { toolId, serverId, setRegistryQuery } = useRegistryQuery();
  const [_, copy] = useCopyToClipboard();

  const [entryQuery, storeQuery] = trpc.useQueries((t) => [
    t.registry.getEntryByName({
      name: registryId,
    }),
    t.store.getAll(),
  ]);

  const utils = trpc.useUtils();

  const transportMutation = trpc.registry.getTransportForEntry.useMutation();

  const installMutation = trpc.store.addServer.useMutation({
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
      });
    },
    onSuccess: (data, variables) => {
      utils.store.get.invalidate({ proxyId: variables.proxyId });
      utils.store.getAll.invalidate();
      toast({
        title: "Proxy installed",
        description: "This proxy was successfully installed.",
      });
      router.push(`/${variables.proxyId}`);
    },
  });

  const isLoading = entryQuery.isLoading || storeQuery.isLoading;
  const entry = entryQuery.data;

  const handleInstall = async (values: {
    proxyId: string;
    parameters: Record<string, string>;
  }) => {
    if (!entry) {
      return;
    }

    const transport = await transportMutation.mutateAsync({
      entryName: entry.name,
      parameters: values.parameters,
    });
    installMutation.mutate({
      proxyId: values.proxyId,
      server: {
        name: entry.name,
        transport,
      },
    });
  };

  const handleCloseTool = () => {
    setRegistryQuery({ toolId: null, serverId });
  };

  useEffect(() => {
    if (!isLoading && !entry) {
      toast({
        title: "Library entry not found",
        description: "The library entry you are looking for does not exist.",
      });
      router.push("/library");
    }
  }, [entry, isLoading]);

  if (isLoading || !entry) {
    return <RegistryEntrySkeleton />;
  }

  const selectedTool = entry.tools?.find((tool) => tool.name === toolId);

  const proxiesWithMcp = (storeQuery.data ?? [])?.filter((proxy) =>
    proxy.servers.find((it) => {
      return it.name === entry.name;
    }),
  );

  const proxiesWithoutMcp = (storeQuery.data ?? [])?.filter(
    (proxy) =>
      !proxy.servers.find((it) => {
        return it.name === entry.name;
      }),
  );

  const toolLinks = (entry.tools ?? [])
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((tool) => ({
      title: tool.name,
      subtitle: tool.description?.replace(/\[([^\]]+)\]/g, ""),
      scroll: false,
      href: registryQuerySerializer({
        toolId: tool.name,
        serverId,
      }),
      onClick: () =>
        setRegistryQuery({
          toolId: tool.name,
          serverId,
        }),
    }));

  return (
    <LayoutView>
      <LayoutViewContent>
        <RegistryItemDetail
          entry={entry}
          proxiesWithMcp={proxiesWithMcp}
          proxiesWithoutMcp={proxiesWithoutMcp}
          selectedTool={selectedTool}
          defaultProxyId={serverId ?? undefined}
          serverId={serverId}
          onInstall={handleInstall}
          isInstalling={installMutation.isPending}
          onCloseTool={handleCloseTool}
          toolLinks={toolLinks}
          onProxyServerClick={(proxyId, serverName) =>
            router.push(`/${proxyId}/mcp/${serverName}`)
          }
          onLibraryClick={() => router.push("/library")}
          onMcpClick={(mcpId) => router.push(`/library/mcp/${mcpId}`)}
        />
      </LayoutViewContent>
    </LayoutView>
  );
}
