import { WaitlistPage } from "@director.run/design/components/pages/auth/waitlist.tsx";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "pages/waitlist",
  component: WaitlistPage,
  parameters: { layout: "fullscreen" },
  args: {
    email: "user@example.com",
    logoutLink: <button type="button">Sign out</button>,
  },
} satisfies Meta<typeof WaitlistPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {
    email: "user@example.com",
    logoutLink: <button type="button">Sign out</button>,
  },
};

export const WithoutEmail: Story = {
  args: {
    email: undefined,
    logoutLink: <button type="button">Sign out</button>,
  },
};

export const WithoutLogout: Story = {
  args: {
    email: "user@example.com",
    logoutLink: undefined,
  },
};
