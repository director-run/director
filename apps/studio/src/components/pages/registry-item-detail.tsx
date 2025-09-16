import { RegistryItem } from "../registry-item";
import { RegistryItemAddForm } from "../registry-item-add-form";
import { SplitView, SplitViewMain, SplitViewSide } from "../split-view";
import type { MasterRegistryEntry, StoreGetAll } from "../types";
import { Container } from "../ui/container";

interface RegistryItemDetailProps {
  entry: MasterRegistryEntry;
  proxies?: StoreGetAll;
  entryInstalledOn?: string[];
  onClickInstall: (params: {
    proxyId?: string;
    entryId: string;
    parameters?: Record<string, string>;
  }) => Promise<void>;
  isInstalling?: boolean;
  onToolClick?: (
    tool: NonNullable<MasterRegistryEntry["tools"]>[number],
  ) => void;
  onProxyServerClick?: (proxyId: string, serverName: string) => void;
}

export function RegistryItemDetail({
  entry,
  proxies,
  entryInstalledOn = [],
  onClickInstall,
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
              proxies={proxies}
              entryInstalledOn={entryInstalledOn}
              onClickInstall={onClickInstall}
              isInstalling={isInstalling}
            />
          </SplitViewSide>
        </SplitView>
      </Container>
    </>
  );
}
