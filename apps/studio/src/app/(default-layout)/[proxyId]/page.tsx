"use client";

import { LayoutView, LayoutViewContent } from "@/components/layout/layout";
import { LayoutNavigation } from "@/components/layout/navigation";
import {
  MCPLinkCard,
  MCPLinkCardList,
} from "@/components/mcp-servers/mcp-link-card";
import { McpToolSheet } from "@/components/mcp-servers/mcp-tool-sheet";
import { McpToolsTable } from "@/components/mcp-servers/mcp-tools-table";
import { ProxyActionsDropdown } from "@/components/proxies/proxy-actions-dropdown";
import { ProxyInstallers } from "@/components/proxies/proxy-installers";
import { ProxyManualDialog } from "@/components/proxies/proxy-manual-dialog";
import { ProxySkeleton } from "@/components/proxies/proxy-skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionSeparator,
  SectionTitle,
} from "@/components/ui/section";
import { toast } from "@/components/ui/toast";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useProxy } from "@/hooks/use-proxy";
import { trpc } from "@/trpc/client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProxyPage() {
  const router = useRouter();
  const params = useParams<{ proxyId: string }>();
  const [_, copy] = useCopyToClipboard();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { proxy, isLoading } = useProxy(params.proxyId);
  const {
    data: servers,
    isLoading: serversLoading,
    error: serversError,
  } = trpc.store.getAll.useQuery();

  const utils = trpc.useUtils();

  const updateProxyMutation = trpc.store.update.useMutation({
    onSuccess: async () => {
      await utils.store.getAll.invalidate();
      await utils.store.get.invalidate({ proxyId: params.proxyId });
      toast({
        title: "Proxy updated",
        description: "This proxy was successfully updated.",
      });
      router.refresh();
      setSettingsOpen(false);
    },
  });

  const deleteProxyMutation = trpc.store.delete.useMutation({
    onSuccess: async () => {
      await utils.store.getAll.invalidate();
      toast({
        title: "Proxy deleted",
        description: "This proxy was successfully deleted.",
      });
      setDeleteOpen(false);
      router.push("/");
    },
  });

  const handleCopy = async (text: string) => {
    await copy(text);
    toast({
      title: "Copied to clipboard",
      description: "The endpoint has been copied to your clipboard.",
    });
  };

  const handleUpdateProxy = async (values: {
    name: string;
    description?: string;
  }) => {
    await updateProxyMutation.mutateAsync({
      proxyId: params.proxyId,
      attributes: values,
    });
  };

  const handleDeleteProxy = async () => {
    await deleteProxyMutation.mutateAsync({ proxyId: params.proxyId });
  };

  useEffect(() => {
    if (!isLoading && !proxy) {
      toast({
        title: "Proxy not found",
        description: "The proxy you are looking for does not exist.",
      });
      router.push("/");
    }
  }, [proxy, isLoading]);

  if (isLoading || !proxy) {
    return <ProxySkeleton />;
  }

  return (
    <LayoutView>
      <LayoutNavigation
        servers={servers}
        isLoading={serversLoading}
        error={serversError?.message}
      >
        <Breadcrumb className="grow">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>{proxy.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <ProxyActionsDropdown
          proxy={proxy}
          onUpdateProxy={handleUpdateProxy}
          onDeleteProxy={handleDeleteProxy}
          isUpdating={updateProxyMutation.isPending}
          settingsOpen={settingsOpen}
          onSettingsOpenChange={setSettingsOpen}
          deleteOpen={deleteOpen}
          onDeleteOpenChange={setDeleteOpen}
        />
      </LayoutNavigation>

      <LayoutViewContent>
        <Container size="lg">
          <Section>
            <SectionHeader>
              <SectionTitle>{proxy.name}</SectionTitle>
              <SectionDescription>{proxy.description}</SectionDescription>
            </SectionHeader>
          </Section>

          <SectionSeparator />

          <Section>
            <SectionHeader className="flex flex-row items-center justify-between">
              <SectionTitle variant="h2" asChild>
                <h2>Clients</h2>
              </SectionTitle>
              <ProxyManualDialog proxyId={proxy.id} onCopy={handleCopy}>
                <Button size="sm">Connect manually</Button>
              </ProxyManualDialog>
            </SectionHeader>
            <ProxyInstallers proxyId={proxy.id} />
          </Section>

          <SectionSeparator />

          <Section>
            <SectionHeader className="flex flex-row items-center justify-between">
              <SectionTitle variant="h2" asChild>
                <h2>MCP Servers</h2>
              </SectionTitle>
              <Button size="sm" asChild>
                <Link href="/library">Add MCP server</Link>
              </Button>
            </SectionHeader>
            <MCPLinkCardList>
              {proxy.servers.map((it) => {
                return (
                  <MCPLinkCard
                    key={it.name}
                    entry={{
                      title: it.name,
                      description: null,
                      icon: null,
                      isOfficial: false,
                    }}
                    href={`/${proxy.id}/mcp/${it.name}`}
                  />
                );
              })}
            </MCPLinkCardList>
          </Section>

          <SectionSeparator />

          <Section>
            <SectionHeader>
              <SectionTitle variant="h2" asChild>
                <h2>Tools</h2>
              </SectionTitle>
            </SectionHeader>
            <McpToolsTable proxyId={proxy.id} />
          </Section>
        </Container>
      </LayoutViewContent>

      <McpToolSheet proxyId={proxy.id} />
    </LayoutView>
  );
}
