import { ToolList } from "@director.run/design/components/tools/tool-list.tsx";
import { Container } from "@director.run/design/components/ui/container.tsx";
import { mockTools } from "@director.run/design/test/fixtures/mcp/tools.ts";
import type { Meta, StoryObj } from "@storybook/react";
import { withLayoutView } from "../../helpers/decorators";

const meta = {
  title: "components/tools/tools-list",
  parameters: {
    layout: "fullscreen",
  },
  decorators: [withLayoutView],
  render: (args) => (
    <Container size="lg">
      <ToolList {...args} />
    </Container>
  ),
} satisfies Meta<typeof ToolList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tools: mockTools(),
    toolsLoading: false,
    editable: true,
    onUpdateTools: (tools) => {
      console.log("onUpdateTools", tools);
    },
  },
};

export const Saving: Story = {
  args: {
    tools: mockTools(),
    toolsLoading: false,
    editable: true,
    isSaving: true,
  },
};

export const NotEditable: Story = {
  args: {
    tools: mockTools(),
    toolsLoading: false,
  },
};

export const Loading: Story = {
  args: {
    tools: [],
    toolsLoading: true,
  },
};

export const Empty: Story = {
  args: {
    tools: [],
    toolsLoading: false,
  },
};
