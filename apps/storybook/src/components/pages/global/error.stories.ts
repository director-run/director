import { FullScreenError } from "@director.run/studio/src/components/pages/global/error";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "pages/global/error",
  component: FullScreenError,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof FullScreenError>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    errorMessage: "Something went wrong!",
    errorData: {
      foo: "bar",
    },
  },
};
