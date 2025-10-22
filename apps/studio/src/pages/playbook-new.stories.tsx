import { PlaybookCreate } from "@director.run/design/components/pages/playbook-new.tsx";
import type { PlaybookFormData } from "@director.run/design/components/playbooks/playbook-form.tsx";
import type { Meta, StoryObj } from "@storybook/react";
import { withLayoutView } from "../helpers/decorators";

const meta = {
  title: "pages/playbooks/new",
  component: PlaybookCreate,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [withLayoutView],
} satisfies Meta<typeof PlaybookCreate>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockSubmit = async (values: PlaybookFormData) => {
  console.log("Submitting playbook:", values);
  await new Promise((resolve) => setTimeout(resolve, 1000));
};

export const Default: Story = {
  args: {
    onSubmit: mockSubmit,
    isSubmitting: false,
  },
};

export const Submitting: Story = {
  args: {
    ...Default.args,
    isSubmitting: true,
  },
};
