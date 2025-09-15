import { RegistryItemDetail } from "@director.run/studio/components/pages/registry-item-detail.tsx";
import { mockRegistryEntry } from "@director.run/studio/test/fixtures/registry/entry.ts";
import "./fonts.css";
import "./globals.css";

export const KitchenSink = () => {
  return (
    <RegistryItemDetail
      entry={mockRegistryEntry}
      proxiesWithMcp={[]}
      proxiesWithoutMcp={[]}
      serverId={null}
      onInstall={async () => {}}
      onCloseTool={() => {}}
      toolLinks={[]}
    />
  );
};
