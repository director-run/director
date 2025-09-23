import { GetStartedCompleteDialog } from "@director.run/studio/components/get-started/get-started-complete-dialog.tsx";
import { GetStartedInstallServerDialog } from "@director.run/studio/components/get-started/get-started-install-server-dialog.tsx";
import { GetStartedPageView } from "@director.run/studio/components/pages/get-started.tsx";
import { mockRegistryEntryList } from "@director.run/studio/test/fixtures/registry/entry-list.ts";
import { mockRegistryEntry } from "@director.run/studio/test/fixtures/registry/entry.ts";
import { mockClients } from "@director.run/studio/test/fixtures/workspace/clients.ts";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const meta = {
  title: "pages/onboarding",
  component: GetStartedPageView,
  parameters: { layout: "fullscreen" },
  //   decorators: [withLayoutView],
  render: (args) => <StatefulPage {...args} />,
  args: {
    currentWorkspace: null,
    registryEntries: [],
    clientStatuses: [],
    isAddingWorkspaceToClient: false,
    isCreateWorkspaceLoading: false,
    searchQuery: "",
    onSearchQueryChange: () => {},
    onClickRegistryEntry: () => {},
    onAddWorkspaceToClient: () => {},
    // Accept any since storybook args typing requires this prop
    onCreateWorkspace: async () => {},
  },
} satisfies Meta<typeof GetStartedPageView>;

export default meta;
type Story = StoryObj<typeof meta>;

// Helper render that provides local state for search
function StatefulPage(args: React.ComponentProps<typeof GetStartedPageView>) {
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <GetStartedPageView
      {...args}
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      onClickRegistryEntry={() => {}}
      onAddWorkspaceToClient={() => {}}
      onCreateWorkspace={async () => {}}
    />
  );
}

// step 1a: new proxy
export const Step1a_NewProxy: Story = {
  args: {
    currentWorkspace: null,
    registryEntries: [],
    clientStatuses: mockClients,
    isAddingWorkspaceToClient: false,
    isCreateWorkspaceLoading: false,
  },
};

// step 1b: new proxy loading
export const Step1b_NewProxyLoading: Story = {
  args: {
    currentWorkspace: null,
    registryEntries: [],
    clientStatuses: mockClients,
    isAddingWorkspaceToClient: false,
    isCreateWorkspaceLoading: true,
  },
};

// step 2a: registry entry list (proxy created, no servers yet)
export const Step2a_RegistryEntryList: Story = {
  args: {
    currentWorkspace: { id: "proxy-1", servers: [] },
    registryEntries: mockRegistryEntryList,
    clientStatuses: mockClients,
    isAddingWorkspaceToClient: false,
    isCreateWorkspaceLoading: false,
  },
};

// step 2b: registry entry detail (dialog open)
export const Step2b_RegistryEntryDetail: Story = {
  args: {
    currentWorkspace: { id: "proxy-1", servers: [] },
    registryEntries: mockRegistryEntryList,
    clientStatuses: mockClients,
    isAddingWorkspaceToClient: false,
    isCreateWorkspaceLoading: false,
  },
  render: (args) => {
    const [open, setOpen] = useState(true);
    return (
      <>
        <StatefulPage {...args} />
        <GetStartedInstallServerDialog
          registryEntry={mockRegistryEntry}
          isRegistryEntryLoading={false}
          proxies={[]}
          onClickInstall={async () => {}}
          isInstalling={false}
          open={open}
          onOpenChange={setOpen}
        />
      </>
    );
  },
};

// step 3: client installers (proxy with a server)
export const Step3_ClientInstallers: Story = {
  args: {
    currentWorkspace: { id: "proxy-1", servers: [{ name: "github-mcp" }] },
    registryEntries: mockRegistryEntryList,
    clientStatuses: mockClients,
    isAddingWorkspaceToClient: false,
    isCreateWorkspaceLoading: false,
  },
};

// step 3b: client install loading
export const Step3b_ClientInstallLoading: Story = {
  args: {
    currentWorkspace: { id: "proxy-1", servers: [{ name: "github-mcp" }] },
    registryEntries: mockRegistryEntryList,
    clientStatuses: mockClients,
    isAddingWorkspaceToClient: true,
    isCreateWorkspaceLoading: false,
  },
};

// step 4: final dialog
export const Step4_CompleteDialog: Story = {
  args: {},
  render: () => (
    <GetStartedCompleteDialog
      open
      onClickLibrary={() => {}}
      onClickWorkspace={() => {}}
    />
  ),
};
