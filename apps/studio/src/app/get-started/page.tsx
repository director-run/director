"use client";

import { GetStartedInstallServerDialog } from "@/components/get-started/get-started-install-server-dialog";
import { GetStartedInstallers } from "@/components/get-started/get-started-installers";
import {
  GetStartedList,
  GetStartedListItem,
} from "@/components/get-started/get-started-list";
import { GetStartedProxyForm } from "@/components/get-started/get-started-proxy-form";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Container } from "@/components/ui/container";
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
import Link from "next/link";
import { useEffect, useState } from "react";

export default function GetStartedPage() {
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

  if (isLoading || !hasData) {
    return <div>Loading...</div>;
  }

  if (proxyListQuery.data.length > 1) {
    // TODO: Redirect home
    return <div>Loading…</div>;
  }

  const installers = installersQuery.data ?? {};

  const hasProxy = proxyListQuery.data.length > 0;
  const currentProxy = hasProxy ? proxyListQuery.data[0] : null;
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
            title="Add an MCP server"
            open={addStepStatus === "in-progress"}
            disabled={addStepStatus !== "in-progress"}
          >
            <div className="grid max-h-[320px] grid-cols-1 gap-1 overflow-y-auto p-2">
              {registryEntriesQuery.data.entries
                .sort((a, b) => a.title.localeCompare(b.title))
                .map((it) => {
                  return (
                    <GetStartedInstallServerDialog
                      key={it.id}
                      mcp={it as EntryGetParams}
                      proxyId={currentProxy ? currentProxy.id : ""}
                    >
                      <div className="rounded-lg bg-accent-subtle/60 px-2.5 py-1.5 hover:bg-accent">
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
            </div>
          </GetStartedListItem>
          <GetStartedListItem
            status={connectStepStatus}
            title="Connect a client"
            open={connectStepStatus === "in-progress"}
            disabled={connectStepStatus !== "in-progress"}
          >
            <GetStartedInstallers proxyId={currentProxy?.id ?? ""} />
          </GetStartedListItem>
        </GetStartedList>
      </Section>

      <AlertDialog open={isCompleted}>
        <AlertDialogContent>
          <AlertDialogHeader className="gap-y-0.5">
            <AlertDialogTitle className="text-xl">
              You&apos;re all set!
            </AlertDialogTitle>
            <AlertDialogDescription>
              Why not try calling your new MCP server from the installed client?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col gap-1 border-accent border-t-[0.5px] px-5 py-3">
            <h3>Next steps</h3>

            <Link href="/library">Discover more MCP servers</Link>
            <Link href="https://docs.director.run">
              Explore our documentation
            </Link>
            <Link href="/">Continue to your proxy</Link>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Container>
  );
}
