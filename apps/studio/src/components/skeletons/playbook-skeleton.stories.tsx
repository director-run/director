import { PlaybookSkeleton } from "@director.run/design/components/playbooks/playbook-skeleton.tsx";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "components/skeletons/playbook-skeleton",
  component: PlaybookSkeleton,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof PlaybookSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
