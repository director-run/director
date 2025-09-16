import { RegistryItem } from "../registry-item";
import { RegistryItemAddForm } from "../registry-item-add-form";
import { SplitView, SplitViewMain, SplitViewSide } from "../split-view";
import type { MasterRegistryEntry, StoreGetAll } from "../types";
import { Container } from "../ui/container";

interface RegistryItemDetailProps {
  entry: MasterRegistryEntry;
  proxiesWithMcp: StoreGetAll;
  proxiesWithoutMcp: StoreGetAll;
  defaultProxyId?: string;
  serverId: string | null;
  onInstall: (values: {
    proxyId: string;
    parameters: Record<string, string>;
  }) => Promise<void>;
  isInstalling?: boolean;
  onToolClick?: (
    tool: NonNullable<MasterRegistryEntry["tools"]>[number],
  ) => void;
  onProxyServerClick?: (proxyId: string, serverName: string) => void;
}

export function RegistryItemDetail({
  entry,
  proxiesWithMcp,
  proxiesWithoutMcp,
  defaultProxyId,
  serverId,
  onInstall,
  isInstalling = false,
  onToolClick,
  onProxyServerClick,
}: RegistryItemDetailProps) {
  return (
    <>
      <Container size="xl">
        <SplitView>
          <SplitViewMain>
            <RegistryItem entry={entry} onToolClick={onToolClick} />
          </SplitViewMain>
          <SplitViewSide>
            <RegistryItemAddForm
              entry={entry}
              proxiesWithMcp={proxiesWithMcp}
              proxiesWithoutMcp={proxiesWithoutMcp}
              defaultProxyId={defaultProxyId}
              onInstall={onInstall}
              isInstalling={isInstalling}
            />
          </SplitViewSide>
        </SplitView>
      </Container>
    </>
  );
}
