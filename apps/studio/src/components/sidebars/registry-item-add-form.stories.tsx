import { RegistryDetailSidebar } from "@director.run/design/components/registry-detail-sidebar.tsx";
import {
  SplitView,
  SplitViewMain,
  SplitViewSide,
} from "@director.run/design/components/split-view.tsx";
import type { PlaybookList } from "@director.run/design/components/types.ts";
import { Container } from "@director.run/design/components/ui/container.tsx";
import { mockRegistryEntry } from "@director.run/design/test/fixtures/registry/entry.ts";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { withLayoutView } from "../../helpers/decorators";

const mockPlaybooks: PlaybookList = [
  {
    id: "dev-playbook",
    name: "Development Playbook",
    description: "Main development playbook",
    userId: "test-user-id",
    prompts: undefined,
    servers: [],
    paths: {
      streamable: "/ws/dev-playbook",
    },
  },
  {
    id: "staging-playbook",
    name: "Staging Playbook",
    description: "Staging environment playbook",
    userId: "test-user-id",
    prompts: undefined,
    servers: [],
    paths: {
      streamable: "/ws/staging-playbook",
    },
  },
  {
    id: "production-playbook",
    name: "Production Playbook",
    description: "Production environment playbook",
    userId: "test-user-id",
    prompts: undefined,
    servers: [],
    paths: {
      streamable: "/ws/production-playbook",
    },
  },
];

