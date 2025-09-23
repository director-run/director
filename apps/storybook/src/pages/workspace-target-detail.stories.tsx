import { McpLogo } from "@director.run/studio/components/mcp-logo.tsx";
import { McpDescriptionList } from "@director.run/studio/components/mcp-servers/mcp-description-list.tsx";
import { WorkspaceSectionTools } from "@director.run/studio/components/proxies/workspace-section-tools.tsx";
import type {
  RegistryEntryDetail,
  WorkspaceDetail,
  WorkspaceTarget,
} from "@director.run/studio/components/types.js";
import { Container } from "@director.run/studio/components/ui/container.tsx";
import {
  EmptyState,
  EmptyStateTitle,
} from "@director.run/studio/components/ui/empty-state.tsx";
import { Markdown } from "@director.run/studio/components/ui/markdown.tsx";
import { Section } from "@director.run/studio/components/ui/section.js";
import { SectionHeader } from "@director.run/studio/components/ui/section.js";
import { SectionTitle } from "@director.run/studio/components/ui/section.js";
import { SectionDescription } from "@director.run/studio/components/ui/section.js";
import { mockTools } from "@director.run/studio/test/fixtures/mcp/tools.ts";
import { mockRegistryEntry } from "@director.run/studio/test/fixtures/registry/entry.ts";
import { mockWorkspace } from "@director.run/studio/test/fixtures/workspace/workspace.ts";
import { mockWorkspaceTarget } from "@director.run/studio/test/fixtures/workspace/worskspace-target.ts";
import type { Tool as McpSdkTool } from "@modelcontextprotocol/sdk/types.js";
import type { Meta, StoryObj } from "@storybook/react";
import { withLayoutView } from "../helpers/decorators";

const WorkspaceTargetDetailComponent = ({
  workspaceTarget,
  workspace,
  description,
  tools,
  toolsLoading,
  registryEntry,
}: {
  workspaceTarget: WorkspaceTarget;
  workspace: WorkspaceDetail;
  description?: string | null;
  tools: McpSdkTool[];
  toolsLoading: boolean;
  registryEntry: RegistryEntryDetail;
}) => (
  <Container size="lg">
    <Section>
      <McpLogo src={registryEntry?.icon} className="size-9" />
      <SectionHeader>
        <SectionTitle>{workspaceTarget.name}</SectionTitle>
        <SectionDescription>
          Installed on{" "}
          <button
            onClick={() => console.log(`/${workspace.id}`)}
            className="cursor-pointer text-fg underline"
          >
            {workspace?.name}
          </button>
        </SectionDescription>
      </SectionHeader>

      {description ? <Markdown>{description}</Markdown> : null}
    </Section>

    <Section>
      <SectionHeader>
        <SectionTitle variant="h2" asChild>
          <h3>Transport</h3>
        </SectionTitle>
      </SectionHeader>

      <McpDescriptionList transport={workspaceTarget.transport} />
    </Section>

    <WorkspaceSectionTools
      tools={tools}
      toolsLoading={toolsLoading}
      onToolClick={(tool) => console.log(tool)}
    />

    <Section>
      <SectionHeader>
        <SectionTitle variant="h2" asChild>
          <h3>Readme</h3>
        </SectionTitle>
      </SectionHeader>
      {registryEntry?.readme ? (
        <div className="rounded-md border-[0.5px] bg-accent-subtle/20 px-4 py-8">
          <Markdown className="mx-auto">{registryEntry?.readme}</Markdown>
        </div>
      ) : (
        <EmptyState>
          <EmptyStateTitle>No readme found</EmptyStateTitle>
        </EmptyState>
      )}
    </Section>
  </Container>
);

const meta = {
  title: "pages/workspaces/target-detail",
  component: WorkspaceTargetDetailComponent,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [withLayoutView],
} satisfies Meta<typeof WorkspaceTargetDetailComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockDescription =
  "A comprehensive GitHub integration that provides tools to interact with repositories, issues, pull requests, and more through the Model Context Protocol.";

// Different transport types for variety
const mockHttpTransport = {
  type: "http" as const,
  url: "https://api.github.com/mcp",
};

export const Default: Story = {
  args: {
    workspaceTarget: mockWorkspaceTarget,
    workspace: mockWorkspace,
    registryEntry: mockRegistryEntry,
    description: mockDescription,
    tools: mockTools as McpSdkTool[],
    toolsLoading: false,
  },
};

export const WithHttpTransport: Story = {
  args: {
    ...Default.args,
    workspaceTarget: {
      ...mockWorkspaceTarget,
      transport: mockHttpTransport,
    },
  },
};
export const SparselyPopulated: Story = {
  args: {
    ...Default.args,
    description: null,
    registryEntry: {
      ...mockRegistryEntry,
      icon: null,
      readme: null,
    },
  },
};

export const LongStrings: Story = {
  args: {
    ...Default.args,
    workspace: {
      ...mockWorkspace,
      id: "very-long-proxy-name-that-should-wrap",
      name: "Very Long Proxy Name That Should Wrap Nicely in the UI",
    },
    description:
      "This is a very long description that explains in great detail what this MCP server does, how it works, what features it provides, and how to use it effectively. It should wrap nicely in the UI and provide comprehensive information about the server's capabilities and usage patterns. The description covers all the important aspects that users need to know when working with this particular MCP server implementation.",
  },
};
