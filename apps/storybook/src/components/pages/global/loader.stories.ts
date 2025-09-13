import type { Meta, StoryObj } from "@storybook/react";
import { FullScreenLoader } from "@director.run/studio/src/components/pages/global/loader";

const meta = {
  title: "pages/global/loader",
  component: FullScreenLoader,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof FullScreenLoader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
