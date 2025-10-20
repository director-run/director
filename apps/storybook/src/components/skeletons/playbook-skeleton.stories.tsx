import { ProxySkeleton } from "@director.run/design/components/playbooks/playbook-skeleton.tsx";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "components/skeletons/playbook-skeleton",
  component: ProxySkeleton,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof ProxySkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