// Debug component to show onClickInstall results
const DebugPanel = ({
  installResults,
  clearResults: _clearResults,
}: {
  installResults: Array<{
    timestamp: string;
    params: {
      playbookId?: string;
      entryId: string;
      parameters?: Record<string, string>;
    };
    status: string;
    completedAt?: string;
  }>;
  clearResults: () => void;
}) => (
  <>
    {installResults.length === 0 ? (
      <p style={{ margin: 0, color: "#666", fontSize: 14 }}>
        No install calls yet
      </p>
    ) : (
      <div>
        {installResults.map((result, index) => (
          <div
            key={index}
            style={{
              marginBottom: 12,
              padding: 8,
              background: "#f8f9fa",
              borderRadius: 4,
              border: "1px solid #e9ecef",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
              Call #{index + 1}
            </div>
            <pre
              style={{
                margin: 0,
                fontSize: 11,
                color: "#333",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    )}
  </>
);

const meta = {
  title: "components/sidebars/registry-item-detail-sidebar",
  component: RegistryDetailSidebar,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [withLayoutView],
} satisfies Meta<typeof RegistryDetailSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Base story with debug panel
const BaseStory = ({
  entry = mockRegistryEntry,
  playbooks,
  isInstalling = false,
  showDebug = true,
  onClickCancel,
}: {
  entry?: typeof mockRegistryEntry;
  playbooks?: PlaybookList;
  isInstalling?: boolean;
  showDebug?: boolean;
  onClickCancel?: () => void;
}) => {
  const [installResults, setInstallResults] = useState<
    Array<{
      timestamp: string;
      params: {
        playbookId?: string;
        entryId: string;
        parameters?: Record<string, string>;
      };
      status: string;
      completedAt?: string;
    }>
  >([]);

  const handleClickInstall = async (params: {
    playbookId?: string;
    entryId: string;
    parameters?: Record<string, string>;
  }) => {
    setInstallResults((prev) => [
      ...prev,
      {
        timestamp: new Date().toISOString(),
        params,
        status: "completed",
      },
    ]);
  };

  const clearResults = () => setInstallResults([]);

  return (
    <>
      <Container size="xl">
        <SplitView>
          <SplitViewMain>
            {showDebug && (
              <DebugPanel
                installResults={installResults}
                clearResults={clearResults}
              />
            )}
          </SplitViewMain>
          <SplitViewSide>
            <RegistryDetailSidebar
              entry={entry}
              playbooks={playbooks}
              onClickInstall={handleClickInstall}
              isInstalling={isInstalling}
              onClickCancel={onClickCancel}
            />
          </SplitViewSide>
        </SplitView>
      </Container>
    </>
  );
};

// 1. With playbooks, not installed anywhere
export const NotInstalled: Story = {
  args: {
    entry: mockRegistryEntry,
    onClickInstall: async () => {},
  },
  render: () => <BaseStory playbooks={mockPlaybooks} />,
};

// 2. With playbooks, installed on some
export const PartiallyInstalled: Story = {
  args: {
    entry: mockRegistryEntry,
    onClickInstall: async () => {},
  },
  render: () => (
    <BaseStory
      playbooks={mockPlaybooks.map((p) =>
        p.id === "dev-playbook"
          ? {
              ...p,
              servers: [
                {
                  name: mockRegistryEntry.name,
                  type: "stdio",
                  command: "npx",
                  args: ["-y", "@upstash/context7-mcp"],
                  env: {},
                },
              ],
            }
          : { ...p, servers: [] },
      )}
    />
  ),
};

// 3. With playbooks, installed on all
export const FullyInstalled: Story = {
  args: {
    entry: mockRegistryEntry,
    onClickInstall: async () => {},
  },
  render: () => (
    <BaseStory
      playbooks={mockPlaybooks.map((p) => ({
        ...p,
        servers: [
          {
            name: mockRegistryEntry.name,
            type: "stdio",
            command: "npx",
            args: ["-y", "@upstash/context7-mcp"],
            env: {},
          },
        ],
      }))}
    />
  ),
};

// 4. No playbooks provided (undefined) - should show form without playbook dropdown
export const UndefinedPlaybooks: Story = {
  args: {
    entry: mockRegistryEntry,
    onClickInstall: async () => {},
  },
  render: () => <BaseStory playbooks={undefined} onClickCancel={() => {}} />,
};

// 5. Empty playbooks array - should show "already installed" message
export const EmptyPlaybooks: Story = {
  args: {
    entry: mockRegistryEntry,
    onClickInstall: async () => {},
  },
  render: () => <BaseStory playbooks={[]} />,
};

// 6. Installing state
export const Installing: Story = {
  args: {
    entry: mockRegistryEntry,
    onClickInstall: async () => {},
  },
  render: () => (
    <BaseStory
      playbooks={mockPlaybooks.map((p) =>
        p.id === "dev-playbook"
          ? {
              ...p,
              servers: [
                {
                  name: mockRegistryEntry.name,
                  type: "stdio",
                  command: "npx",
                  args: ["-y", "@upstash/context7-mcp"],
                  env: {},
                },
              ],
            }
          : { ...p, servers: [] },
      )}
      isInstalling={true}
    />
  ),
};

// 8. Entry with no parameters
export const NoParameters: Story = {
  args: {
    entry: mockRegistryEntry,
    onClickInstall: async () => {},
  },
  render: () => (
    <BaseStory
      entry={{
        ...mockRegistryEntry,
        parameters: [],
      }}
      playbooks={mockPlaybooks}
    />
  ),
};

// 9. Entry with complex parameters
export const ComplexParameters: Story = {
  args: {
    entry: mockRegistryEntry,
    onClickInstall: async () => {},
  },
  render: () => (
    <BaseStory
      entry={{
        ...mockRegistryEntry,
        parameters: [
          {
            type: "string",
            name: "apiKey",
            description: "API Key for authentication",
            required: true,
            password: true,
          },
          {
            type: "string",
            name: "baseUrl",
            description: "Base URL for the API",
            required: false,
          },
          {
            type: "string",
            name: "timeout",
            description: "Request timeout in milliseconds",
            required: false,
          },
        ],
      }}
      playbooks={mockPlaybooks.map((p) =>
        p.id === "dev-playbook"
          ? {
              ...p,
              servers: [
                {
                  name: mockRegistryEntry.name,
                  type: "stdio",
                  command: "npx",
                  args: ["-y", "@upstash/context7-mcp"],
                  env: {},
                },
              ],
            }
          : { ...p, servers: [] },
      )}
    />
  ),
};
