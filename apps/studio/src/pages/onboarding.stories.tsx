import { GetStartedCompleteDialog } from "@director.run/design/components/get-started/get-started-complete-dialog.tsx";
import { GetStartedInstallServerDialog } from "@director.run/design/components/get-started/get-started-install-server-dialog.tsx";
import { GetStartedPageView } from "@director.run/design/components/pages/get-started.tsx";
import type { ConnectionInfo } from "@director.run/design/components/playbooks-clients/playbook-section-connect.tsx";
import { mockRegistryEntryList } from "@director.run/design/test/fixtures/registry/entry-list.ts";
import { mockRegistryEntry } from "@director.run/design/test/fixtures/registry/entry.ts";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const mockConnectionInfo: ConnectionInfo = {
  playbookId: "playbook-1",
  apiKey: "sk_test_abc123def456ghi789",
  streamableUrl: "https://gateway.director.run/mcp/playbook-1",
};

const meta = {
  title: "pages/onboarding",
  component: GetStartedPageView,
  parameters: { layout: "fullscreen" },
  //   decorators: [withLayoutView],
  render: (args) => <StatefulPage {...args} />,
  args: {
    currentPlaybook: null,
    registryEntries: [],
    connectionInfo: undefined,
    isConnectionInfoLoading: false,
    onDone: () => {},
    isCreatePlaybookLoading: false,
    searchQuery: "",
    onSearchQueryChange: () => {},
    onClickRegistryEntry: () => {},
    isPromptCompleted: false,
    onSkipPrompt: () => {},
    onPromptFormSubmit: async () => {},
    isPromptSubmitting: false,
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
      onCreatePlaybook={async () => {}}
    />
  );
}

// step 1a: new playbook
export const Step1a_NewPlaybook: Story = {
  args: {
    currentPlaybook: null,
    registryEntries: [],
    connectionInfo: undefined,
    isConnectionInfoLoading: false,
    isCreatePlaybookLoading: false,
    onPromptFormSubmit: async () => {},
    isPromptSubmitting: false,
  },
};

// step 1b: new playbook loading
export const Step1b_NewPlaybookLoading: Story = {
  args: {
    currentPlaybook: null,
    registryEntries: [],
    connectionInfo: undefined,
    isConnectionInfoLoading: false,
    isCreatePlaybookLoading: true,
    onPromptFormSubmit: async () => {},
    isPromptSubmitting: false,
  },
};

// step 2a: registry entry list (playbook created, no servers yet)
export const Step2a_RegistryEntryList: Story = {
  args: {
    currentPlaybook: { id: "playbook-1", servers: [] },
    registryEntries: mockRegistryEntryList,
    connectionInfo: mockConnectionInfo,
    isConnectionInfoLoading: false,
    isCreatePlaybookLoading: false,
    isPromptCompleted: false,
    onPromptFormSubmit: async () => {},
    isPromptSubmitting: false,
  },
};

// step 2b: registry entry detail (dialog open)
export const Step2b_RegistryEntryDetail: Story = {
  args: {
    currentPlaybook: { id: "playbook-1", servers: [] },
    registryEntries: mockRegistryEntryList,
    connectionInfo: mockConnectionInfo,
    isConnectionInfoLoading: false,
    isCreatePlaybookLoading: false,
    onPromptFormSubmit: async () => {},
    isPromptSubmitting: false,
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

// step 3: prompt step (playbook with a server, prompt not completed)
export const Step3_PromptStep: Story = {
  args: {
    currentPlaybook: { id: "playbook-1", servers: [{ name: "github-mcp" }] },
    registryEntries: mockRegistryEntryList,
    connectionInfo: mockConnectionInfo,
    isConnectionInfoLoading: false,
    isCreatePlaybookLoading: false,
    isPromptCompleted: false,
    onPromptFormSubmit: async () => {},
    isPromptSubmitting: false,
  },
};

// step 4: connect step (playbook with a server, prompt completed)
export const Step4_Connect: Story = {
  args: {
    currentPlaybook: { id: "playbook-1", servers: [{ name: "github-mcp" }] },
    registryEntries: mockRegistryEntryList,
    connectionInfo: mockConnectionInfo,
    isConnectionInfoLoading: false,
    isCreatePlaybookLoading: false,
    isPromptCompleted: true,
    onPromptFormSubmit: async () => {},
    isPromptSubmitting: false,
  },
};

// step 4b: connect loading
export const Step4b_ConnectLoading: Story = {
  args: {
    currentPlaybook: { id: "playbook-1", servers: [{ name: "github-mcp" }] },
    registryEntries: mockRegistryEntryList,
    connectionInfo: undefined,
    isConnectionInfoLoading: true,
    isCreatePlaybookLoading: false,
    isPromptCompleted: true,
    onPromptFormSubmit: async () => {},
    isPromptSubmitting: false,
  },
};

// step 5: final dialog
export const Step5_CompleteDialog: Story = {
  args: {},
  render: () => (
    <GetStartedCompleteDialog
      open
      onClickLibrary={() => {}}
      onClickPlaybook={() => {}}
    />
  ),
};
