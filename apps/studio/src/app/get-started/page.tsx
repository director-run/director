"use client";

import { GetStartedCompleteDialog } from "@/components/get-started/get-started-complete-dialog";
import { GetStartedInstallServerDialog } from "@/components/get-started/get-started-install-server-dialog";
import { GetStartedInstallers } from "@/components/get-started/get-started-installers";
import {
  GetStartedList,
  GetStartedListItem,
} from "@/components/get-started/get-started-list";
import { GetStartedProxyForm } from "@/components/get-started/get-started-proxy-form";
import { McpLogo } from "@/components/mcp-logo";

import { Container } from "@/components/ui/container";
import { EmptyState, EmptyStateTitle } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  ListItemDescription,
  ListItemDetails,
  ListItemTitle,
} from "@/components/ui/list";
import { Logo } from "@/components/ui/logo";
import {
  Section,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from "@/components/ui/section";
import { trpc } from "@/trpc/client";
import { EntryGetParams } from "@director.run/registry/db/schema";
import { useEffect, useState } from "react";

export default function GetStartedPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentProxyId, setCurrentProxyId] = useState<string | null>(null);
  const [proxyListQuery, registryEntriesQuery] = trpc.useQueries((t) => [
    t.store.getAll(),
    t.registry.getEntries({
      pageIndex: 0,
      pageSize: 1000,
    }),
  ]);

  const installersQuery = trpc.installer.byProxy.list.useQuery(
    {
      proxyId: currentProxyId as string,
    },
    {
      enabled: !!currentProxyId,
    },
  );

  const isLoading = proxyListQuery.isLoading || registryEntriesQuery.isLoading;
  const hasData = proxyListQuery.data && registryEntriesQuery.data;

  useEffect(() => {
    if (proxyListQuery.data && proxyListQuery.data.length === 1) {
      setCurrentProxyId(proxyListQuery.data[0].id);
    }
  }, [proxyListQuery.data]);

  const hasProxy = proxyListQuery.data && proxyListQuery.data.length > 0;
  const currentProxy = hasProxy ? proxyListQuery.data[0] : null;

  if (
    isLoading ||
    !hasData ||
    (currentProxy && installersQuery.isLoading && !installersQuery.isFetched)
  ) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Logo className="size-10 animate-pulse" />
      </div>
    );
  }

  const installers = installersQuery.data ?? {};

  const isInstalled = !!Object.values(installers).filter((it) => Boolean(it))
    .length;

  const createStepStatus = hasProxy ? "completed" : "in-progress";
  const addStepStatus = !currentProxy
    ? "not-started"
    : currentProxy.servers.length > 0
      ? "completed"
      : "in-progress";
  const connectStepStatus = isInstalled
    ? "completed"
    : addStepStatus === "completed" && installersQuery.isFetched
      ? "in-progress"
      : "not-started";

  const isCompleted =
    createStepStatus === "completed" &&
    addStepStatus === "completed" &&
    connectStepStatus === "completed";

  const filteredEntries = registryEntriesQuery.data.entries.filter((entry) => {
    const query = searchQuery.toLowerCase();
    return (
      entry.title.toLowerCase().includes(query) ||
      entry.description.toLowerCase().includes(query)
    );
  });

  return (
    <Container size="sm" className="py-12 lg:py-16">
      <Section className="gap-y-8">
        <Logo className="mx-auto" />
        <SectionHeader className="items-center gap-y-1.5 text-center">
          <SectionTitle className="font-medium text-2xl">
            Get started
          </SectionTitle>
          <SectionDescription className="text-base">
            Let&apos;s get your started with MCP using Director.
          </SectionDescription>
        </SectionHeader>

        <GetStartedList>
          <GetStartedListItem
            status={createStepStatus}
            title="Create an MCP Proxy Server"
            disabled={hasProxy}
            open={createStepStatus === "in-progress"}
          >
            <div className="py-4 pr-4 pl-11.5">
              <GetStartedProxyForm />
            </div>
          </GetStartedListItem>
          <GetStartedListItem
            status={addStepStatus}
            title="Add your first MCP server"
            open={addStepStatus === "in-progress"}
            disabled={addStepStatus !== "in-progress"}
          >
            <div className="relative z-10 px-2 pt-2">
              <Input
                type="text"
                placeholder="Search MCP servers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="grid max-h-[320px] grid-cols-1 gap-1 overflow-y-auto p-2">
              {filteredEntries
                .sort((a, b) => a.title.localeCompare(b.title))
                .map((it) => {
                  return (
                    <GetStartedInstallServerDialog
                      key={it.id}
                      mcp={it as EntryGetParams}
                      proxyId={currentProxy ? currentProxy.id : ""}
                    >
                      <div className="flex flex-row items-center gap-x-3 rounded-lg bg-accent-subtle/60 px-2.5 py-1.5 hover:bg-accent">
                        <McpLogo icon={it.icon} />
                        <ListItemDetails>
                          <ListItemTitle>{it.title}</ListItemTitle>
                          <ListItemDescription>
                            {it.description}
                          </ListItemDescription>
                        </ListItemDetails>
                      </div>
                    </GetStartedInstallServerDialog>
                  );
                })}

              {filteredEntries.length === 0 && (
                <EmptyState className="bg-accent-subtle/60">
                  <EmptyStateTitle>No MCP servers found</EmptyStateTitle>
                </EmptyState>
              )}
            </div>
          </GetStartedListItem>
          <GetStartedListItem
            status={connectStepStatus}
            title="Connect your first client"
            open={connectStepStatus === "in-progress"}
            disabled={connectStepStatus !== "in-progress"}
          >
            <GetStartedInstallers proxyId={currentProxy?.id ?? ""} />
          </GetStartedListItem>
        </GetStartedList>
      </Section>

      <GetStartedCompleteDialog open={isCompleted} />
    </Container>
  );
}
