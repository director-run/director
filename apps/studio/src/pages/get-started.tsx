// import { ConfiguratorTarget } from "@director.run/client-configurator/index";
import { GetStartedCompleteDialog } from "@director.run/design/components/get-started/get-started-complete-dialog.tsx";
import { GetStartedInstallServerDialog } from "@director.run/design/components/get-started/get-started-install-server-dialog.tsx";
import type { FormValues as ProxyFormValues } from "@director.run/design/components/get-started/get-started-proxy-form.tsx";
import { GetStartedPageView } from "@director.run/design/components/pages/get-started.tsx";
import { FullScreenLoader } from "@director.run/design/components/pages/global/loader.tsx";
import { ConfiguratorTarget } from "@director.run/design/components/types.ts";
import { toast } from "@director.run/design/components/ui/toast.tsx";
import { useEffect, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { GATEWAY_URL } from "../config.ts";
import { gatewayClient as trpc } from "../contexts/backend-context.tsx";
import { useClients } from "../hooks/use-clients.ts";
import { useInstallServerFromRegistry } from "../hooks/use-install-server-from-registry.ts";
import { useOnboardingProgress } from "../hooks/use-onboarding-progress.ts";
import { useRegistryEntries } from "../hooks/use-registry-entries.ts";
import { useWorkspaces } from "../hooks/use-workspaces.ts";

export type ClientId = "claude" | "cursor" | "vscode";

export function GetStartedPage() {
  const navigate = useNavigate();
  // Search and proxy state
  const [searchQuery, setSearchQuery] = useState("");
  const [currentProxyId, setCurrentProxyId] = useState<string | null>(null);

  // Installer state
  const [selectedRegistryEntryName, setSelectedRegistryEntryName] = useState<
    string | null
  >(null);
  const [isInstallDialogOpen, setIsInstallDialogOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const { setInProgress } = useOnboardingProgress();

  // When this page renders, set onboarding to true
  useEffect(() => {
    setInProgress(true);
  }, [setInProgress]);

  // When process completes, set onboarding to false
  useEffect(() => {
    if (isCompleted) {
      setInProgress(false);
    }
  }, [isCompleted, setInProgress]);

  const utils = trpc.useUtils();

  const proxyListQuery = useWorkspaces();
  const registryEntriesQuery = useRegistryEntries({
    pageIndex: 0,
    pageSize: 20,
    searchQuery,
  });

  const listClientsQuery = useClients(currentProxyId as string);

  const entryQuery = trpc.registry.getEntryByName.useQuery(
    {
      name: selectedRegistryEntryName || "",
    },
    {
      enabled: !!selectedRegistryEntryName && isInstallDialogOpen,
    },
  );

  const createProxyMutation = trpc.store.create.useMutation({
    onSuccess: async () => {
      await utils.store.getAll.refetch();
      toast({
        title: "Proxy created",
        description: "This proxy was successfully created.",
      });
    },
  });

  const installationMutation = trpc.installer.byProxy.install.useMutation({
    onSuccess: () => {
      utils.installer.byProxy.list.invalidate();
      toast({
        title: "Proxy installed",
        description: `This proxy was successfully installed`,
      });
      setIsCompleted(true);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
      });
    },
  });

  const { install, isPending: isInstalling } = useInstallServerFromRegistry({
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
      });
    },
    onSuccess: (_data) => {
      utils.store.getAll.invalidate();
      toast({
        title: "Proxy installed",
        description: "This proxy was successfully installed.",
      });
      setIsInstallDialogOpen(false);
    },
  });

  useEffect(() => {
    if (proxyListQuery.data && proxyListQuery.data.length === 1) {
      setCurrentProxyId(proxyListQuery.data[0].id);
    }
  }, [proxyListQuery.data]);

  // Derived state
  const hasData = proxyListQuery.data && registryEntriesQuery.data;
  const hasProxy = proxyListQuery.data && proxyListQuery.data.length > 0;
  const currentProxy = hasProxy ? proxyListQuery.data[0] : null;

  // Event handlers
  const handleProxySubmit: SubmitHandler<ProxyFormValues> = async (values) => {
    await createProxyMutation.mutateAsync({ ...values, servers: [] });
  };

  const handleClientInstall = (client: string) => {
    if (!currentProxy?.id) {
      return;
    }
    installationMutation.mutate({
      proxyId: currentProxy.id,
      client: client as ConfiguratorTarget,
      baseUrl: GATEWAY_URL,
    });
  };

  const handleMcpSelect = (entry: { name: string }) => {
    setSelectedRegistryEntryName(entry.name);
    setIsInstallDialogOpen(true);
  };

  const handleMcpFormSubmit = async (values: {
    proxyId?: string;
    entryId: string;
    parameters?: Record<string, string>;
  }) => {
    if (!selectedRegistryEntryName || !values.proxyId) {
      return;
    }

    await install({
      proxyId: values.proxyId,
      entryName: selectedRegistryEntryName,
      parameters: values.parameters ?? {},
    });
  };

  if (!hasData) {
    return <FullScreenLoader />;
  }

  return (
    <>
      <GetStartedPageView
        currentWorkspace={currentProxy}
        registryEntries={registryEntriesQuery.data?.entries ?? []}
        clientStatuses={listClientsQuery.data ?? []}
        isAddingWorkspaceToClient={installationMutation.isPending}
        isCreateWorkspaceLoading={createProxyMutation.isPending}
        onCreateWorkspace={handleProxySubmit}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onClickRegistryEntry={handleMcpSelect}
        onAddWorkspaceToClient={handleClientInstall}
      />

      {selectedRegistryEntryName && (
        <GetStartedInstallServerDialog
          registryEntry={entryQuery.data}
          proxies={proxyListQuery.data}
          onClickInstall={handleMcpFormSubmit}
          isInstalling={isInstalling}
          open={isInstallDialogOpen}
          onOpenChange={setIsInstallDialogOpen}
        />
      )}

      <GetStartedCompleteDialog
        open={isCompleted}
        onClickLibrary={() => navigate("/library")}
        onClickWorkspace={() => navigate("/")}
      />
    </>
  );
}
