import { ConnectionEmptyState } from "@director.run/design/components/connect/connection-empty-state.tsx";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "components/connection-empty-state",
  component: ConnectionEmptyState,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof ConnectionEmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
