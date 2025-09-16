import { FullScreenError } from "@director.run/studio/components/pages/global/error.tsx";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "ui/global-error",
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
