import { ToolsList } from "@director.run/design/components/tools/tool-list.tsx";
import { Container } from "@director.run/design/components/ui/container.tsx";
import { mockTools } from "@director.run/design/test/fixtures/mcp/tools.ts";
import type { Meta, StoryObj } from "@storybook/react";
import { withLayoutView } from "../../helpers/decorators";

const meta = {
  title: "components/tools/tools-list",
  component: ToolsList,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [withLayoutView],
} satisfies Meta<typeof ToolsList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tools: mockTools,
    toolsLoading: false,
  },
  render: (args) => (
    <Container size="lg">
      <ToolsList {...args} />
    </Container>
  ),
};

export const Loading: Story = {
  args: {
    tools: [],
    toolsLoading: true,
  },
  render: (args) => (
    <Container size="lg">
      <ToolsList {...args} />
    </Container>
  ),
};

export const Empty: Story = {
  args: {
    tools: [],
    toolsLoading: false,
  },
  render: (args) => (
    <Container size="lg">
      <ToolsList {...args} />
    </Container>
  ),
};
