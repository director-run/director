import { RegistryLibrarySkeleton } from "@director.run/design/components/registry/registry-library-skeleton.tsx";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "components/skeletons/registry-library-skeleton",
  component: RegistryLibrarySkeleton,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof RegistryLibrarySkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
