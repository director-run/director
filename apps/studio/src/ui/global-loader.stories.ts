import { FullScreenLoader } from "@director.run/design/components/pages/global/loader.tsx";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "ui/global-loader",
  component: FullScreenLoader,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof FullScreenLoader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
