import { WorkspaceTargetDetailContent } from "@director.run/design/components/workspaces/workspace-target-detail-content.tsx";
import { mockTools } from "@director.run/design/test/fixtures/mcp/tools.ts";
import { mockRegistryEntry } from "@director.run/design/test/fixtures/registry/entry.ts";
import { mockWorkspace } from "@director.run/design/test/fixtures/workspace/workspace.ts";
import { mockWorkspaceTarget } from "@director.run/design/test/fixtures/workspace/worskspace-target.ts";
import type { Meta, StoryObj } from "@storybook/react";
import { withLayoutView } from "../helpers/decorators";

const meta = {
  title: "pages/workspaces/target-detail",
  component: WorkspaceTargetDetailContent,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [withLayoutView],
} satisfies Meta<typeof WorkspaceTargetDetailContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    workspaceTarget: mockWorkspaceTarget,
    workspace: mockWorkspace(),
    registryEntry: mockRegistryEntry,
    tools: mockTools,
    toolsLoading: false,
    navigate: () => console.log("navigate"),
    workspaceId: "workspace-id",
  },
};

export const WithHttpTransport: Story = {
  args: {
    ...Default.args,
    workspaceTarget: {
      ...mockWorkspaceTarget,
      type: "http",
      url: "https://api.github.com/mcp",
    },
  },
};
export const SparselyPopulated: Story = {
  args: {
    ...Default.args,
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
      ...mockWorkspace(),
      id: "very-long-proxy-name-that-should-wrap",
      name: "Very Long Proxy Name That Should Wrap Nicely in the UI",
    },
  },
};
