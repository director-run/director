import type { Meta, StoryObj } from "@storybook/react";
import { OverlaysGallery } from "./lib/gallery/overlays-gallery";

/**
 * Overlay components — dialogs, alert dialogs, sheets, popovers, dropdown
 * menus and toasts — each with a trigger and, where useful, an open variant.
 */
const meta = {
  title: "kitchen-sink/components/overlays",
  component: OverlaysGallery,
  parameters: { layout: "padded" },
} satisfies Meta<typeof OverlaysGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
