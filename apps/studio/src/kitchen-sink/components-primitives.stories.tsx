import type { Meta, StoryObj } from "@storybook/react";
import { PrimitivesGallery } from "./lib/gallery/primitives-gallery";

/**
 * Every low-level UI primitive (buttons, badges, inputs, typography, loaders,
 * icons) with its variants, sizes and states on one page.
 */
const meta = {
  title: "kitchen-sink/components/primitives",
  component: PrimitivesGallery,
  parameters: {
    layout: "padded",
    // ScrambleText and Loader animate via setInterval — skip visual snapshots.
    chromatic: { disableSnapshot: true },
  },
} satisfies Meta<typeof PrimitivesGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
