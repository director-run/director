import { GetStartedCompleteDialog } from "@director.run/design/components/get-started/get-started-complete-dialog.tsx";
import { GetStartedInstallServerDialog } from "@director.run/design/components/get-started/get-started-install-server-dialog.tsx";
import { GetStartedPageView } from "@director.run/design/components/pages/get-started.tsx";
import { mockClients } from "@director.run/design/test/fixtures/playbook/clients.ts";
import { mockRegistryEntryList } from "@director.run/design/test/fixtures/registry/entry-list.ts";
import { mockRegistryEntry } from "@director.run/design/test/fixtures/registry/entry.ts";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const meta = {
  title: "pages/onboarding",
  component: GetStartedPageView,
  parameters: { layout: "fullscreen" },
  //   decorators: [withLayoutView],
  render: (args) => <StatefulPage {...args} />,
  args: {
    currentPlaybook: null,
    registryEntries: [],
    clientStatuses: [],
    isAddingPlaybookToClient: false,
    isCreatePlaybookLoading: false,
    searchQuery: "",
    onSearchQueryChange: () => {},
    onClickRegistryEntry: () => {},
    onAddPlaybookToClient: () => {},
    // Accept any since storybook args typing requires this prop
    onCreatePlaybook: async () => {},
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
      onAddPlaybookToClient={() => {}}
      onCreatePlaybook={async () => {}}
    />
  );
}

// step 1a: new playbook
export const Step1a_NewPlaybook: Story = {
  args: {
    currentPlaybook: null,
    registryEntries: [],
    clientStatuses: mockClients,
    isAddingPlaybookToClient: false,
    isCreatePlaybookLoading: false,
  },
};

// step 1b: new playbook loading
export const Step1b_NewPlaybookLoading: Story = {
  args: {
    currentPlaybook: null,
    registryEntries: [],
    clientStatuses: mockClients,
    isAddingPlaybookToClient: false,
    isCreatePlaybookLoading: true,
  },
};

// step 2a: registry entry list (playbook created, no servers yet)
export const Step2a_RegistryEntryList: Story = {
  args: {
    currentPlaybook: { id: "playbook-1", servers: [] },
    registryEntries: mockRegistryEntryList,
    clientStatuses: mockClients,
    isAddingPlaybookToClient: false,
    isCreatePlaybookLoading: false,
  },
};

// step 2b: registry entry detail (dialog open)
export const Step2b_RegistryEntryDetail: Story = {
  args: {
    currentPlaybook: { id: "playbook-1", servers: [] },
    registryEntries: mockRegistryEntryList,
    clientStatuses: mockClients,
    isAddingPlaybookToClient: false,
    isCreatePlaybookLoading: false,
  },
  render: (args) => {
    const [open, setOpen] = useState(true);
    return (
      <>
        <StatefulPage {...args} />
        <GetStartedInstallServerDialog
          registryEntry={mockRegistryEntry}
          playbooks={[]}
          onClickInstall={async () => {}}
          isInstalling={false}
          open={open}
          onOpenChange={setOpen}
        />
      </>
    );
  },
};

// step 3: client installers (playbook with a server)
export const Step3_ClientInstallers: Story = {
  args: {
    currentPlaybook: { id: "playbook-1", servers: [{ name: "github-mcp" }] },
    registryEntries: mockRegistryEntryList,
    clientStatuses: mockClients,
    isAddingPlaybookToClient: false,
    isCreatePlaybookLoading: false,
  },
};

// step 3b: client install loading
export const Step3b_ClientInstallLoading: Story = {
  args: {
    currentPlaybook: { id: "playbook-1", servers: [{ name: "github-mcp" }] },
    registryEntries: mockRegistryEntryList,
    clientStatuses: mockClients,
    isAddingPlaybookToClient: true,
    isCreatePlaybookLoading: false,
  },
};

// step 4: final dialog
export const Step4_CompleteDialog: Story = {
  args: {},
  render: () => (
    <GetStartedCompleteDialog
      open
      onClickLibrary={() => {}}
      onClickPlaybook={() => {}}
    />
  ),
};
