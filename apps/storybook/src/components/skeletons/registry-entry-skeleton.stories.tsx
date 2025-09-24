import { RegistryEntrySkeleton } from "@director.run/design/components/registry/registry-entry-skeleton.tsx";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "components/skeletons/registry-entry-skeleton",
  component: RegistryEntrySkeleton,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof RegistryEntrySkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
