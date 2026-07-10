import type { Meta, StoryObj } from "@storybook/react";
import { FormsGallery } from "./lib/gallery/forms-gallery";

/**
 * Form building blocks and the higher-level forms composed from them, with
 * validation and submitting states.
 */
const meta = {
  title: "kitchen-sink/components/forms",
  component: FormsGallery,
  parameters: { layout: "padded" },
} satisfies Meta<typeof FormsGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DarkMode: Story = {
  globals: { darkMode: true },
};
