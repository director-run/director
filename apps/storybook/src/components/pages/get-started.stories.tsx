import { GetStartedCompleteDialog } from "@director.run/studio/components/get-started/get-started-complete-dialog.tsx";
import { GetStartedInstallServerDialog } from "@director.run/studio/components/get-started/get-started-install-server-dialog.tsx";
import { GetStartedPageView } from "@director.run/studio/components/pages/get-started.tsx";
import { mockRegistryEntryList } from "@director.run/studio/test/fixtures/registry/entry-list.ts";
import { mockRegistryEntry } from "@director.run/studio/test/fixtures/registry/entry.ts";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const meta = {
  title: "pages/get-started",
  component: GetStartedPageView,
  parameters: { layout: "fullscreen" },
  //   decorators: [withLayoutView],
  render: (args) => <StatefulPage {...args} />,
  args: {
    currentProxy: null,
    registryEntries: [],
    clientStatuses: [],
    isInstallingClient: false,
    createProxyIsPending: false,
    searchQuery: "",
    onSearchQueryChange: () => {},
    onMcpSelect: () => {},
    onInstallClient: () => {},
    // Accept any since storybook args typing requires this prop
    onCreateProxy: async () => {},
  },
} satisfies Meta<typeof GetStartedPageView>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockClientStatuses = [
  { name: "claude", installed: true, configExists: true, configPath: "" },
  { name: "cursor", installed: false, configExists: false, configPath: "" },
  { name: "vscode", installed: true, configExists: true, configPath: "" },
];

// Helper render that provides local state for search
function StatefulPage(args: React.ComponentProps<typeof GetStartedPageView>) {
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <GetStartedPageView
      {...args}
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      onMcpSelect={() => {}}
      onInstallClient={() => {}}
      onCreateProxy={async () => {}}
    />
  );
}

// step 1a: new proxy
export const Step1a_NewProxy: Story = {
  args: {
    currentProxy: null,
    registryEntries: [],
    clientStatuses: mockClientStatuses,
    isInstallingClient: false,
    createProxyIsPending: false,
  },
};

// step 1b: new proxy loading
export const Step1b_NewProxyLoading: Story = {
  args: {
    currentProxy: null,
    registryEntries: [],
    clientStatuses: mockClientStatuses,
    isInstallingClient: false,
    createProxyIsPending: true,
  },
};

// step 2a: registry entry list (proxy created, no servers yet)
export const Step2a_RegistryEntryList: Story = {
  args: {
    currentProxy: { id: "proxy-1", servers: [] },
    registryEntries: mockRegistryEntryList,
    clientStatuses: mockClientStatuses,
    isInstallingClient: false,
    createProxyIsPending: false,
  },
};

// step 2b: registry entry detail (dialog open)
export const Step2b_RegistryEntryDetail: Story = {
  args: {
    currentProxy: { id: "proxy-1", servers: [] },
    registryEntries: mockRegistryEntryList,
    clientStatuses: mockClientStatuses,
    isInstallingClient: false,
    createProxyIsPending: false,
  },
  render: (args) => {
    const [open, setOpen] = useState(true);
    return (
      <>
        <StatefulPage {...args} />
        <GetStartedInstallServerDialog
          registryEntry={mockRegistryEntry}
          isRegistryEntryLoading={false}
          onClickInstall={() => {}}
          isInstalling={false}
          open={open}
          onClickClose={() => setOpen(false)}
        />
      </>
    );
  },
};

// step 3: client installers (proxy with a server)
export const Step3_ClientInstallers: Story = {
  args: {
    currentProxy: { id: "proxy-1", servers: [{ name: "github-mcp" }] },
    registryEntries: mockRegistryEntryList,
    clientStatuses: mockClientStatuses,
    isInstallingClient: false,
    createProxyIsPending: false,
  },
};

// step 3b: client install loading
export const Step3b_ClientInstallLoading: Story = {
  args: {
    currentProxy: { id: "proxy-1", servers: [{ name: "github-mcp" }] },
    registryEntries: mockRegistryEntryList,
    clientStatuses: mockClientStatuses,
    isInstallingClient: true,
    createProxyIsPending: false,
  },
};

// step 4: final dialog
export const Step4_CompleteDialog: Story = {
  args: {},
  render: () => <GetStartedCompleteDialog open />,
};
