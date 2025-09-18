import { RegistryDetailSidebar } from "@director.run/studio/components/registry-detail-sidebar.tsx";
import { RegistryItem } from "@director.run/studio/components/registry-item.tsx";
import {
  SplitView,
  SplitViewMain,
  SplitViewSide,
} from "@director.run/studio/components/split-view.tsx";
import { Container } from "@director.run/studio/components/ui/container.tsx";
import { mockRegistryEntry } from "@director.run/studio/test/fixtures/registry/entry.ts";

export const WorkspaceDetailPage = () => {
  return (
    <Container size="xl">
      <SplitView>
        <SplitViewMain>
          <RegistryItem entry={mockRegistryEntry} />
        </SplitViewMain>
        <SplitViewSide>
          <RegistryDetailSidebar
            entry={mockRegistryEntry}
            proxies={[]}
            entryInstalledOn={[]}
            onClickInstall={async () => {}}
            isInstalling={false}
          />
        </SplitViewSide>
      </SplitView>
    </Container>
  );
};
