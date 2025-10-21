import { FullScreenError } from "@director.run/design/components/pages/global/error.tsx";
import type { Meta, StoryObj } from "@storybook/react";
import { withLayoutView } from "../helpers/decorators";

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
    title: "Unexpected Error",
    subtitle: "Something went wrong",
    fullScreen: true,
    icon: "director",
    data: {
      foo: "bar",
    },
  },
};

export const PlaybookNotFound: Story = {
  args: {
    title: "Playbook Not Found",
    subtitle: "The playbook you are looking for does not exist.",
    fullScreen: false,
    icon: "dead-smiley",
  },
  decorators: [withLayoutView],
};

export const ConnectionIssue: Story = {
  args: {
    title: "Can't connect to the backend",
    subtitle: "Make sure director is running and refresh the page.",
    fullScreen: true,
    icon: "plugs",
    data: ["# Start director", "$ director serve", "$ director studio"].join(
      "\n",
    ),
  },
};
