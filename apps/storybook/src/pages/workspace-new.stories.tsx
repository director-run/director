import { ProxyNew } from "@director.run/studio/components/pages/proxy-new.tsx";
import type { ProxyFormData } from "@director.run/studio/components/proxies/proxy-form.tsx";
import type { Meta, StoryObj } from "@storybook/react";
import { withLayoutView } from "../helpers/decorators";

const meta = {
  title: "pages/workspaces/new",
  component: ProxyNew,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [withLayoutView],
} satisfies Meta<typeof ProxyNew>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockSubmit = async (values: ProxyFormData) => {
  console.log("Submitting proxy:", values);
  await new Promise((resolve) => setTimeout(resolve, 1000));
};

export const Default: Story = {
  args: {
    title: "New proxy",
    description: "Create a new proxy to start using MCP.",
    onSubmit: mockSubmit,
    isSubmitting: false,
    submitLabel: "Create proxy",
  },
};

export const Submitting: Story = {
  args: {
    ...Default.args,
    isSubmitting: true,
  },
};
