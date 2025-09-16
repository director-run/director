import { GetStartedCompleteDialog } from "@director.run/studio/components/get-started/get-started-complete-dialog.tsx";
import { GetStartedInstallServerDialog } from "@director.run/studio/components/get-started/get-started-install-server-dialog.tsx";
import { GetStartedPageView } from "@director.run/studio/components/pages/get-started.tsx";
import type {
  RegistryGetEntriesEntry,
  RegistryGetEntryByName,
} from "@director.run/studio/components/types.ts";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { withLayoutView } from "../../helpers/decorators";

const meta = {
  title: "pages/get-started",
  component: GetStartedPageView,
  parameters: { layout: "fullscreen" },
  decorators: [withLayoutView],
} satisfies Meta<typeof GetStartedPageView>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mocks
const mockRegistryEntries: RegistryGetEntriesEntry[] = [
  {
    id: "github-mcp",
    name: "github-mcp",
    title: "GitHub MCP",
    description: "Access GitHub repositories and issues via MCP.",
    icon: "/icons/github.svg",
    tools: [
      {
        name: "search_repositories",
        description: "Search repositories",
        inputSchema: { type: "object" },
      },
    ],
    transport: { type: "http" },
    homepage: "https://example.com",
    isOfficial: true,
    parameters: [
      { name: "token", description: "GitHub token", required: true },
    ],
  },
  {
    id: "filesystem-mcp",
    name: "filesystem-mcp",
    title: "Filesystem MCP",
    description: "Interact with local files.",
    icon: "/icons/ghost.png",
    tools: [],
    transport: { type: "stdio" },
    homepage: undefined,
    isOfficial: false,
    parameters: [],
  },
];

const mockRegistryEntryDetail: RegistryGetEntryByName = {
  ...mockRegistryEntries[0],
  readme: "# GitHub MCP\nSome documentation...",
  tools: mockRegistryEntries[0].tools,
};

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
  render: () => (
    <StatefulPage
      currentProxy={null}
      registryEntries={[]}
      clientStatuses={mockClientStatuses}
      isInstallingClient={false}
      createProxyIsPending={false}
    />
  ),
};

// step 1b: new proxy loading
export const Step1b_NewProxyLoading: Story = {
  render: () => (
    <StatefulPage
      currentProxy={null}
      registryEntries={[]}
      clientStatuses={mockClientStatuses}
      isInstallingClient={false}
      createProxyIsPending={true}
    />
  ),
};

// step 2a: registry entry list (proxy created, no servers yet)
export const Step2a_RegistryEntryList: Story = {
  render: () => (
    <StatefulPage
      currentProxy={{ id: "proxy-1", servers: [] }}
      registryEntries={mockRegistryEntries}
      clientStatuses={mockClientStatuses}
      isInstallingClient={false}
      createProxyIsPending={false}
    />
  ),
};

// step 2b: registry entry detail (dialog open)
export const Step2b_RegistryEntryDetail: Story = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <>
        <StatefulPage
          currentProxy={{ id: "proxy-1", servers: [] }}
          registryEntries={mockRegistryEntries}
          clientStatuses={mockClientStatuses}
          isInstallingClient={false}
          createProxyIsPending={false}
        />
        <GetStartedInstallServerDialog
          registryEntry={mockRegistryEntryDetail}
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
  render: () => (
    <StatefulPage
      currentProxy={{ id: "proxy-1", servers: [{ name: "github-mcp" }] }}
      registryEntries={mockRegistryEntries}
      clientStatuses={mockClientStatuses}
      isInstallingClient={false}
      createProxyIsPending={false}
    />
  ),
};

// step 3b: client install loading
export const Step3b_ClientInstallLoading: Story = {
  render: () => (
    <StatefulPage
      currentProxy={{ id: "proxy-1", servers: [{ name: "github-mcp" }] }}
      registryEntries={mockRegistryEntries}
      clientStatuses={mockClientStatuses}
      isInstallingClient={true}
      createProxyIsPending={false}
    />
  ),
};

// step 4: final dialog
export const Step4_CompleteDialog: Story = {
  render: () => <GetStartedCompleteDialog open />,
};
