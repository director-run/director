import type { Meta, StoryObj } from "@storybook/react";
import { ContentGallery } from "./lib/gallery/content-gallery";

/**
 * Layout and content components — containers, sections, lists, tabs, menus,
 * breadcrumbs, markdown, JSON schema and the domain cards built on them.
 */
const meta = {
  title: "kitchen-sink/components/content",
  component: ContentGallery,
  parameters: { layout: "padded" },
} satisfies Meta<typeof ContentGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
