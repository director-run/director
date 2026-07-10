import type { Meta, StoryObj } from "@storybook/react";
import { ContentGallery } from "./lib/gallery/content-gallery";
import { FormsGallery } from "./lib/gallery/forms-gallery";
import { OverlaysGallery } from "./lib/gallery/overlays-gallery";
import { PrimitivesGallery } from "./lib/gallery/primitives-gallery";

/**
 * Everything at once: all four galleries stacked on a single scrollable page,
 * so the totality of the design system can be examined without switching
 * stories.
 */
function AllComponents() {
  return (
    <div className="flex flex-col gap-y-20 p-8">
      <PrimitivesGallery />
      <FormsGallery />
      <OverlaysGallery />
      <ContentGallery />
    </div>
  );
}

const meta = {
  title: "kitchen-sink/components/all-components",
  component: AllComponents,
  parameters: {
    layout: "fullscreen",
    chromatic: { disableSnapshot: true },
  },
} satisfies Meta<typeof AllComponents>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
