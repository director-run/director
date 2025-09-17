import { RegistryDetailSidebar } from "@director.run/studio/components/registry-detail-sidebar.tsx";
import {
  SplitView,
  SplitViewMain,
  SplitViewSide,
} from "@director.run/studio/components/split-view.tsx";
import type { WorkspaceList } from "@director.run/studio/components/types.ts";
import { Container } from "@director.run/studio/components/ui/container.tsx";
import { mockRegistryEntry } from "@director.run/studio/test/fixtures/registry/entry.ts";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { withLayoutView } from "../../helpers/decorators";

const mockProxies: WorkspaceList = [
  {
    id: "dev-proxy",
    name: "Development Proxy",
    description: "Main development proxy",
    prompts: undefined,
    targets: [],
    servers: [],
    path: "/ws/dev-proxy",
  },
  {
    id: "staging-proxy",
    name: "Staging Proxy",
    description: "Staging environment proxy",
    prompts: undefined,
    targets: [],
    servers: [],
    path: "/ws/staging-proxy",
  },
  {
    id: "production-proxy",
    name: "Production Proxy",
    description: "Production environment proxy",
    prompts: undefined,
    targets: [],
    servers: [],
    path: "/ws/production-proxy",
  },
];

// Debug component to show onClickInstall results
const DebugPanel = ({
  installResults,
  clearResults,
}: {
  installResults: Array<{
    timestamp: string;
    params: {
      proxyId?: string;
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
  proxies,
  entryInstalledOn,
  isInstalling = false,
  showDebug = true,
}: {
  entry?: typeof mockRegistryEntry;
  proxies?: WorkspaceList;
  entryInstalledOn?: string[];
  isInstalling?: boolean;
  showDebug?: boolean;
}) => {
  const [installResults, setInstallResults] = useState<
    Array<{
      timestamp: string;
      params: {
        proxyId?: string;
        entryId: string;
        parameters?: Record<string, string>;
      };
      status: string;
      completedAt?: string;
    }>
  >([]);

  const handleClickInstall = async (params: {
    proxyId?: string;
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
              proxies={proxies}
              entryInstalledOn={entryInstalledOn}
              onClickInstall={handleClickInstall}
              isInstalling={isInstalling}
            />
          </SplitViewSide>
        </SplitView>
      </Container>
    </>
  );
};

// 1. With proxies, not installed anywhere
export const NotInstalled: Story = {
  args: {
    entry: mockRegistryEntry,
    onClickInstall: async () => {},
  },
  render: () => <BaseStory proxies={mockProxies} entryInstalledOn={[]} />,
};

// 2. With proxies, installed on some
export const PartiallyInstalled: Story = {
  args: {
    entry: mockRegistryEntry,
    onClickInstall: async () => {},
  },
  render: () => (
    <BaseStory proxies={mockProxies} entryInstalledOn={["dev-proxy"]} />
  ),
};

// 3. With proxies, installed on all
export const FullyInstalled: Story = {
  args: {
    entry: mockRegistryEntry,
    onClickInstall: async () => {},
  },
  render: () => (
    <BaseStory
      proxies={mockProxies}
      entryInstalledOn={["dev-proxy", "staging-proxy", "production-proxy"]}
    />
  ),
};

// 4. No proxies provided (undefined) - should show form without proxy dropdown
export const UndefinedProxies: Story = {
  args: {
    entry: mockRegistryEntry,
    onClickInstall: async () => {},
  },
  render: () => <BaseStory proxies={undefined} entryInstalledOn={[]} />,
};

// 5. Empty proxies array - should show "already installed" message
export const EmptyProxies: Story = {
  args: {
    entry: mockRegistryEntry,
    onClickInstall: async () => {},
  },
  render: () => <BaseStory proxies={[]} entryInstalledOn={[]} />,
};

// 6. Installing state
export const Installing: Story = {
  args: {
    entry: mockRegistryEntry,
    onClickInstall: async () => {},
  },
  render: () => (
    <BaseStory
      proxies={mockProxies}
      entryInstalledOn={["dev-proxy"]}
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
      proxies={mockProxies}
      entryInstalledOn={[]}
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
      proxies={mockProxies}
      entryInstalledOn={["dev-proxy"]}
    />
  ),
};
